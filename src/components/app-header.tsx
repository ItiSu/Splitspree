"use client"
import React from 'react';
import Link from 'next/link';
import { SplitspreeLogo } from '@/components/ui/splitspree-logo';

const AppHeader = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 h-16">
      <Link href="/" className="flex items-center gap-2">
        <SplitspreeLogo size="sm" className="w-6 h-6" />
        <h1 className="text-xl font-headline font-bold text-foreground">
          SplitSpree
        </h1>
      </Link>
    </header>
  );
};

export default AppHeader;
