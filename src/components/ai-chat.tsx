"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useApp, useAppDispatch } from '@/lib/store/context';
import { aiChatAssistant } from '@/ai/flows/ai-chat-assistant';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Send, User, Loader2, X } from 'lucide-react';
import { ReceiptChatIcon } from './ui/receipt-chat-icon';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Action } from '@/lib/store/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actionToConfirm?: Action;
}

interface AiChatProps {
  onClose: () => void;
}

const AiChat = ({ onClose }: AiChatProps) => {
  const state = useApp();
  const dispatch = useAppDispatch();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Focus input on component mount
    if (inputRef.current) {
        inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Scroll to view the latest message
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: uuidv4(), role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { users, items } = state;
      const relevantItems = JSON.stringify(Object.values(items).map(i => ({id: i.id, name: i.name, price: i.price})));
      const relevantUsers = JSON.stringify(users.map(u => ({id: u.id, name: u.name})));

      const response = await aiChatAssistant({
        command: userMessage.content,
        users: relevantUsers,
        items: relevantItems,
      });
      
      const assistantMessage: Message = { 
        id: uuidv4(), 
        role: 'assistant', 
        content: response.response, 
        actionToConfirm: response.actionToConfirm as Action | undefined,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("AI Chat error:", error);
      let errorMessage = 'Could not process the receipt.';
      if (error instanceof Error && error.message.includes('not a receipt')) {
        errorMessage = 'The uploaded image is not a valid receipt. Please try again with a clear photo of a receipt.';
      }
      toast({
        variant: 'destructive',
        title: 'Invalid Receipt',
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmation = (action: Action | undefined, confirmed: boolean) => {
    if (!action) return;
    
    // Remove the confirmation buttons from the message
    setMessages(prev => prev.map(m => 
      m.actionToConfirm?.type === action.type && 
      'itemId' in m.actionToConfirm.payload && 
      'itemId' in action.payload &&
      m.actionToConfirm.payload.itemId === action.payload.itemId 
        ? { ...m, actionToConfirm: undefined } 
        : m
    ));

    if (confirmed) {
      dispatch(action);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 pointer-events-none animate-in slide-in-from-bottom-4 fade-in">
        <div className="flex flex-col-reverse w-full gap-4">
            {/* Input Form */}
            <form 
                onSubmit={handleSubmit} 
                className="w-full pointer-events-auto flex items-center gap-2 rounded-full bg-card/80 backdrop-blur-md border border-border/60 p-2 shadow-2xl transition-all focus-within:border-primary/80"
            >
                <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="e.g. Split pizza with me and Jane"
                    disabled={isLoading}
                    className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
                />
                <Button type="submit" size="icon" disabled={isLoading || !input.trim()} className="rounded-full flex-shrink-0 w-10 h-10">
                    {isLoading ? <Loader2 className="animate-spin" /> : <Send />}
                </Button>
                <Button type="button" size="icon" variant="ghost" onClick={onClose} className="rounded-full flex-shrink-0 w-10 h-10 hover:bg-secondary/80">
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close chat</span>
                </Button>
            </form>

            {/* Messages */}
            {messages.length > 0 && (
                 <div ref={scrollAreaRef} className="max-h-[40vh] overflow-y-auto pointer-events-auto flex flex-col-reverse">
                    <div className="space-y-6 p-2">
                        {isLoading && messages[messages.length - 1]?.role === 'user' && (
                            <div className="flex justify-start items-center gap-3">
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback className="bg-primary/10 text-primary"><ReceiptChatIcon className="w-4 h-4" /></AvatarFallback>
                                </Avatar>
                                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                            </div>
                        )}
                        {messages.map(message => (
                            <div key={message.id} className={cn("flex items-start gap-3 text-sm w-full", message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                {message.role === 'assistant' && (
                                    <Avatar className="w-8 h-8 border flex-shrink-0">
                                        <AvatarFallback className="bg-secondary text-secondary-foreground"><ReceiptChatIcon className="w-4 h-4" /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("p-3 rounded-xl max-w-[90%] shadow-md", 
                                    message.role === 'user' 
                                    ? 'bg-primary text-primary-foreground rounded-br-none' 
                                    : 'bg-card border rounded-bl-none'
                                )}>
                                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                                    {message.actionToConfirm && (
                                        <div className="flex gap-2 mt-3 border-t pt-3">
                                            <Button size="sm" variant="default" onClick={() => handleConfirmation(message.actionToConfirm, true)}>Yes, confirm</Button>
                                            <Button size="sm" variant="secondary" onClick={() => handleConfirmation(message.actionToConfirm, false)}>Cancel</Button>
                                        </div>
                                    )}
                                </div>
                                {message.role === 'user' && (
                                    <Avatar className="w-8 h-8 border flex-shrink-0">
                                        <AvatarFallback><User className="w-4 h-4" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                 </div>
            )}
        </div>
    </div>
  );
};

export default AiChat;
