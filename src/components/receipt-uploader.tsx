"use client";

import React, { useState } from 'react';
import { useApp, useAppDispatch } from '@/lib/store/context';
import { parseReceipt, ParseReceiptOutput } from '@/ai/flows/parse-receipt';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Upload, Loader2, PartyPopper, CheckCircle, ArrowRight, User } from 'lucide-react';
import { FileUpload } from './ui/file-upload';
import PixelCard from './pixel-card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface ReceiptUploaderProps {
  isWelcome?: boolean;
}

const ReceiptUploader = ({ isWelcome = false }: ReceiptUploaderProps) => {
  const { users } = useApp();
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [parsedData, setParsedData] = useState<ParseReceiptOutput | null>(null);
  const [payerId, setPayerId] = useState<string>("");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileUpload = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const receiptDataUri = reader.result as string;
      try {
        const result = await parseReceipt({ receiptDataUri });
        setParsedData(result);
        if (users.length > 0) {
          setPayerId(users[0].id);
        }
      } catch (error) {
        console.error("Error parsing receipt:", error);
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem parsing your receipt.",
        });
      } finally {
        setIsLoading(false);
      }
    };
  };

  const handleConfirmReceipt = () => {
    if (parsedData && payerId) {
      setShowSuccess(true);
      dispatch({ type: 'ADD_RECEIPT', payload: { receiptData: parsedData, payerId } });
      
      // Auto-close after success animation
      setTimeout(() => {
        setParsedData(null);
        setPayerId("");
        setShowSuccess(false);
      }, 1500);
    }
  };

  const uploaderId = `receipt-upload-${isWelcome ? 'welcome' : 'button'}`;

  return (
    <>
      {isWelcome ? (
        <div className="w-full max-w-lg mx-auto">
          {isLoading ? (
            <PixelCard variant="pink" className="w-full max-w-lg mx-auto" autoStart={true}>
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-10">
                <p className="text-xl font-medium text-white">Analyzing Receipt...</p>
                <p className="text-white/80">The AI is hard at work.</p>
              </div>
            </PixelCard>
          ) : (
            <FileUpload onChange={handleFileUpload} />
          )}
        </div>
      ) : (
        <div className="relative">
          <Button asChild variant="star" size="lg" className="text-base font-semibold">
            <label htmlFor={uploaderId} className="cursor-pointer">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Another
                </>
              )}
            </label>
          </Button>
          <input id={uploaderId} type="file" accept="image/png, image/jpeg" className="sr-only" onChange={(e) => {
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
              handleFileUpload(files);
            }
            e.target.value = '';
          }} disabled={isLoading} />
        </div>
      )}

      <Dialog open={!!parsedData} onOpenChange={() => setParsedData(null)}>
        <DialogContent className="sm:max-w-md bg-card/70 backdrop-blur-md border-border/70 rounded-3xl shadow-xl">
          {showSuccess ? (
            // Success State
            <div className="text-center py-8">
              <div className="mx-auto w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mb-4 animate-in zoom-in-95 duration-300">
                <CheckCircle className="w-8 h-8 text-success animate-in zoom-in-95 duration-500 delay-150" />
              </div>
              <DialogTitle className="text-xl font-semibold text-foreground mb-2 animate-in fade-in duration-500 delay-300">
                Receipt Added Successfully!
              </DialogTitle>
              <DialogDescription className="text-muted-foreground animate-in fade-in duration-500 delay-500">
                Your receipt has been processed and is ready for splitting.
              </DialogDescription>
            </div>
          ) : (
            // Normal State
            <>
              <DialogHeader className="text-center pb-6">
                <DialogTitle className="text-xl font-semibold text-foreground">
                  Receipt Processed Successfully!
                </DialogTitle>
                <DialogDescription className="text-muted-foreground/80 text-sm font-medium">
                  Please review the details and select who paid for this receipt.
                </DialogDescription>
              </DialogHeader>
              
              {parsedData && (
                <div className="space-y-6">
                  {/* Receipt Details Cards */}
                  <div className="space-y-3">
                    <div className="bg-card/30 backdrop-blur-sm rounded-full px-4 py-3 border border-border/30 hover:border-border/50 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Store</span>
                        <span className="text-sm font-medium text-card-foreground">{parsedData.storeName}</span>
                      </div>
                    </div>
                    <div className="bg-card/30 backdrop-blur-sm rounded-full px-4 py-3 border border-border/30 hover:border-border/50 transition-all duration-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">Total Amount</span>
                        <span className="text-lg font-bold text-primary">${parsedData.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payer Selection */}
                  <div className="space-y-3">
                    <Label htmlFor="payer-select" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Who paid for this receipt?
                    </Label>
                    <Select value={payerId} onValueChange={setPayerId}>
                      <SelectTrigger id="payer-select" className="h-12 text-base pl-6 pr-6 bg-card/70 backdrop-blur-md border-border/70 rounded-full transition-all duration-200 focus:border-border/70 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none [&:focus]:bg-card/80 [&:focus-visible]:bg-card/80 !outline-none !ring-0 !ring-offset-0 text-card-foreground">
                        <SelectValue placeholder="Select a person" className="text-card-foreground" />
                      </SelectTrigger>
                      <SelectContent className="bg-card/90 backdrop-blur-md border-border/70 shadow-xl rounded-2xl">
                        {users.map(user => (
                          <SelectItem 
                            key={user.id} 
                            value={user.id}
                            className="text-card-foreground hover:bg-primary/20 focus:bg-primary/20 cursor-pointer rounded-lg transition-all duration-200"
                          >
                            <div className="flex items-center gap-2 text-card-foreground">
                              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-3 h-3 text-primary" />
                              </div>
                              {user.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
              
              <DialogFooter className="flex-col sm:flex-row gap-3 pt-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setParsedData(null)}
                  className="w-full sm:w-auto h-12 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-card/30 backdrop-blur-sm rounded-full transition-all duration-200"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleConfirmReceipt} 
                  disabled={!payerId}
                  variant="star"
                  size="star"
                  className="w-full sm:w-auto h-12 text-base font-semibold transition-all duration-300 disabled:opacity-50"
                >
                  Add Receipt
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptUploader;
