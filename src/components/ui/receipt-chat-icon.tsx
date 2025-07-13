"use client";

import React from "react";
import { cn } from "@/lib/utils";

export const ReceiptChatIcon = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center w-10 h-10 rounded-full bg-yellow-400 text-black shadow-md",
        className
      )}
    >
      <div className="relative flex items-center justify-center w-7 h-7 rounded-md bg-[#0e0e10] shadow-inner">
        <span className="text-[10px] font-medium tracking-wide text-yellow-400">
          AI 
        </span>
      </div>
    </div>
  );
};
