"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Receipt, Users, Calculator, ArrowRight, Sparkles } from 'lucide-react';

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-12">
        {/* Hero Section */}
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <Receipt className="h-16 w-16 text-primary" />
              <Sparkles className="h-6 w-6 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <h1 className="text-5xl md:text-6xl font-headline font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            SplitSpree
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AI-powered bill splitting made simple. Upload receipts, assign items, and let us handle the math.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <Receipt className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Smart Receipt Parsing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Upload photos of receipts and our AI automatically extracts items and prices
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <Users className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Easy Group Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Add friends to your group and assign items with simple drag-and-drop
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <Calculator className="h-8 w-8 text-primary mx-auto mb-2" />
              <CardTitle className="text-lg">Automatic Calculations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get instant breakdowns of who owes what, with optimized payment suggestions
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="space-y-6">
          <Link href="/app" passHref>
            <Button size="lg" className="h-14 px-8 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 animate-in fade-in zoom-in-95">
              Start Splitting Now
              <ArrowRight className="ml-3 h-6 w-6" />
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground">
            No signup required • Free to use • Works on any device
          </p>
        </div>
      </div>
    </div>
  );
}
