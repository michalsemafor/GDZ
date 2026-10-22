import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-white/95 backdrop-blur border border-slate-200 text-slate-800 shadow-xl rounded-xl p-4 max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-200">
      <div className="shrink-0 mt-0.5">
        {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
        {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600" />}
      </div>
      <div className="flex-1 pr-2">
        <h4 className="text-sm font-semibold text-slate-900">{toast.title}</h4>
        {toast.description && (
          <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
