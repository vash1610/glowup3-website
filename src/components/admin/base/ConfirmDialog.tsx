'use client';

import React, { useEffect, useRef } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

type ConfirmDialogVariant = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmDialogVariant;
  loading?: boolean;
}

const variantConfig: Record<ConfirmDialogVariant, { 
  icon: React.ReactNode; 
  buttonClass: string;
  iconBg: string;
}> = {
  danger: {
    icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
    iconBg: 'bg-red-500/10',
    buttonClass: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/50',
  },
  warning: {
    icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
    iconBg: 'bg-yellow-500/10',
    buttonClass: 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-500/50',
  },
  info: {
    icon: <Info className="w-6 h-6 text-blue-400" />,
    iconBg: 'bg-blue-500/10',
    buttonClass: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/50',
  },
  success: {
    icon: <CheckCircle className="w-6 h-6 text-green-400" />,
    iconBg: 'bg-green-500/10',
    buttonClass: 'bg-green-500 hover:bg-green-600 focus:ring-green-500/50',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  loading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const config = variantConfig[variant];

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <div 
        ref={dialogRef}
        className="w-full max-w-md bg-[#0a0a0f] border border-white/[0.08] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between p-4 border-b border-white/[0.08]">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-xl ${config.iconBg}`}>
              {config.icon}
            </div>
            <p className="text-sm text-white/70 mt-1">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/[0.08]">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0f] disabled:opacity-50 ${config.buttonClass}`}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
