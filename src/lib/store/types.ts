import type { ParseReceiptOutput } from "@/ai/flows/parse-receipt";
import { v4 } from 'uuid';

export interface User {
  id: string;
  name: string;
}

export interface Item {
  id: string;
  receiptId: string;
  name: string;
  price: number;
  description: string;
  userIds: string[];
}

export interface Receipt {
  id: string;
  storeName: string;
  date: string;
  itemIds: string[];
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  payerId: string | null;
}

export interface AppState {
  users: User[];
  receipts: Record<string, Receipt>;
  items: Record<string, Item>;
}

export type Action =
  | { type: 'ADD_USER'; payload: User }
  | { type: 'ADD_RECEIPT'; payload: { receiptData: ParseReceiptOutput; payerId: string } }
  | { type: 'ASSIGN_ITEM'; payload: { itemId: string; userId: string } }
  | { type: 'UNASSIGN_ITEM'; payload: { itemId: string; userId: string } }
  | { type: 'SET_ITEM_ASSIGNEES'; payload: { itemId: string; userIds: string[] } }
  | { type: 'SET_ITEM_PRICE'; payload: { itemId: string; price: number } }
  | { type: 'SET_RECEIPT_PAYER'; payload: { receiptId: string; payerId: string } }
  // === New AI action types ===
  | { type: 'ASSIGN_ALL_ITEMS'; payload: { userIds: string[] } }
  | { type: 'CLEAR_ITEM_ASSIGNEES'; payload: { itemId?: string; itemIds?: string[] } }
  | { type: 'SPLIT_ITEM_PERCENT'; payload: { itemId: string; percentages: { userId: string; percentage: number }[] } }
  | { type: 'SPLIT_ITEM_AMOUNT'; payload: { itemId: string; amounts: { userId: string; amount: number }[] } }
  | { type: 'RESET_ALL_SPLITS'; payload: {} }
  | { type: 'UNDO_LAST_ACTION'; payload: {} };

export { v4 };
