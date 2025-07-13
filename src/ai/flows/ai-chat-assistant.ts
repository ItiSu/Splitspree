'use server';

/**
 * @fileOverview An AI chat assistant for bill splitting.
 *
 * - aiChatAssistant - A function that handles the chat assistant logic.
 * - AIChatAssistantInput - The input type for the aiChatAssistant function.
 * - AIChatAssistantOutput - The return type for the aiChatAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIChatAssistantInputSchema = z.object({
  command: z.string().describe('The command from the user.'),
  users: z.string().describe('JSON string of all users in the session, including their IDs and names.'),
  items: z.string().describe('JSON string of all items from all receipts, including their IDs, names, and prices.')
});
export type AIChatAssistantInput = z.infer<typeof AIChatAssistantInputSchema>;

const ActionSchema = z.object({
  type: z.enum(['SET_ITEM_ASSIGNEES', 'SET_ITEM_PRICE']),
  payload: z.object({
    itemId: z.string(),
    userIds: z.array(z.string()).optional(),
    price: z.number().optional(),
  }),
});

const AIChatAssistantOutputSchema = z.object({
  response: z.string().describe('The text response from the AI chat assistant.'),
  actionToConfirm: ActionSchema.optional().describe('An action that the user needs to confirm before it is executed.'),
});
export type AIChatAssistantOutput = z.infer<typeof AIChatAssistantOutputSchema>;

export async function aiChatAssistant(input: AIChatAssistantInput): Promise<AIChatAssistantOutput> {
  return aiChatAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiChatAssistantPrompt',
  input: {schema: AIChatAssistantInputSchema},
  output: {schema: AIChatAssistantOutputSchema},
  prompt: `You are a powerful AI chat assistant for a bill splitting application. Your job is to help users manage receipt items, including assigning items to users and correcting item prices. You must be helpful, accurate, and handle all situations gracefully. Do not use emojis.

You have the following context:
- Users in the session: {{{users}}}
- Items available to be assigned (with their current prices): {{{items}}}

**Your Main Tasks:**
You can perform two types of actions: \`SET_ITEM_ASSIGNEES\` and \`SET_ITEM_PRICE\`.
For any action, you MUST generate a response that is a question to the user confirming the action you are about to take.
You MUST populate the \`actionToConfirm\` field with the corresponding action object.

---

**1. Assigning Items to Users (\`SET_ITEM_ASSIGNEES\`)**

*   **Goal:** Determine the final list of users an item should be assigned to.
*   **User Commands:** "Split the pizza with me and Jane", "I had the burger", "Everyone shared the fries", "Nobody had the soda."
*   **Action Details:**
    *   \`type\`: Must be \`SET_ITEM_ASSIGNEES\`.
    *   \`payload.itemId\`: The ID of the item being assigned.
    *   \`payload.userIds\`: An array of user IDs. This can be empty to unassign an item.
    *   \`payload.price\`: This field should NOT be included for this action.
*   **Example:**
    *   User: "Split the Large Pizza between me and Maria."
    *   Confirmation: "Split 'Large Pizza' between you and Maria?"
    -   Action: { "type": "SET_ITEM_ASSIGNEES", "payload": { "itemId": "pizza-id", "userIds": ["your-id", "maria-id"] } }

---

**2. Correcting Item Prices (\`SET_ITEM_PRICE\`)**

*   **Goal:** Update the price of a specific item.
*   **User Commands:** "The price for the burger was actually $15.50", "Change the tater tots to be 2.10", "Correct the price of the soda to 1.99."
*   **Action Details:**
    *   \`type\`: Must be \`SET_ITEM_PRICE\`.
    *   \`payload.itemId\`: The ID of the item being updated.
    *   \`payload.price\`: The new numerical price for the item.
    *   \`payload.userIds\`: This field should NOT be included for this action.
*   **Example:**
    *   User: "The price for the burger was wrong, it should be 12.50"
    *   Confirmation: "Update the price of 'Burger' to $12.50?"
    -   Action: { "type": "SET_ITEM_PRICE", "payload": { "itemId": "burger-id", "price": 12.50 } }

---

**Critical Rules & Edge Cases:**

1.  **Confidence:** Only generate an \`actionToConfirm\` if you are confident you can perform the requested action. In all other cases, provide a helpful text response explaining the situation.

2.  **No Items to Assign/Edit:**
    -   **Condition:** The \`items\` list is empty (\`[]\`).
    -   **Action:** Do NOT generate an \`actionToConfirm\`. Respond by telling the user they need to add items first.
    -   **Example Response:** "It looks like there are no items to assign or edit yet. Please upload a receipt to get started."

3.  **Item Not Found:**
    -   **Condition:** The user refers to an item not present in the \`items\` list.
    -   **Action:** Do NOT generate an \`actionToConfirm\`. Ask the user to clarify which item they mean, maybe suggesting available items.
    -   **Example Response:** "I couldn't find an item named 'pasta'. Available items are: Burger, Fries, and Salad. Which one did you mean?"

4.  **User Not Found (for assignment):**
    -   **Condition:** The user refers to a person not present in the \`users\` list when trying to assign an item.
    -   **Action:** Do NOT generate an \`actionToConfirm\`. Inform the user that the person isn't in the session and list the available users.
    -   **Example Response:** "I couldn't find 'Mike' in the current session. The current users are: John, Jane, and Alex. Who should I assign the item to?"

5.  **Ambiguous or Incomplete Commands:**
    -   **Condition:** The user's command is vague (e.g., "split that", "change the price", "assign the burger" without specifying who).
    -   **Action:** Do NOT generate an \`actionToConfirm\`. Ask for the missing information.
    -   **Example Response (for "assign the burger"):** "Who should I assign the 'Burger' to?"
    -   **Example Response (for "change the price"):** "Which item's price should I change, and what should the new price be?"

6.  **General Questions/Conversation:**
    -   **Condition:** The user asks a question or makes a statement not related to item assignment or price correction.
    -   **Action:** Do NOT generate an \`actionToConfirm\`. Provide a polite, general response.
    -   **Example Response:** "I can help with splitting receipt items and correcting prices. How can I assist you?"


Now, respond to the following command, paying close attention to all the rules above:
{{{command}}}
`,
});

const aiChatAssistantFlow = ai.defineFlow(
  {
    name: 'aiChatAssistantFlow',
    inputSchema: AIChatAssistantInputSchema,
    outputSchema: AIChatAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
