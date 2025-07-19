"use client";

import React, { useState } from 'react';
import { useAppDispatch } from '@/lib/store/context';
import { v4 as uuidv4 } from 'uuid';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, User, ArrowRight, Trash2, Receipt, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from './ui/card';

const UserSetup = () => {
  const [name, setName] = useState('');
  const [users, setUsers] = useState<string[]>([]);
  const dispatch = useAppDispatch();

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && !users.includes(name.trim())) {
      setUsers([...users, name.trim()]);
      setName('');
    }
  };
  
  const handleRemoveUser = (nameToRemove: string) => {
    setUsers(users.filter(user => user !== nameToRemove));
  }

  const handleFinishSetup = () => {
    users.forEach(userName => {
      dispatch({
        type: 'ADD_USER',
        payload: { id: uuidv4(), name: userName },
      });
    });
  };

  return (
    <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/50 backdrop-blur-sm mx-auto my-8">
        <CardHeader className="text-center p-8">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Receipt className="h-12 w-12 text-primary" />
              <Sparkles className="h-5 w-5 text-yellow-500 absolute -top-1 -right-1 animate-pulse" />
            </div>
          </div>
          <CardTitle className="text-3xl font-headline font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            SplitSpree
          </CardTitle>
          <CardDescription className="text-muted-foreground pt-2 text-lg">
            Add people to your group to start splitting bills
          </CardDescription>
        </CardHeader>
      <CardContent className="p-8 pt-0">
        <form onSubmit={handleAddUser} className="flex gap-2 mb-6 animate-in fade-in zoom-in-95">
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name..."
            className="flex-grow h-12 text-base border-border/70 focus-visible:ring-primary/50"
          />
          <Button 
            type="submit" 
            size="lg" 
            className="px-4 h-12 bg-primary/90 hover:bg-primary transition-all" 
            disabled={!name.trim()}
          >
            <Plus className="w-5 h-5" />
            <span className="sr-only">Add User</span>
          </Button>
        </form>

        <div className="space-y-2 min-h-[60px]">
          {users.map((user, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between bg-card/70 p-3 rounded-lg border border-border/50 animate-in fade-in slide-in-from-bottom-3"
            >
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium">{user}</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => handleRemoveUser(user)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>

      <CardFooter className="p-8 pt-0">
        <Button 
          onClick={handleFinishSetup} 
          className="w-full h-14 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 animate-in fade-in zoom-in-95"
          disabled={users.length === 0}
        >
          Start Splitting <ArrowRight className="ml-3 h-6 w-6" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default UserSetup;
