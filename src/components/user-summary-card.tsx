'use client';

import React, { useMemo } from 'react';
import { useApp } from '@/lib/store/context';
import type { Item, Receipt } from '@/lib/store/types';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Transaction } from '@/lib/debt-calculator';

interface UserSummaryCardProps {
    userId: string;
    transactions: Transaction[];
}

const UserSummaryCard = ({ userId, transactions }: UserSummaryCardProps) => {
    const { users, items, receipts } = useApp();
    const user = users.find(u => u.id === userId);

    const summary = useMemo(() => {
        if (!user) return null;

        const userItems = Object.values(items).filter(item => item.userIds.includes(userId));
        
        let subtotal = 0;
        let totalTax = 0;
        let totalTip = 0;

        type ItemWithShare = Item & { userShare: number };
        type ReceiptGroup = { receipt: Receipt, items: ItemWithShare[], userSubtotal: number };

        const itemsByReceipt = userItems.reduce((acc, item) => {
            const receipt = receipts[item.receiptId];
            if (!receipt) return acc;

            if (!acc[item.receiptId]) {
                acc[item.receiptId] = {
                    receipt,
                    items: [],
                    userSubtotal: 0,
                };
            }
            
            const splitCount = item.userIds.length || 1;
            const itemShare = item.price / splitCount;
            
            acc[item.receiptId].items.push({ ...item, userShare: itemShare });
            acc[item.receiptId].userSubtotal += itemShare;
            
            return acc;
        }, {} as Record<string, ReceiptGroup>);

        Object.values(itemsByReceipt).forEach(data => {
            const { receipt, userSubtotal } = data;
            
            const receiptSubtotal = receipt.itemIds
                .map(id => items[id]?.price || 0)
                .reduce((sum, price) => sum + price, 0);

            let userPortionPercentage = 0;
            if (receiptSubtotal > 0) {
                 userPortionPercentage = userSubtotal / receiptSubtotal;
            }
            
            subtotal += userSubtotal;
            totalTax += receipt.tax * userPortionPercentage;
            totalTip += receipt.tip * userPortionPercentage;
        });
        
        const totalPaid = Object.values(receipts)
            .filter(r => r.payerId === userId)
            .reduce((sum, r) => sum + r.total, 0);

        const totalOwed = subtotal + totalTax + totalTip;
        const balance = totalPaid - totalOwed;

        return {
            itemsByReceipt,
            subtotal,
            totalTax,
            totalTip,
            totalOwed,
            totalPaid,
            balance
        };

    }, [userId, users, items, receipts]);

    if (!user || !summary) return null;

    const findUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unknown';

    return (
        <Card className="flex flex-col h-full shadow-lg border-border/60 bg-card/80">
            <CardHeader className="flex flex-row items-center gap-4 space-y-0">
                <Avatar className="h-12 w-12 text-lg">
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                        {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div>
                    <CardTitle className="font-headline text-xl">{user.name}</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="flex-grow space-y-4">
                {Object.keys(summary.itemsByReceipt).length > 0 ? Object.values(summary.itemsByReceipt).map(({ receipt, items: receiptItems }) => (
                    <div key={receipt.id}>
                        <h4 className="text-sm font-semibold text-muted-foreground mb-2">{receipt.storeName}</h4>
                        <div className="space-y-1 text-sm">
                            {receiptItems.map(item => (
                                <div key={item.id} className="flex justify-between">
                                    <span className="truncate pr-2">{item.name}</span>
                                    <span className="font-mono">${item.userShare.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )) : (
                    <p className="text-sm text-muted-foreground py-4">No items assigned.</p>
                )}
            </CardContent>
            <CardFooter className="flex flex-col items-start gap-1 text-sm text-muted-foreground p-6 bg-secondary/20 rounded-b-lg mt-auto">
                <div className="flex justify-between w-full"><span>Subtotal</span><span className="font-mono">${summary.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between w-full"><span>Tax</span><span className="font-mono">${summary.totalTax.toFixed(2)}</span></div>
                <div className="flex justify-between w-full"><span>Tip</span><span className="font-mono">${summary.totalTip.toFixed(2)}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between w-full font-bold text-base text-foreground"><span>You Owe</span><span className="font-mono">${summary.totalOwed.toFixed(2)}</span></div>
                <div className="flex justify-between w-full text-xs"><span>You Paid</span><span className="font-mono">${summary.totalPaid.toFixed(2)}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between w-full font-bold text-lg" style={{ color: summary.balance >= 0 ? 'hsl(var(--success))' : 'hsl(var(--destructive))' }}>
                    <span>{summary.balance >= 0 ? 'Final Credit' : 'Amount Due'}</span>
                    <span className="font-mono">${Math.abs(summary.balance).toFixed(2)}</span>
                </div>
                {transactions.length > 0 && (
                    <>
                        <Separator className="my-2" />
                        <div className="w-full space-y-2 text-sm">
                            {transactions.map((t, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    {t.from === userId && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-destructive">You owe {findUserName(t.to)}</span>
                                            </div>
                                            <span className="font-mono font-bold text-destructive">${t.amount.toFixed(2)}</span>
                                        </>
                                    )}
                                    {t.to === userId && (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-success">{findUserName(t.from)} owes you</span>
                                            </div>
                                            <span className="font-mono font-bold text-success">${t.amount.toFixed(2)}</span>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                   </>
                )}
            </CardFooter>
        </Card>
    );
}

export default UserSummaryCard;
