"use client";

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { appReducer, initialState } from './reducer';
import type { AppState, Action } from './types';

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppState => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context.state;
};

export const useAppDispatch = (): React.Dispatch<Action> => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppDispatch must be used within an AppProvider');
  }
  return context.dispatch;
};
