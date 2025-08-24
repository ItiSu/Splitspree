"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useApp, useAppDispatch } from "@/lib/store/context";
import { aiChatApi } from "@/lib/api-client";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, User, Loader2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";
import type { Action } from "@/lib/store/types";

interface Message {
  id: string;
  role: "user" | "assistant";
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
  const [input, setInput] = useState("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll handling for mobile keyboard resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [messages]);

  // Submit user message to AI
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: input,
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { users, items } = state;
      const relevantItems = JSON.stringify(
        Object.values(items).map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
        }))
      );
      const relevantUsers = JSON.stringify(
        users.map((u) => ({ id: u.id, name: u.name }))
      );

      const response = await aiChatApi(
        userMessage.content,
        relevantUsers,
        relevantItems
      );

      const assistantMessage: Message = {
        id: uuidv4(),
        role: "assistant",
        content: response.response,
        actionToConfirm: response.actionToConfirm as Action | undefined,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI Chat error:", error);
      let errorMessage = "Could not process the receipt.";
      if (
        error instanceof Error &&
        error.message.includes("not a receipt")
      ) {
        errorMessage =
          "The uploaded image is not a valid receipt. Please try again with a clear photo of a receipt.";
      }
      toast({
        variant: "destructive",
        title: "Invalid Receipt",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle confirm/cancel actions
  const handleConfirmation = (
    action: Action | undefined,
    confirmed: boolean,
    messageId: string
  ) => {
    if (!action) return;

    if (confirmed) {
      dispatch(action);
    }

    // Remove confirmation buttons for only the clicked message
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId ? { ...m, actionToConfirm: undefined } : m
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end pointer-events-none sm:justify-center sm:items-center sm:inset-auto sm:bottom-4 sm:left-1/2 sm:-translate-x-1/2 sm:w-full sm:max-w-lg sm:px-4 sm:px-6 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex flex-col-reverse w-full h-[calc(100vh-60px)] sm:h-auto sm:max-h-[80vh] gap-3 sm:gap-4 px-4 sm:px-0">
        {/* Input Form */}
        <div className="pointer-events-auto bg-card/70 backdrop-blur-md border border-border/70 rounded-full p-1 shadow-xl mb-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <Input
              id="ai-chat-input"
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Split pizza with me and Jane"
              disabled={isLoading}
              className="flex-grow h-12 text-base pl-6 pr-4 bg-transparent border-none focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
            />
            <div className="flex items-center gap-1">
              <Button
                type="submit"
                size="icon"
                disabled={isLoading || !input.trim()}
                variant="star"
                className="rounded-full w-10 h-10"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                onClick={onClose}
                className="rounded-full w-10 h-10 text-muted-foreground hover:text-red-500 hover:bg-red-500/10"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Messages */}
        {messages.length > 0 && (
          <div
            ref={scrollAreaRef}
            className="ai-chat-messages flex-1 overflow-y-auto pointer-events-auto flex flex-col-reverse pb-8"
          >
            <div className="space-y-4 p-1">
              {/* Loading indicator */}
              {isLoading && messages[messages.length - 1]?.role === "user" && (
                <div className="flex justify-start items-start gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <Image
                      src="/chat-logo.png"
                      alt="AI"
                      width={16}
                      height={16}
                      className="h-4 w-4"
                      priority
                      unoptimized
                      loading="eager"
                    />
                  </div>
                  <div className="bg-card/30 border rounded-2xl p-3 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Thinking...
                    </span>
                  </div>
                </div>
              )}

              {/* Messages */}
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3 w-full animate-in fade-in slide-in-from-bottom-2",
                    message.role === "user" ? "justify-end" : "justify-start"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Assistant Avatar */}
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-card/30 border flex items-center justify-center overflow-hidden">
                      <Image
                        src="/chat-logo.png"
                        alt="AI"
                        width={16}
                        height={16}
                        className="h-4 w-4"
                        priority
                        unoptimized
                        loading="eager"
                      />
                    </div>
                  )}

                  {/* Message Content */}
                  <div
                    className={cn(
                      "max-w-[85%] sm:max-w-[80%] shadow-lg backdrop-blur-sm",
                      message.role === "user"
                        ? "bg-primary/90 text-primary-foreground rounded-2xl rounded-br-md"
                        : "bg-card/30 text-card-foreground rounded-2xl rounded-bl-md"
                    )}
                  >
                    <div className="p-3 sm:p-4">
                      <p className="text-sm sm:text-base whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </p>

                      {/* Action Confirmation Buttons */}
                      {message.actionToConfirm && (
                        <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-3 border-t">
                          <Button
                            size="sm"
                            variant="star"
                            onClick={() =>
                              handleConfirmation(
                                message.actionToConfirm,
                                true,
                                message.id
                              )
                            }
                            className="w-full sm:w-auto text-xs font-medium rounded-full"
                          >
                            Yes, confirm
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleConfirmation(
                                message.actionToConfirm,
                                false,
                                message.id
                              )
                            }
                            className="w-full sm:w-auto text-xs font-medium rounded-full"
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-primary/10 border flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
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
