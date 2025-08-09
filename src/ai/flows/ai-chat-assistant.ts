'use server';

/**
 * @fileOverview An AI chat assistant for bill splitting.
 *
 * Handles ALL user request variations:
 * - Assigning one/multiple items to users
 * - Splitting items by percent, amount, or evenly
 * - Assigning all items to all/selected users
 * - Removing assignments
 * - Clearing all splits
 * - Bulk edits
 * - Updating prices
 * - Undo actions
 * - Clarifying ambiguous commands
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

// ---------- SCHEMAS ----------
const AIChatAssistantInputSchema = z.object({
  command: z.string().describe('The command from the user.'),
  users: z.string().describe('JSON string of all users in the session, including their IDs and names.'),
  items: z.string().describe('JSON string of all items from all receipts, including their IDs, names, and prices.')
});
export type AIChatAssistantInput = z.infer<typeof AIChatAssistantInputSchema>;

// Expanded action types with safe percentage/amount schema
const ActionSchema = z.object({
  type: z.enum([
    'SET_ITEM_ASSIGNEES',       // Assign item to specific users
    'SET_ITEM_PRICE',           // Update price of item
    'CLEAR_ITEM_ASSIGNEES',     // Remove all assignments from item
    'ASSIGN_ALL_ITEMS',         // Assign all items to specific users
    'SPLIT_ITEM_PERCENT',       // Split an item by percentage
    'SPLIT_ITEM_AMOUNT',        // Split an item by fixed amounts
    'RESET_ALL_SPLITS',         // Clear all splits in the bill
    'UNDO_LAST_ACTION'          // Undo last action
  ]),
  payload: z.object({
    itemId: z.string().optional().describe('ID of a single item'),
    itemIds: z.array(z.string()).optional().describe('IDs of multiple items'),
    userIds: z.array(z.string()).optional().describe('IDs of users involved in the action'),
    price: z.number().optional().describe('Updated price for SET_ITEM_PRICE'),
    percentages: z.array(z.object({
      userId: z.string().describe('User ID'),
      percentage: z.number().describe('Percentage for this user')
    })).optional().describe('List of percentage splits per user'),
    amounts: z.array(z.object({
      userId: z.string().describe('User ID'),
      amount: z.number().describe('Fixed amount for this user')
    })).optional().describe('List of fixed amount splits per user'),
  }),
});

const AIChatAssistantOutputSchema = z.object({
  response: z.string().describe('The text response from the AI chat assistant.'),
  actionToConfirm: ActionSchema.optional().describe('An action that the user needs to confirm before it is executed.'),
});
export type AIChatAssistantOutput = z.infer<typeof AIChatAssistantOutputSchema>;

// ---------- ENTRY FUNCTION ----------
export async function aiChatAssistant(input: AIChatAssistantInput): Promise<AIChatAssistantOutput> {
  return aiChatAssistantFlow(input);
}

// ---------- PROMPT ----------
const prompt = ai.definePrompt({
  name: 'aiChatAssistantPrompt',
  input: { schema: AIChatAssistantInputSchema },
  output: { schema: AIChatAssistantOutputSchema },
  prompt: `
You are SplitSpree AI Assistant — an advanced bill-splitting AI.
Your role is to interpret *any possible* natural language command from the user and return:
- A conversational \`response\` (confirmation or clarification)
- An optional \`actionToConfirm\` object with type + payload that the app will execute if confirmed.

You have these users:
{{{users}}}
You have these items with prices:
{{{items}}}

-----------------
## SUPPORTED ACTIONS
You can return ONLY these action types:
1. SET_ITEM_ASSIGNEES — Assign one/more items to specific users
2. SET_ITEM_PRICE — Change price of one item
3. CLEAR_ITEM_ASSIGNEES — Remove all users from one/more items
4. ASSIGN_ALL_ITEMS — Assign all items to specific users
5. SPLIT_ITEM_PERCENT — Assign by percentage (array of {userId, percentage})
6. SPLIT_ITEM_AMOUNT — Assign by fixed amounts (array of {userId, amount})
7. RESET_ALL_SPLITS — Remove all assignments for all items
8. UNDO_LAST_ACTION — Undo the last confirmed action

-----------------
## RULES & EDGE CASES

1. If items list is empty → no actions, reply: "Please upload a receipt first."
2. If item name in command not found → no action, suggest correct names.
3. If user in command not found → no action, list valid users.
4. If command vague (missing who/what) → no action, ask for missing info.
5. Support references like "me", "everyone", "everyone except John".
6. Support multiple items in one request.
7. Support price updates with currency symbols or decimals.
8. If multiple unrelated actions in one request → pick most important, confirm, suggest doing others after.
9. Always clarify before destructive actions (RESET_ALL_SPLITS, CLEAR_ITEM_ASSIGNEES).
10. Maintain conversational memory for follow-ups like "do the same for fries".
11. If unsure → clarify instead of guessing.

-----------------
## EXAMPLES

User: "Split pizza between me and Sarah"
→ response: "Split 'Pizza' between you and Sarah?"
→ actionToConfirm: { type: "SET_ITEM_ASSIGNEES", payload: { itemId: "pizza-id", userIds: ["me-id","sarah-id"] } }

User: "Give all items to everyone"
→ response: "Assign all items to all users?"
→ actionToConfirm: { type: "ASSIGN_ALL_ITEMS", payload: { userIds: ["id1","id2","id3"] } }

User: "Sarah pays 70% for pizza, John 30%"
→ response: "Split 'Pizza' 70% to Sarah, 30% to John?"
→ actionToConfirm: { type: "SPLIT_ITEM_PERCENT", payload: { itemId: "pizza-id", percentages: [{ "userId": "sarah-id", "percentage": 70 }, { "userId": "john-id", "percentage": 30 }] } }

User: "Undo last"
→ response: "Undo the last change?"
→ actionToConfirm: { type: "UNDO_LAST_ACTION", payload: {} }

-----------------
Now respond to:
{{{command}}}
`
});

// ---------- FLOW ----------
const aiChatAssistantFlow = ai.defineFlow(
  {
    name: 'aiChatAssistantFlow',
    inputSchema: AIChatAssistantInputSchema,
    outputSchema: AIChatAssistantOutputSchema,
  },
  async input => {
    const { output } = await prompt(input);
    return output!;
  }
);
