"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AppHeader = () => {
  return (
    <header className="flex items-center justify-between p-4 border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10 h-16">
      <Link href="/" className="flex items-center">
        <Image 
          src="/ss-logo.png" 
          alt="SplitSpree Logo"
          width={40}
          height={40}
        />
      </Link>
    </header>
  );
};

export default AppHeader;
