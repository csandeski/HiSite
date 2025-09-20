import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  X, 
  Copy, 
  Check, 
  QrCode,
  Info,
  Clock,
  ShieldCheck,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';

interface PixPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'premium' | 'credits';
  amount?: number;
}

export default function PixPaymentModal({ open, onOpenChange, type = 'premium', amount = 27.00 }: PixPaymentModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  
  // Generate PIX payment when modal opens
  useEffect(() => {
    if (open && !pixData) {
      generatePixPayment();
    }
    // Reset state when modal closes
    if (!open) {
      setPixData(null);
      setError(null);
      setLoading(false);
      setCheckingPayment(false);
    }
  }, [open]);
  
  // Check payment status periodically
  useEffect(() => {
    if (!pixData || !open) return;
    
    const checkInterval = setInterval(async () => {
      setCheckingPayment(true);
      try {
        // Here we could check payment status via webhook or polling
        // For now, we'll let the webhook handle it
        setCheckingPayment(false);
      } catch (error) {
        setCheckingPayment(false);
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(checkInterval);
  }, [pixData, open]);
  
  const generatePixPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get UTM parameters if they exist
      const urlParams = new URLSearchParams(window.location.search);
      const utms = {
        utmSource: urlParams.get('utm_source') || undefined,
        utmMedium: urlParams.get('utm_medium') || undefined,
        utmCampaign: urlParams.get('utm_campaign') || undefined,
        utmTerm: urlParams.get('utm_term') || undefined,
        utmContent: urlParams.get('utm_content') || undefined
      };
      
      const response = await fetch('/api/payment/create-pix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          amount,
          utms
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setPixData(data);
      } else {
        throw new Error(data.error || 'Erro ao gerar pagamento');
      }
    } catch (error: any) {
      console.error('Error generating PIX payment:', error);
      setError(error.message || 'Erro ao gerar código PIX. Por favor, tente novamente.');
      toast({
        title: "Erro ao gerar pagamento",
        description: error.message || "Não foi possível gerar o código PIX. Tente novamente.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPixCode = async () => {
    if (!pixData?.pix?.payload) return;
    
    try {
      await navigator.clipboard.writeText(pixData.pix.payload);
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
                <p className="text-[11px] opacity-90">
                  {type === 'premium' ? `Premium Vitalício - R$ ${amount.toFixed(2)}` : `Adicionar R$ ${amount.toFixed(2)} em créditos`}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                <p className="text-sm text-gray-600">Gerando código PIX...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-8 h-8 text-red-500" />
                </div>
                <p className="text-sm text-red-600 text-center">{error}</p>
                <Button
                  onClick={generatePixPayment}
                  className="bg-purple-500 hover:bg-purple-600 text-white"
                  data-testid="retry-pix-generation"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : pixData ? (
              <>
                {/* QR Code Image */}
                <div className="flex justify-center">
                  {pixData.pix?.encodedImage ? (
                    <img 
                      src={`data:image/png;base64,${pixData.pix.encodedImage}`}
                      alt="QR Code PIX"
                      className="w-48 h-48 sm:w-56 sm:h-56 rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 p-2.5 shadow-lg">
                      <div className="w-full h-full rounded bg-white flex items-center justify-center">
                        <QrCode className="w-16 h-16 text-gray-400" />
                      </div>
                    </div>
                  )}
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
                      {pixData?.pix?.payload || 'Código não disponível'}
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

                {/* Payment info */}
                {pixData?.transactionId && (
                  <div className="flex items-center justify-center gap-1.5 text-gray-500">
                    <span className="text-[10px]">
                      ID da transação: {pixData.transactionId}
                    </span>
                    {checkingPayment && (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    )}
                  </div>
                )}
              </>
            ) : null}
            
            {/* Benefits reminder - Compact */}
            {!loading && !error && (
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
            )}

            {/* Timer info - Compact */}
            {!loading && !error && (
              <div className="flex items-center justify-center gap-1.5 text-gray-500 py-2">
                <Clock className="w-3 h-3" />
                <span className="text-[10px]">Este QR Code expira em 30 minutos</span>
              </div>
            )}

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