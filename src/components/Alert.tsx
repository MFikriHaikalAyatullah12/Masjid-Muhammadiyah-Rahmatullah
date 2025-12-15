import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, title, message, onClose }: AlertProps) {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      iconColor: 'text-emerald-600',
      titleColor: 'text-emerald-900',
      messageColor: 'text-emerald-700'
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100',
      iconColor: 'text-red-600',
      titleColor: 'text-red-900',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100',
      iconColor: 'text-orange-600',
      titleColor: 'text-orange-900',
      messageColor: 'text-orange-700'
    },
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-900',
      messageColor: 'text-blue-700'
    }
  };

  const { icon: Icon, bgColor, borderColor, iconColor, titleColor, messageColor } = config[type];

  return (
    <div className={`rounded-xl border p-4 ${bgColor} ${borderColor} shadow-sm`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-semibold ${titleColor} mb-1`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${messageColor}`}>
            <p>{message}</p>
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={`inline-flex rounded-lg p-1.5 hover:bg-white transition-colors ${iconColor}`}
            >
              <span className="sr-only">Tutup</span>
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}