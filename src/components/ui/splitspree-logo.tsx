"use client";

import React from 'react';
import { Receipt, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SplitspreeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SplitspreeLogo = ({ 
  className,
  size = "md"
}: SplitspreeLogoProps) => {
  const iconSize = {
    sm: { main: 16, sparkle: 12 },
    md: { main: 24, sparkle: 16 }, 
    lg: { main: 32, sparkle: 20 }
  };

  return (
    <div className={cn("relative", className)}>
      <Receipt 
        className={cn(
          "text-primary",
          size === "sm" && "h-4 w-4",
          size === "md" && "h-6 w-6",
          size === "lg" && "h-8 w-8"
        )} 
      />
      <Sparkles 
        className={cn(
          "text-yellow-500 absolute -top-1 -right-1 animate-pulse",
          size === "sm" && "h-3 w-3",
          size === "md" && "h-4 w-4",
          size === "lg" && "h-5 w-5"
        )}
      />
    </div>
  );
};
