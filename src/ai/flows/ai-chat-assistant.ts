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

// Check if AI is available (should only be available server-side)
if (!ai) {
  throw new Error('AI is not available in this environment');
}

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
- A conversational \`response\` (answer, confirmation or clarification)
- Only include \`actionToConfirm\` when the user explicitly requests an action that modifies the bill (assignments, splits, price changes, etc.)

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
## STRICT RULES FOR CONFIRMATION BUTTONS

ONLY include actionToConfirm when ALL these conditions are met:
1. The command is CLEARLY an action request (assign, split, update price, etc.)
2. ALL required parameters are provided (item, users, amounts if needed)
3. The action matches one of the SUPPORTED ACTIONS types

NEVER include actionToConfirm when:
1. Asking for clarification ("Please specify...")
2. Providing information ("Here are the items...")
3. Explaining how to use the system
4. The command is ambiguous or incomplete
5. Listing available items/users
6. Responding to general questions

## EDGE CASES

1. Empty items list → "Please upload a receipt first." (no buttons)
2. Item/user not found → "Couldn't find [name]. Available: [list]" (no buttons)
3. Vague command → "Please specify [what's missing]" (no buttons)
4. Multiple actions → Process most important first (one set of buttons)
5. Destructive actions → Extra confirmation text (include buttons)
6. Follow-ups → Maintain context from previous messages

-----------------
## EXAMPLES

User: "Split pizza between me and Sarah"
→ response: "Split 'Pizza' between you and Sarah?"
→ actionToConfirm: { type: "SET_ITEM_ASSIGNEES", payload: { itemId: "pizza-id", userIds: ["me-id","sarah-id"] } }

User: "Give all items to everyone"
→ response: "Assign all items to all users?"
→ actionToConfirm: { type: "ASSIGN_ALL_ITEMS", payload: { userIds: ["id1","id2","id3"] } }

User: "Bikash pays 70% for pizza, John 30%"
→ response: "Split 'Pizza' 70% to Bikash, 30% to John?"
→ actionToConfirm: { type: "SPLIT_ITEM_PERCENT", payload: { itemId: "pizza-id", percentages: [{ "userId": "bikash-id", "percentage": 70 }, { "userId": "john-id", "percentage": 30 }] } }

User: "Undo last"
→ response: "Undo the last change?"
→ actionToConfirm: { type: "UNDO_LAST_ACTION", payload: {} }

User: "How do I split an item?"
→ response: "You can say 'Split [item] between [users]' or 'Split [item] 50/50 between [users]'"
→ (no actionToConfirm)

User: "What items do we have?"
→ response: "Here are the items: [list items]"
→ (no actionToConfirm)

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
