import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { DollarSign, Check, X, AlertCircle } from "lucide-react";
import { useState, useEffect } from 'react';

interface ConversionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  points: number;
  value: number;
  onSuccess?: () => void;
}

export default function ConversionModal({ 
  open, 
  onOpenChange, 
  points, 
  value,
  onSuccess 
}: ConversionModalProps) {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');

  useEffect(() => {
    if (open && status === 'processing') {
      // Animate progress
      const duration = 3000; // 3 seconds
      const interval = 50; // Update every 50ms
      const increment = 100 / (duration / interval);
      
      const timer = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + increment, 100);
          
          if (newProgress >= 100) {
            clearInterval(timer);
            setTimeout(() => {
              setStatus('success');
              if (onSuccess) onSuccess();
              // Auto close after showing success
              setTimeout(() => {
                onOpenChange(false);
                // Reset for next use
                setTimeout(() => {
                  setProgress(0);
                  setStatus('processing');
                }, 300);
              }, 2000);
            }, 200);
          }
          
          return newProgress;
        });
      }, interval);

      return () => clearInterval(timer);
    }
  }, [open, status, onOpenChange, onSuccess]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-sm p-0 overflow-hidden mx-auto">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full w-8 h-8 hover:bg-gray-100"
          onClick={() => onOpenChange(false)}
          data-testid="close-conversion-modal"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6 text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center mb-3">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-500 ${
              status === 'processing' 
                ? 'bg-gradient-to-br from-purple-500 to-blue-500 animate-pulse' 
                : status === 'success' 
                ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                : 'bg-gradient-to-br from-red-500 to-pink-500'
            }`}>
              {status === 'processing' ? (
                <DollarSign className="w-10 h-10 text-white" />
              ) : status === 'success' ? (
                <Check className="w-10 h-10 text-white" />
              ) : (
                <AlertCircle className="w-10 h-10 text-white" />
              )}
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-900">
            {status === 'processing' 
              ? 'Processando...' 
              : status === 'success' 
              ? 'Conversão Concluída!' 
              : 'Erro na Conversão'}
          </h2>

          {/* Description */}
          {status === 'processing' ? (
            <>
              <p className="text-gray-600 text-sm">
                Convertendo seus pontos...
              </p>
              <p className="text-xs text-gray-500">
                Aguarde enquanto processamos sua conversão
              </p>
            </>
          ) : status === 'success' ? (
            <>
              <p className="text-gray-600 text-sm">
                Conversão realizada com sucesso!
              </p>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
                <p className="text-sm font-semibold text-green-800">
                  R$ {value.toFixed(2)} adicionado ao saldo
                </p>
                <p className="text-xs text-green-600 mt-1">
                  {points} pontos convertidos
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-600 text-sm">
              Ocorreu um erro ao processar sua conversão. Tente novamente.
            </p>
          )}

          {/* Progress Bar */}
          {status === 'processing' && (
            <div className="space-y-2">
              <Progress 
                value={progress} 
                className="h-2"
              />
              <p className="text-xs text-gray-500 font-medium">
                {Math.round(progress)}% concluído
              </p>
            </div>
          )}

          {/* Status Box */}
          {status === 'processing' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-xs text-blue-700 font-medium">
                  Validando pontos e processando pagamento...
                </p>
              </div>
            </div>
          )}

          {/* Success Button */}
          {status === 'success' && (
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-5 text-sm shadow-lg mt-4"
              onClick={() => onOpenChange(false)}
              data-testid="button-close-success"
            >
              Fechar
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}