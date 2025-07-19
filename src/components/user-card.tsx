"use client";

import React, { useMemo } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { useApp } from '@/lib/store/context';
import { Avatar, AvatarFallback } from './ui/avatar';
import { cn } from '@/lib/utils';
import { Card, CardContent } from './ui/card';

interface UserCardProps {
  userId: string;
}

const UserCard = ({ userId }: UserCardProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `user-${userId}`,
    data: { userId },
  });
  
  const { users, items, receipts } = useApp();
  const user = users.find(u => u.id === userId);

  const { totalOwed, totalPaid } = useMemo(() => {
    const myItems = Object.values(items).filter(item => item.userIds.includes(userId));
    
    const myPaid = Object.values(receipts)
        .filter(r => r.payerId === userId)
        .reduce((sum, r) => sum + r.total, 0);
        
    const myOwed = myItems.reduce((total, item) => {
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
        totalOwed: myOwed,
        totalPaid: myPaid
    };
  }, [userId, items, receipts]);

  if (!user) return null;
  
  const balance = totalPaid - totalOwed;

  return (
    <Card 
        ref={setNodeRef}
        className={cn(
            'bg-card/80 border-border/80 transition-all', 
            isOver ? 'ring-2 ring-primary ring-offset-2 ring-offset-background shadow-2xl' : 'hover:bg-card/100',
        )}
    >
        <CardContent className="p-3">
            <div className="flex flex-col items-center text-center gap-2">
                <Avatar className="h-12 w-12 text-lg">
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-bold">
                        {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <div className="w-full">
                    <p className="font-semibold text-foreground break-words">{user.name}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <div className={cn("font-bold text-base", balance >= 0 ? 'text-success' : 'text-destructive')}>
                        ${Math.abs(balance).toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {balance >= 0 ? 'Credit' : 'Owes'}
                    </div>
                </div>
            </div>
        </CardContent>
    </Card>
  );
};

export default UserCard;
