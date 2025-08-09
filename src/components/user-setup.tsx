"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { useAppDispatch } from '@/lib/store/context';
import { v4 as uuidv4 } from 'uuid';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Plus, User, ArrowRight, X, Users } from 'lucide-react';

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
    <div className="min-h-screen flex justify-center pt-2 sm:pt-4 overflow-hidden">
      <div className="w-full max-w-md mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-4 space-y-4">
          <div className="flex justify-center">
            <Image
              src="/ss-logo.png"
              alt="SplitSpree Logo"
              width={200}
              height={200}
              className="h-48 w-48 sm:h-56 sm:w-56 md:h-64 md:w-64 lg:h-72 lg:w-72 object-contain"
              priority
            />
          </div>
          
          <div className="space-y-2">
            <p className="text-base sm:text-lg text-muted-foreground/80 font-medium">
              Add people to your group to start splitting bills
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          
          {/* Add User Form */}
          <form onSubmit={handleAddUser}>
            <div className="relative">
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter a name..."
                className="h-12 text-base pl-6 pr-16 bg-card/70 backdrop-blur-md border-border/70 rounded-full transition-all duration-200 focus:border-border/70 focus:outline-none focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none [&:focus]:bg-card/80 [&:focus-visible]:bg-card/80 !outline-none !ring-0 !ring-offset-0"
              />
              <Button 
                type="submit" 
                size="icon"
                variant="star"
                className="absolute right-1 top-1 h-10 w-10 transition-all duration-200" 
                disabled={!name.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </form>

          {/* Users List */}
          {users.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground/70 font-medium">
                <Users className="w-4 h-4" />
                <span>{users.length} {users.length === 1 ? 'person' : 'people'} added</span>
              </div>
              
              <div className="space-y-2 max-h-[40vh] overflow-y-auto">
                {users.map((user, index) => (
                  <div 
                    key={index} 
                    className="group flex items-center justify-between bg-card/30 backdrop-blur-sm p-3 rounded-full border border-border/30 hover:border-border/50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <span className="font-medium text-foreground text-sm">{user}</span>
                    </div>
                      <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200"
                      onClick={() => handleRemoveUser(user)}
                    >
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {users.length === 0 && (
            <div className="text-center py-8 space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-muted/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground/60 text-sm">
                No one added yet. Start by adding the first person!
              </p>
            </div>
          )}
          

          {/* Continue Button */}
          <div className="pt-2">
            <Button 
              onClick={handleFinishSetup} 
              variant="star"
              size="star"
              className="w-full h-12 text-base font-semibold transition-all duration-300 disabled:opacity-50"
              disabled={users.length === 0}
            >
              {users.length === 0 ? (
                <>Add people to continue</>
              ) : (
                <>
                  Start Splitting
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserSetup;