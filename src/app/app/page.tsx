"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useApp, useAppDispatch } from '@/lib/store/context';
import UserSetup from '@/components/user-setup';
import ReceiptsDisplay from '@/components/receipts-display';
import UserBreakdown from '@/components/user-breakdown';
import AiChat from '@/components/ai-chat';
import { Button } from '@/components/ui/button';
import { ArrowRight, HelpCircle, ArrowLeft } from 'lucide-react';
import { ReceiptChatIcon } from '@/components/ui/receipt-chat-icon';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay } from '@dnd-kit/core';
import ItemCard from '@/components/item-card';
import HelpDialog from '@/components/help-dialog';
import '@/components/pulsating-help.css';

export default function AppPage() {
  const { users, items } = useApp();
  const dispatch = useAppDispatch();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showPulsatingHint, setShowPulsatingHint] = useState(false);

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

  useEffect(() => {
    const hasSeenHint = sessionStorage.getItem('hasSeenHelpButton');
    if (!hasSeenHint) {
      setShowPulsatingHint(true);
    }
  }, []);

  const handleHelpClick = () => {
    sessionStorage.setItem('hasSeenHelpButton', 'true');
    setShowPulsatingHint(false);
    setIsHelpOpen(true);
  };

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
      <div className="flex flex-col h-screen text-foreground">
        {isInitialSetup ? (
          <main className="flex-grow flex items-center justify-center p-4">
              <UserSetup />
          </main>
        ) : (
          <div className="flex flex-row flex-grow overflow-hidden">
            <main className="flex-1 flex flex-col overflow-y-auto p-4 sm:p-6 bg-background/80 backdrop-blur-sm rounded-xl mx-2 my-2 border border-border/30">
              <div className="flex-grow">
                <div className="mb-4">
                  <Link href="/">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <ReceiptsDisplay />
              </div>
              {allItemsAssigned && (
                <div className="sticky bottom-4 z-20 w-full flex justify-center mt-4">
                    <Link href="/summary" passHref>
                        <Button variant="star" size="sm" className="text-sm font-semibold">
                            Show Breakdown
                            <ArrowRight className="ml-2 h-3 w-3" />
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
          <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
            <Button
              onClick={handleHelpClick}
              variant="star"
              size="icon"
              className={`rounded-full h-12 w-12 p-0 flex items-center justify-center ${showPulsatingHint ? 'pulsate' : ''}`}
              aria-label="Open Help"
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
            <Button
              onClick={() => {
                setIsChatOpen(true);
                setTimeout(() => {
                const input = document.querySelector('#ai-chat-input') as HTMLInputElement;
                if (input) {
                  input.focus();
                  setTimeout(() => {
                    const messages = document.querySelector('.ai-chat-messages') as HTMLDivElement;
                    if (messages) {
                      messages.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }, 100);
                }
              }, 100);
            }}
            variant="star"
            size="icon"
            className="rounded-full h-12 w-12 p-0 flex items-center justify-center"
            aria-label="Open AI Chat"
          >
            <Image 
              src="/chat-logo.png"
              alt="AI Chat"
              width={20}
              height={20}
              className="h-5 w-5"
            />
            </Button>
          </div>
        )}
        {isChatOpen && <AiChat onClose={() => setIsChatOpen(false)} />}
        <HelpDialog isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      </div>
      <DragOverlay>
        {activeItemId ? <ItemCard itemId={activeItemId} isOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
