"use client";

import React from 'react';
import { useApp } from '@/lib/store/context';
import UserCard from './user-card';

const UserBreakdown = () => {
  const { users } = useApp();

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <h2 className="text-lg font-headline font-semibold text-center">Who Owes What</h2>
      </div>
      <div className="flex-grow p-2 space-y-2">
        {users.map(user => (
          <UserCard key={user.id} userId={user.id} />
        ))}
        {users.length === 0 && (
          <div className="text-center text-muted-foreground p-8">No users have been added yet.</div>
        )}
      </div>
    </div>
  );
};

export default UserBreakdown;
