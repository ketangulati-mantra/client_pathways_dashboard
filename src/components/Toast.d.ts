import React from 'react';

export interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info' | string, duration?: number) => void;
}

export const ToastProvider: React.FC<{ children: React.ReactNode }>;
export const useToast: () => ToastContextType;
