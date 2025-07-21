import type { AppState, User } from '@/lib/store/types';

export interface Transaction {
  from: string; // userId
  to: string; // userId
  amount: number;
}

interface UserBalance {
  user: User;
  balance: number;
}

function calculateUserBalances(appState: AppState): UserBalance[] {
  const { users, items, receipts } = appState;

  return users.map(user => {
    const myItems = Object.values(items).filter(item => item.userIds.includes(user.id));

    const totalPaid = Object.values(receipts)
      .filter(r => r.payerId === user.id)
      .reduce((sum, r) => sum + r.total, 0);

    const totalOwed = myItems.reduce((total, item) => {
      const splitCount = item.userIds.length || 1;
      const itemShare = item.price / splitCount;

      const receipt = receipts[item.receiptId];
      if (!receipt) return total + itemShare;

      const receiptSubtotal = receipt.itemIds
        .map(id => items[id]?.price || 0)
        .reduce((sum, price) => sum + price, 0);
      
      if (receiptSubtotal > 0) {
        const taxAndTipRatio = (receipt.tax + receipt.tip) / receiptSubtotal;
        const itemTaxAndTip = item.price * taxAndTipRatio;
        const proportionalShare = itemTaxAndTip / splitCount;
        return total + itemShare + proportionalShare;
      }
      
      return total + itemShare;
    }, 0);

    return {
      user,
      balance: totalPaid - totalOwed,
    };
  });
}

export function calculateDebts(appState: AppState): Transaction[] {
  const userBalances = calculateUserBalances(appState);

  const debtors = userBalances
    .filter(b => b.balance < 0)
    .map(b => ({ ...b, balance: b.balance }));
  const creditors = userBalances
    .filter(b => b.balance > 0)
    .map(b => ({ ...b, balance: b.balance }));

  const transactions: Transaction[] = [];

  while (debtors.length > 0 && creditors.length > 0) {
    const debtor = debtors[0];
    const creditor = creditors[0];

    const amount = Math.min(-debtor.balance, creditor.balance);

    if (amount > 0.005) { // Only add transaction if amount is meaningful
        transactions.push({
          from: debtor.user.id,
          to: creditor.user.id,
          amount: amount,
        });
    }

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) {
      debtors.shift();
    }
    if (Math.abs(creditor.balance) < 0.01) {
      creditors.shift();
    }
  }

  return transactions;
}
