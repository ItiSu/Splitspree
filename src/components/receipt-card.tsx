"use client";

import React from 'react';
import { useApp } from '@/lib/store/context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './ui/card';
import { Separator } from './ui/separator';
import ItemCard from './item-card';
import { format, parseISO } from 'date-fns';

interface ReceiptCardProps {
  receiptId: string;
}

const ReceiptCard = ({ receiptId }: ReceiptCardProps) => {
  const { receipts, items, users } = useApp();
  const receipt = receipts[receiptId];

  if (!receipt) return null;

  const payer = users.find(u => u.id === receipt.payerId);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Card className="shadow-lg border-border/60 bg-card/60">
      <CardHeader>
        <div className="flex justify-between items-start gap-4">
            <div className="min-w-0">
                <CardTitle className="font-headline text-xl truncate">{receipt.storeName}</CardTitle>
                <CardDescription>{formatDate(receipt.date)}</CardDescription>
            </div>
            {payer && <CardDescription className="text-xs text-right flex-shrink-0">Paid by: {payer.name}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent className="px-3 sm:px-6">
        <div className="space-y-3">
            {receipt.itemIds.map(itemId => (
                <ItemCard key={itemId} itemId={itemId} />
            ))}
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-end gap-1 text-sm text-muted-foreground px-3 sm:px-6">
        <div className="flex justify-between w-full max-w-xs">
            <span>Subtotal</span>
            <span className="font-mono">${receipt.subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-full max-w-xs">
            <span>Tax</span>
            <span className="font-mono">${receipt.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between w-full max-w-xs">
            <span>Tip</span>
            <span className="font-mono">${receipt.tip.toFixed(2)}</span>
        </div>
        <Separator className="my-2 w-full max-w-xs" />
        <div className="flex justify-between w-full max-w-xs font-bold text-base text-foreground">
            <span>Total</span>
            <span className="font-mono">${receipt.total.toFixed(2)}</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ReceiptCard;
