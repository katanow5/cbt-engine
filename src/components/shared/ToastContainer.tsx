import React from 'react';
import { useCbt } from '../../context/CbtContext';
import { CheckCircle2, AlertTriangle, Info, AlertOctagon, X } from 'lucide-react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';

export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useCbt();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const iconMap = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
          info: <Info className="w-5 h-5 text-primary shrink-0" />,
          error: <AlertOctagon className="w-5 h-5 text-destructive shrink-0" />,
        };

        const borderMap = {
          success: 'border-emerald-500/30 bg-card text-foreground',
          warning: 'border-amber-500/30 bg-card text-foreground',
          info: 'border-primary/30 bg-card text-foreground',
          error: 'border-destructive/30 bg-card text-foreground',
        };

        return (
          <Card
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 shadow-lg backdrop-blur-md transition-all duration-300 transform translate-y-0 ${borderMap[toast.type]}`}
          >
            {iconMap[toast.type]}
            <div className="flex-1 text-xs font-medium leading-snug">{toast.message}</div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissToast(toast.id)}
              className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
              aria-label="Tutup notifikasi"
            >
              <X className="w-3.5 h-3.5" />
            </Button>
          </Card>
        );
      })}
    </div>
  );
};
