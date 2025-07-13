"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useApp, useAppDispatch } from '@/lib/store/context';
import AppHeader from '@/components/app-header';
import UserSetup from '@/components/user-setup';
import ReceiptsDisplay from '@/components/receipts-display';
import UserBreakdown from '@/components/user-breakdown';
import AiChat from '@/components/ai-chat';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { ReceiptChatIcon } from '@/components/ui/receipt-chat-icon';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay } from '@dnd-kit/core';
import ItemCard from '@/components/item-card';

export default function AppPage() {
  const { users, items } = useApp();
  const dispatch = useAppDispatch();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const activeItemId = useMemo(() => {
    if (!activeId) return null;
    if (String(activeId).startsWith('item-')) {
        return String(activeId).replace('item-', '');
    }
    return null;
  }, [activeId]);

  const allItemsAssigned = useMemo(() => {
    const itemValues = Object.values(items);
    if (itemValues.length === 0) return false;
    return itemValues.every(item => item.userIds.length > 0);
  }, [items]);

  const isInitialSetup = users.length === 0;

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'item') {
        setActiveId(active.id as string);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;

    if (over && over.data.current?.userId && active.data.current?.itemId) {
        const userId = over.data.current.userId as string;
        const itemId = active.data.current.itemId as string;
        dispatch({ type: 'ASSIGN_ITEM', payload: { itemId, userId } });
    }
    setActiveId(null);
  }

  const handleDragCancel = () => {
    setActiveId(null);
  };

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={handleDragCancel}>
      <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20 text-foreground">
        <AppHeader />
        {isInitialSetup ? (
          <main className="flex-grow flex items-center justify-center p-4">
              <UserSetup />
          </main>
        ) : (
          <div className="flex flex-row flex-grow overflow-hidden">
            <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 bg-background/80 backdrop-blur-sm rounded-xl mx-2 my-2 border border-border/30">
              <div className="flex-grow">
                <ReceiptsDisplay />
              </div>
              {allItemsAssigned && (
                <div className="sticky bottom-4 z-20 w-full flex justify-center mt-4">
                    <Link href="/summary" passHref>
                        <Button className="shadow-2xl hover:shadow-3xl transition-all duration-300 animate-in fade-in zoom-in-95 h-10 text-sm px-3 xs:h-8 xs:text-xs xs:px-2 sm:h-10 sm:text-sm md:h-12 md:text-base">
                            Show Final Breakdown
                            <ArrowRight className="ml-2 h-4 w-4 xs:ml-1 xs:h-3 xs:w-3 sm:ml-2 sm:h-4 sm:w-4" />
                        </Button>
                    </Link>
                </div>
              )}
            </main>
            <aside className="flex flex-col w-[140px] md:w-[250px] flex-shrink-0 border-l border-border/50 bg-background/80 backdrop-blur-sm overflow-y-auto">
              <UserBreakdown />
            </aside>
          </div>
        )}
        
        {!isInitialSetup && !isChatOpen && (
          <Button
            onClick={() => setIsChatOpen(true)}
            size="icon"
            className="fixed bottom-6 right-6 z-40 rounded-full h-16 w-16 shadow-2xl animate-in fade-in zoom-in-95"
            aria-label="Open AI Chat"
          >
                  <ReceiptChatIcon className="h-7 w-7" />
          </Button>
        )}
        {isChatOpen && <AiChat onClose={() => setIsChatOpen(false)} />}
      </div>
      <DragOverlay>
        {activeItemId ? <ItemCard itemId={activeItemId} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
