"use client";

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useApp, useAppDispatch } from '@/lib/store/context';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';
import { X, Split, GripVertical } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/button';

interface ItemCardProps {
  itemId: string;
  isOverlay?: boolean;
}

const ItemCard = ({ itemId, isOverlay = false }: ItemCardProps) => {
  const { items, users } = useApp();
  const dispatch = useAppDispatch();
  const item = items[itemId];

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `item-${itemId}`,
    data: { itemId, type: 'item' },
  });
  
  const style = isOverlay && transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;
  
  const assignedUsers = item?.userIds.map(uid => users.find(u => u.id === uid)).filter(Boolean) as { id: string, name: string }[];

  if (!item) return null;
  
  const isClaimed = assignedUsers.length > 0;
  const pricePerPerson = isClaimed ? item.price / assignedUsers.length : item.price;
  const showDescription = item.description && item.description.toLowerCase() !== item.name.toLowerCase();

  const handleUnassign = (e: React.MouseEvent, userId: string) => {
      e.stopPropagation(); 
      dispatch({ type: 'UNASSIGN_ITEM', payload: { itemId, userId } });
  }

  const handleSplitWithEveryone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const allUserIds = users.map(u => u.id);
    dispatch({ type: 'SET_ITEM_ASSIGNEES', payload: { itemId, userIds: allUserIds } });
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg transition-all border bg-card/90",
        isDragging && !isOverlay && "opacity-30",
        isOverlay && "shadow-2xl",
        !isClaimed && !isOverlay && 'hover:bg-secondary/30'
      )}
    >
        {/* Content Area - Not draggable, allows scrolling */}
        <div className="flex flex-col p-3 pr-12 sm:pr-10">
            <div className="flex items-start justify-between w-full gap-2">
                <div className="flex-grow min-w-[120px]">
                  <p className="font-medium break-keep hyphens-auto">{item.name}</p>
                  {showDescription && <p className="text-xs text-muted-foreground break-keep hyphens-auto">{item.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("font-mono text-base", isClaimed && 'line-through text-muted-foreground')}>
                      ${item.price.toFixed(2)}
                    </span>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            className="h-5 px-1.5 text-xs font-medium flex-shrink-0 gap-1" 
                            onClick={handleSplitWithEveryone}
                          >
                            <Split className="h-2.5 w-2.5" />
                            ALL
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Divide equally among all</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
            </div>

            {isClaimed && (
                <div className="mt-2 pt-2 border-t flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="text-xs font-semibold">${pricePerPerson.toFixed(2)}/person for:</div>
                    <TooltipProvider>
                        <div className="flex flex-wrap items-center gap-1">
                        {assignedUsers.map(user => (
                            <Tooltip key={user.id} delayDuration={100}>
                                <TooltipTrigger asChild>
                                    <div className="relative group/avatar">
                                        <Avatar className="h-7 w-7 border-2 border-background">
                                            <AvatarFallback className="text-xs bg-secondary text-secondary-foreground font-semibold">
                                                {user.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                         <button 
                                            onClick={(e) => handleUnassign(e, user.id)}
                                            className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center"
                                            aria-label={`Remove ${user.name}`}
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{user.name}</p>
                                </TooltipContent>
                            </Tooltip>
                        ))}
                        </div>
                    </TooltipProvider>
                </div>
            )}
        </div>

        {/* Drag Handle - Absolute positioned on the right */}
        <div
          {...listeners}
          {...attributes}
          className={cn(
            "absolute top-0 right-0 bottom-0 w-10 sm:w-8",
            "flex items-center justify-center",
            "bg-muted/30 hover:bg-muted/50 rounded-r-lg border-l border-border/50",
            "cursor-grab active:cursor-grabbing touch-none transition-colors",
            isOverlay && "cursor-grabbing bg-muted/50"
          )}
        >
          <GripVertical className="h-5 w-5 sm:h-4 sm:w-4 text-muted-foreground/70" />
        </div>
    </div>
  );
};

export default ItemCard;