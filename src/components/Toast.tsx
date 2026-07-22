/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'danger' | 'info';

export interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-50 border-emerald-100',
          text: 'text-emerald-800',
          icon: <CheckCircle2 className="h-5 w-5 text-emerald-550 text-emerald-600" />,
        };
      case 'danger':
        return {
          bg: 'bg-rose-50 border-rose-100',
          text: 'text-rose-800',
          icon: <AlertCircle className="h-5 w-5 text-rose-550 text-rose-600" />,
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50 border-blue-100',
          text: 'text-blue-800',
          icon: <Info className="h-5 w-5 text-blue-550 text-blue-600" />,
        };
    }
  };

  const style = getStyle();

  return (
    <div className={`fixed bottom-5 right-5 z-55 flex items-center gap-3 px-4 py-3.5 rounded-2xl border ${style.bg} ${style.text} shadow-lg shadow-slate-100 max-w-md animate-slide-in`}>
      {style.icon}
      <p className="text-sm font-medium pr-2">{message}</p>
      <button
        onClick={onClose}
        className="p-0.5 hover:bg-black/5 rounded-md transition-colors"
      >
        <X className="h-4 w-4 opacity-60 hover:opacity-100" />
      </button>
    </div>
  );
};
