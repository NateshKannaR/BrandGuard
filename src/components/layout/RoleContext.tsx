'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { DEMO_USERS } from '@/lib/storage/mock-data';

interface RoleContextType {
  currentUser: User;
  users: User[];
  switchUser: (userId: string) => Promise<void>;
  resetDemoData: () => Promise<void>;
  isLoading: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('/api/users');
        const json = await res.json();
        if (json.success && json.data) {
          setUsers(json.data.users);
          if (json.data.currentUser) {
            setCurrentUser(json.data.currentUser);
          }
        }
      } catch (e) {
        console.error('Failed to load user session', e);
      }
    }
    fetchUsers();
  }, []);

  const switchUser = async (userId: string) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const json = await res.json();
      if (json.success) {
        setCurrentUser(json.data);
      }
    } catch (e) {
      console.error('Failed to switch user', e);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDemoData = async () => {
    if (confirm('Reset NovaTech workspace to initial demo state? This will restore standard guidelines, submissions, and metrics.')) {
      setIsLoading(true);
      try {
        await fetch('/api/demo/reset', { method: 'POST' });
        window.location.reload();
      } catch (e) {
        console.error('Failed to reset demo data', e);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <RoleContext.Provider value={{ currentUser, users, switchUser, resetDemoData, isLoading }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
}
