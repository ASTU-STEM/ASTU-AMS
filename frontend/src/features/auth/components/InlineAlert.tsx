import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface InlineAlertProps {
  type: 'error' | 'warning' | 'success' | 'info';
  title?: string;
  message: string;
  className?: string;
  action?: React.ReactNode;
}

export default function InlineAlert({
  type,
  title,
  message,
  className = '',
  action
}: InlineAlertProps) {
  const styles = {
    error: {
      bg: 'bg-red-50 border-red-200 text-red-800',
      icon: <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />,
      title: title || 'Error'
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />,
      title: title || 'Warning'
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />,
      title: title || 'Success'
    },
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />,
      title: title || 'Information'
    }
  };

  const currentStyle = styles[type];

  return (
    <div 
      className={`flex flex-col gap-3 rounded-lg border p-4 text-xs transition-all leading-normal ${currentStyle.bg} ${className}`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
    >
      <div className="flex gap-2.5 items-start">
        {currentStyle.icon}
        <div className="flex-1">
          <span className="font-bold block mb-0.5 text-[13px]">{currentStyle.title}</span>
          <span className="text-[12px] opacity-95">{message}</span>
        </div>
      </div>
      {action && (
        <div className="pt-2 border-t border-black/5 flex justify-end">
          {action}
        </div>
      )}
    </div>
  );
}
