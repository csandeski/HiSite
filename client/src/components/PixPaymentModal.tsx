import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
  const pixCode = "00020126330014BR.GOV.BCB.PIX0114+551199999999520400005303986540427.005802BR5925RadioPlay Premium Service6009SAO PAULO62140510RADIOPLAY276304A3C5";

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-sm p-0 mx-auto rounded-2xl max-h-[95vh] overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full w-7 h-7 hover:bg-white/20 bg-white/10"
          onClick={() => onOpenChange(false)}
          data-testid="close-pix-modal"
        >
          <X className="w-4 h-4 text-white" />
        </Button>

        {/* Scrollable content wrapper */}
        <div className="max-h-[95vh] overflow-y-auto">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-3 sticky top-0 z-10">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Pagamento via Pix</h2>
                <p className="text-[11px] opacity-90">Premium Vitalício - R$ 27,00</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* QR Code Placeholder - Smaller */}
            <div className="flex justify-center">
              <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-2.5 shadow-lg">
                <div className="w-full h-full rounded bg-white flex items-center justify-center relative overflow-hidden">
                  {/* QR Code Pattern Grid */}
                  <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-0.5 p-1.5">
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
                  <div className="absolute w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center">
                    <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Instructions - Compact */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-blue-900">Como pagar:</p>
                  <ol className="text-[10px] text-blue-700 space-y-0.5 list-decimal list-inside">
                    <li>Abra o app do seu banco</li>
                    <li>Escolha pagar com Pix</li>
                    <li>Escaneie o QR Code ou copie o código</li>
                    <li>Confirme o pagamento</li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Pix Code Field - Compact */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-gray-700">Código Pix copia e cola</label>
              <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200">
                <p className="font-mono text-[10px] text-gray-700 break-all leading-relaxed select-all">
                  {pixCode}
                </p>
              </div>
              {/* Copy button below the code */}
              <Button
                variant="outline"
                onClick={handleCopyPixCode}
                className="w-full h-10 font-medium"
                data-testid="copy-pix-code"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-green-600">Código copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar código pix
                  </>
                )}
              </Button>
            </div>

            {/* Benefits reminder - Compact */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span className="text-[11px] font-semibold text-purple-900">
                  Ativação automática
                </span>
              </div>
              <p className="text-[10px] text-purple-700 leading-relaxed">
                Após a confirmação do pagamento, seu plano Premium será ativado automaticamente 
                em até 5 minutos. Você receberá uma notificação de confirmação.
              </p>
            </div>

            {/* Timer info - Compact */}
            <div className="flex items-center justify-center gap-1.5 text-gray-500 py-2">
              <Clock className="w-3 h-3" />
              <span className="text-[10px]">Este QR Code expira em 30 minutos</span>
            </div>

            {/* Cancel button only */}
            <Button
              variant="outline"
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 h-10 text-sm font-medium"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-payment"
            >
              Cancelar
            </Button>

            {/* Security note - Compact */}
            <div className="flex items-center justify-center gap-1.5 pb-2">
              <ShieldCheck className="w-3 h-3 text-gray-400" />
              <span className="text-[9px] text-gray-500">
                Pagamento seguro processado via Pix
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}