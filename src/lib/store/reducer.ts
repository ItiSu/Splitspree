import { AppState, Action } from './types';
import { v4 as uuidv4 } from 'uuid';

export const initialState: AppState = {
  users: [],
  receipts: {},
  items: {},
};

export function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_USER':
      return {
        ...state,
        users: [...state.users, action.payload],
      };
    case 'ADD_RECEIPT': {
      const { receiptData, payerId } = action.payload;
      const receiptId = uuidv4();
      
      const newItems = receiptData.items.reduce((acc, item) => {
        const itemId = uuidv4();
        acc[itemId] = {
          id: itemId,
          receiptId,
          name: item.name,
          price: item.price,
          description: item.description,
          userIds: [],
        };
        return acc;
      }, {} as AppState['items']);

      const newReceipt = {
        id: receiptId,
        storeName: receiptData.storeName,
        date: receiptData.date,
        subtotal: receiptData.subtotal,
        tax: receiptData.tax,
        tip: receiptData.tip,
        total: receiptData.total,
        payerId,
        itemIds: Object.keys(newItems),
      };

      return {
        ...state,
        receipts: {
          ...state.receipts,
          [receiptId]: newReceipt,
        },
        items: {
          ...state.items,
          ...newItems,
        },
      };
    }
    case 'ASSIGN_ITEM': {
      const { itemId, userId } = action.payload;
      const item = state.items[itemId];
      if (!item) return state;

      // Avoid adding duplicates
      if (item.userIds.includes(userId)) return state;

      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: {
            ...item,
            userIds: [...item.userIds, userId],
          },
        },
      };
    }
    case 'UNASSIGN_ITEM': {
      const { itemId, userId } = action.payload;
      const item = state.items[itemId];
      if (!item) return state;

      return {
          ...state,
          items: {
              ...state.items,
              [itemId]: {
                  ...item,
                  userIds: item.userIds.filter(id => id !== userId),
              },
          },
      };
    }
    case 'SET_ITEM_ASSIGNEES': {
      const { itemId, userIds } = action.payload;
      const item = state.items[itemId];
      if (!item) return state;

      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: {
            ...item,
            userIds: userIds,
          },
        },
      };
    }
    case 'SET_ITEM_PRICE': {
      const { itemId, price } = action.payload;
      const item = state.items[itemId];
      if (!item) return state;

      return {
        ...state,
        items: {
          ...state.items,
          [itemId]: {
            ...item,
            price: price,
          },
        },
      };
    }
    case 'SET_RECEIPT_PAYER': {
        const { receiptId, payerId } = action.payload;
        if (!state.receipts[receiptId]) return state;
        return {
            ...state,
            receipts: {
                ...state.receipts,
                [receiptId]: {
                    ...state.receipts[receiptId],
                    payerId: payerId,
                },
            },
        };
    }
    default:
      return state;
  }
}
