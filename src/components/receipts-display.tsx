
"use client";

import React from 'react';
import { useApp } from '@/lib/store/context';
import ReceiptUploader from './receipt-uploader';
import ReceiptCard from './receipt-card';
import { ScrollArea } from './ui/scroll-area';

const ReceiptsDisplay = () => {
  const { receipts } = useApp();
  const receiptIds = Object.keys(receipts);

  return (
    <div className="flex flex-col gap-6 h-full">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-headline font-semibold flex-shrink-0">Receipts</h2>
            {receiptIds.length > 0 && (
                <div className="w-full sm:w-auto flex-shrink-0">
                    <ReceiptUploader />
                </div>
            )}
        </div>
        {receiptIds.length > 0 ? (
            <div className="space-y-6">
                {receiptIds.map(id => (
                    <ReceiptCard key={id} receiptId={id} />
                ))}
            </div>
        ) : (
            <div className="flex-grow flex items-center justify-center">
                <ReceiptUploader isWelcome={true} />
            </div>
        )}
    </div>
  );
};

export default ReceiptsDisplay;
