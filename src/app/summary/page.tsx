'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store/context';
import UserSummaryCard from '@/components/user-summary-card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home } from 'lucide-react';
import { calculateDebts } from '@/lib/debt-calculator';

export default function SummaryPage() {
  const appState = useApp();
  const { users } = appState;

  const transactions = useMemo(() => calculateDebts(appState), [appState]);

  const getTransactionsForUser = (userId: string) => {
    return transactions.filter(t => t.from === userId || t.to === userId);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-grow p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-headline font-semibold">Final Breakdown</h1>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <Button asChild variant="outline" size="sm" className="sm:text-base">
                <Link href="/">
                  <Home className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Home
                </Link>
              </Button>
              <Button asChild variant="star" size="sm" className="sm:text-base sm:font-semibold">
                <Link href="/app">
                  <ArrowLeft className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  Back to Edit
                </Link>
              </Button>
            </div>
          </div>

          {users.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {users.map(user => (
                    <UserSummaryCard
                      key={user.id}
                      userId={user.id}
                      transactions={getTransactionsForUser(user.id)}
                    />
                ))}
            </div>
          ) : (
            <div className="text-center py-20 rounded-lg border-2 border-dashed border-border/60">
              <p className="text-xl font-medium">No Summary Available</p>
              <p className="text-muted-foreground">Go back and add users and receipts to see a summary.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
