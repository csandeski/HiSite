import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  X, 
  Copy, 
  Check, 
  QrCode,
  Info,
  Clock,
  ShieldCheck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PixPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PixPaymentModal({ open, onOpenChange }: PixPaymentModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  
  // Realistic Pix code format
  const pixCode = "00020126330014BR.GOV.BCB.PIX0114+551199999999952040000530398654043.005802BR5925RadioPlay Premium Service6009SAO PAULO62140510RADIOPLAY276304A3C5";

  const handleCopyPixCode = async () => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast({
        title: "Código copiado!",
        description: "O código Pix foi copiado para sua área de transferência.",
        duration: 3000,
      });
      
      // Reset copied state after 3 seconds
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o código. Tente selecionar e copiar manualmente.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handlePaymentConfirmation = () => {
    toast({
      title: "Verificando pagamento...",
      description: "Aguarde enquanto confirmamos seu pagamento.",
      duration: 3000,
    });
    // Close modal after a delay
    setTimeout(() => onOpenChange(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-full p-0 overflow-hidden mx-auto rounded-2xl">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full w-8 h-8 hover:bg-gray-100"
          onClick={() => onOpenChange(false)}
          data-testid="close-pix-modal"
        >
          <X className="w-4 h-4" />
        </Button>

        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4">
          <div className="flex items-center gap-3 text-white">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pagamento via Pix</h2>
              <p className="text-xs opacity-90">Premium Vitalício - R$ 27,00</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4">
          {/* QR Code Placeholder */}
          <div className="flex justify-center">
            <div className="w-48 h-48 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-3 shadow-lg">
              <div className="w-full h-full rounded bg-white flex items-center justify-center relative overflow-hidden">
                {/* QR Code Pattern Grid */}
                <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-2">
                  {[...Array(64)].map((_, i) => (
                    <div
                      key={i}
                      className={`${
                        Math.random() > 0.5 
                          ? 'bg-gray-900' 
                          : 'bg-white'
                      } ${
                        // Corner squares
                        (i < 3 || (i >= 8 && i < 11) || (i >= 16 && i < 19)) ||
                        (i >= 5 && i <= 7) || (i >= 13 && i <= 15) ||
                        (i >= 45 && i < 48) || (i >= 53 && i < 56) || (i >= 61)
                          ? 'bg-gray-900' 
                          : ''
                      }`}
                    />
                  ))}
                </div>
                {/* Center logo */}
                <div className="absolute w-12 h-12 bg-white rounded-lg shadow-md flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-md"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-medium text-blue-900">Como pagar:</p>
                <ol className="text-xs text-blue-700 space-y-0.5 list-decimal list-inside">
                  <li>Abra o app do seu banco</li>
                  <li>Escolha pagar com Pix</li>
                  <li>Escaneie o QR Code ou copie o código</li>
                  <li>Confirme o pagamento</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Pix Code Field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">Código Pix copia e cola</label>
            <div className="flex gap-2">
              <Input
                value={pixCode}
                readOnly
                className="font-mono text-xs bg-gray-50"
                data-testid="pix-code-input"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyPixCode}
                className="flex-shrink-0"
                data-testid="copy-pix-code"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Benefits reminder */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-900">
                Ativação automática
              </span>
            </div>
            <p className="text-xs text-purple-700 leading-relaxed">
              Após a confirmação do pagamento, seu plano Premium será ativado automaticamente 
              em até 5 minutos. Você receberá uma notificação de confirmação.
            </p>
          </div>

          {/* Timer info */}
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs">Este QR Code expira em 30 minutos</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col gap-3 pt-2">
            <Button
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-5 text-sm shadow-lg"
              onClick={handlePaymentConfirmation}
              data-testid="button-payment-done"
            >
              Já fiz o pagamento
            </Button>
            
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-5 text-sm font-medium"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-payment"
            >
              Cancelar
            </Button>
          </div>

          {/* Security note */}
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[10px] text-gray-500">
              Pagamento seguro processado via Pix
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}