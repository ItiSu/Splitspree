"use client";

import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface SplitspreeLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const SplitspreeLogo = ({ 
  className,
  size = "md"
}: SplitspreeLogoProps) => {
  const dimensions = {
    sm: { width: 40, height: 40 },
    md: { width: 48, height: 48 }, 
    lg: { width: 64, height: 64 }
  };

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <Image
        src="/ss-logo.png"
        alt="SplitSpree Logo"
        width={dimensions[size].width}
        height={dimensions[size].height}
        className={cn(
          "object-contain",
          size === "sm" && "w-10 h-10",
          size === "md" && "w-12 h-12",
          size === "lg" && "w-16 h-16"
        )}
        priority
      />
    </div>
  );
};
