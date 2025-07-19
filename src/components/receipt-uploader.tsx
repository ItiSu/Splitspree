
"use client";

import React, { useState } from 'react';
import { useApp, useAppDispatch } from '@/lib/store/context';
import { parseReceipt, ParseReceiptOutput } from '@/ai/flows/parse-receipt';
import { useToast } from '@/hooks/use-toast';
import { Button } from './ui/button';
import { Upload, Loader2, PartyPopper } from 'lucide-react';
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
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
    event.target.value = '';
  };

  const handleConfirmReceipt = () => {
    if (parsedData && payerId) {
      dispatch({ type: 'ADD_RECEIPT', payload: { receiptData: parsedData, payerId } });
      setParsedData(null);
      setPayerId("");
      toast({
          title: "Success!",
          description: "Your receipt has been added.",
          action: <PartyPopper className="text-accent"/>
      })
    }
  };

  const uploaderId = `receipt-upload-${isWelcome ? 'welcome' : 'button'}`;

  return (
    <>
      {isWelcome ? (
        <label
          htmlFor={uploaderId}
          className="relative flex items-center justify-center w-full max-w-lg cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/30 p-12 text-center transition-colors hover:border-primary/70 hover:bg-secondary/20 min-h-[238px]"
        >
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex items-center justify-center space-x-2 h-12">
                    <div className="h-full w-2 bg-primary rounded-full animate-scanner-bar" style={{ animationDelay: '-1.0s' }}></div>
                    <div className="h-full w-2 bg-primary rounded-full animate-scanner-bar" style={{ animationDelay: '-0.8s' }}></div>
                    <div className="h-full w-2 bg-primary rounded-full animate-scanner-bar" style={{ animationDelay: '-0.6s' }}></div>
                    <div className="h-full w-2 bg-primary rounded-full animate-scanner-bar" style={{ animationDelay: '-0.4s' }}></div>
                    <div className="h-full w-2 bg-primary rounded-full animate-scanner-bar" style={{ animationDelay: '0s' }}></div>
                </div>
                <p className="text-xl font-medium">Analyzing Receipt...</p>
                <p className="text-muted-foreground">The AI is hard at work.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-xl font-medium">Welcome!</p>
                <p className="text-muted-foreground">Click or drag a receipt image here to get started.</p>
              </div>
            </div>
          )}
        </label>
      ) : (
        <div className="relative">
          <Button asChild variant="outline" className="w-full">
            <label htmlFor={uploaderId} className="cursor-pointer">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  <span className="sm:hidden">Upload</span>
                  <span className="hidden sm:inline">Upload Another Receipt</span>
                </>
              )}
            </label>
          </Button>
        </div>
      )}

      <input id={uploaderId} type="file" accept="image/png, image/jpeg" className="sr-only" onChange={handleFileUpload} disabled={isLoading} />

      <Dialog open={!!parsedData} onOpenChange={() => setParsedData(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Receipt Details</DialogTitle>
            <DialogDescription>
              AI has parsed your receipt. Please select who paid for this bill.
            </DialogDescription>
          </DialogHeader>
          {parsedData && (
            <div className="space-y-4 py-4">
                <div className="flex justify-between items-center">
                    <span className="font-medium">Store:</span>
                    <span>{parsedData.storeName}</span>
                </div>
                 <div className="flex justify-between items-center">
                    <span className="font-medium">Total:</span>
                    <span className="font-bold">${parsedData.total.toFixed(2)}</span>
                </div>
              <div className="grid gap-3">
                <Label htmlFor="payer-select">Who paid?</Label>
                <Select value={payerId} onValueChange={setPayerId}>
                  <SelectTrigger id="payer-select">
                    <SelectValue placeholder="Select a person" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setParsedData(null)}>Cancel</Button>
            <Button onClick={handleConfirmReceipt} disabled={!payerId}>Add Receipt</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ReceiptUploader;
