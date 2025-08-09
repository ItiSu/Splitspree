"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import ScrollVelocity from '@/components/TextScroll';

export default function WelcomePage() {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top Section - Logo, Subtitle, and Scrolling Animation */}
      <div className="flex-1 flex flex-col items-center justify-center -mt-24 sm:-mt-28 md:-mt-32">
        <div className="flex justify-center !m-0 !p-0">
          <Image
            src="/ss-logo.png"
            alt="SplitSpree Logo"
            width={400}
            height={400}
            className="h-64 w-64 sm:h-72 sm:w-72 md:h-80 md:w-80 object-contain !m-0 !p-0 block"
            priority
          />
        </div>
        <p className="text-sm sm:text-base md:text-lg text-muted-foreground -mt-16 sm:-mt-20 md:-mt-24 mb-16">
          AI-powered bill splitting made simple
        </p>
        
        {/* Scrolling Animation */}
        <div className="w-screen overflow-hidden">
          <ScrollVelocity
            texts={['Upload Receipt', 'AI Extracts Items', 'Assign to Friends', 'Get Breakdown']}
            velocity={25}
            className="text-muted-foreground/70"
            parallaxClassName="parallax"
            scrollerClassName="scroller"
          />
        </div>
      </div>

      {/* Bottom Section - CTA and Footer */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center pb-8 sm:pb-12 space-y-4 sm:space-y-6">
        <div>
          <Link href="/app">
            <Button
              size="lg"
              className="h-12 px-6 sm:px-8 text-base font-semibold"
            >
              Start Splitting Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground">
          No signup required • Free to use
        </p>
      </div>
    </div>
  );
}
