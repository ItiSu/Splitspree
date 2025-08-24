// src/ai/flows/parse-receipt.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for parsing receipt images and extracting data.
 *
 * - parseReceipt - A function that takes a receipt image as input and returns the extracted data.
 * - ParseReceiptInput - The input type for the parseReceipt function.
 * - ParseReceiptOutput - The return type for the parseReceipt function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseReceiptInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A receipt image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ParseReceiptInput = z.infer<typeof ParseReceiptInputSchema>;

const ParseReceiptOutputSchema = z.object({
  storeName: z.string().describe('The name of the store.'),
  date: z.string().describe('The date on the receipt.'),
  items: z
    .array(
      z.object({
        name: z.string().describe('The name of the item.'),
        price: z.number().describe('The total price of the item, accounting for quantity.'),
        description: z.string().describe('A clarified, common name for the item. If the item has quantity/unit details, include them. E.g., "Snack Bars ($1.50 each x 3)" or "Avocados ($0.99 per lb x 2.5)".'),
      })
    )
    .describe('A list of items on the receipt.'),
  subtotal: z.number().describe('The subtotal of the receipt.'),
  tax: z.number().describe('The tax amount on the receipt.'),
  tip: z.number().describe('The tip amount on the receipt.'),
  total: z.number().describe('The total amount on the receipt.'),
});
export type ParseReceiptOutput = z.infer<typeof ParseReceiptOutputSchema>;

export async function parseReceipt(input: ParseReceiptInput): Promise<ParseReceiptOutput> {
  if (!ai) {
    throw new Error("AI not initialized");
  }
  return parseReceiptFlow(input);
}

const parseReceiptPrompt = ai!.definePrompt({
  name: 'parseReceiptPrompt',
  input: {schema: ParseReceiptInputSchema},
  output: {schema: ParseReceiptOutputSchema},
  prompt: `You are an expert receipt parser. First, verify the image is actually a receipt. If it's not a receipt, respond with "NOT_A_RECEIPT". Otherwise, extract information with the highest accuracy.

**Pricing Rules:**
- For each line item, you MUST extract the final total price for that item.
- If an item lists a quantity and a price-per-unit (e.g., "3 @ $0.70"), you MUST calculate the total price (e.g., $2.10). Do not use the unit price as the final price.
- If a line only shows a single price, use that as the total price for the item.

**Item Description Rules:**
- For each item, you must provide a 'description'.
- The description should be a clarified, common name for the item based on the receipt name.
- If the item name on the receipt is cryptic or abbreviated (e.g., "HRI CL CHS"), use your knowledge to provide a more common name (e.g., "Hillshire Farm Cheddar Cheese").
- **Accuracy is critical.** Do not guess. Use your extensive knowledge to identify the item as if you were performing an internet search to find the most likely product.
- If the name is already clear and common (e.g., "Apple"), just repeat the name for the description.
- **Important - Handling Quantity and Unit Price:**
  - If a line item includes details about quantity and unit price, you MUST include this in the description.
  - **Items by Count:** For items sold by discrete units, use the format "($<unit_price> each x <quantity>)". Example: For "3 SNACK BARS @ $1.50", the description should include "($1.50 each x 3)".
  - **Items by Weight/Volume:** For items sold by weight (e.g., lb, kg, oz) or volume, use the format "($<unit_price> per <unit> x <quantity>)". Example: For "2.5 lb BANANAS @ $0.50/LB", the description should include "($0.50 per lb x 2.5)".
- If there is no quantity information, just provide the clarified item name.
- Your description MUST be confident and MUST NOT end with a question mark.

Receipt Image: {{media url=receiptDataUri}}

Return the data in JSON format, adhering strictly to the rules above.
`,
});

const parseReceiptFlow = ai!.defineFlow(
  {
    name: 'parseReceiptFlow',
    inputSchema: ParseReceiptInputSchema,
    outputSchema: ParseReceiptOutputSchema,
  },
  async input => {
    const {output} = await parseReceiptPrompt(input);
    
    if (typeof output === 'string' && output === 'NOT_A_RECEIPT') {
      throw new Error('The uploaded image is not a receipt. Please upload a clear photo of a receipt.');
    }
    
    return output!;
  }
);
