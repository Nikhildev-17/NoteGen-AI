import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} color="#34d399" />,
    error: <AlertCircle size={18} color="#f87171" />,
    info: <Info size={18} color="#60a5fa" />,
  };

  return (
    <div className="toast-container">
      <div className="toast animate-fade-in">
        {icons[toast.type] || icons.info}
        <span style={{ fontWeight: 500 }}>{toast.message}</span>
        <button
          onClick={onClose}
          style={{ marginLeft: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center' }}
          aria-label="Close"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
