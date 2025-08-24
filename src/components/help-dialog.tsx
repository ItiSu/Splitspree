import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Hand, Users, MousePointerClick } from 'lucide-react';

interface HelpDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HelpDialog({ isOpen, onClose }: HelpDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[480px] bg-background/90 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="text-2xl font-headline text-white">How to Split Items</DialogTitle>
          <DialogDescription>
            Follow these steps to assign receipt items to users.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
              <Hand className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Drag & Drop to Assign</h3>
              <p className="text-muted-foreground text-sm">
                Click and hold an item from the receipt list, then drag it onto a user's card on the right to assign it to them.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Split Between All Users</h3>
              <p className="text-muted-foreground text-sm">
                Click the "ALL" button on an item to split its cost evenly among all users in the group.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 bg-primary/10 rounded-full">
                <MousePointerClick className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-white">Assign to Multiple People</h3>
              <p className="text-muted-foreground text-sm">
                To split an item between specific people, drag it to each person one by one. The cost will be divided equally among the assignees.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="star" className="w-full">Got it!</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
