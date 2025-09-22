import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
import { useUTMTracking } from "@/hooks/useUTMTracking";
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import PixQRCode from '@/components/PixQRCode';

interface PixPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type?: 'premium' | 'credits' | 'authorization' | 'pix_key_auth';
  amount?: number;
}

export default function PixPaymentModal({ open, onOpenChange, type = 'premium', amount = 27.00 }: PixPaymentModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const { getStoredUTMs } = useUTMTracking();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkingPayment, setCheckingPayment] = useState(false);
  
  // Force authorization to always be R$ 29.99
  // If type is authorization, ALWAYS use 29.99 regardless of what amount is passed
  const finalAmount = type === 'authorization' ? 29.99 : (type === 'pix_key_auth' ? 19.90 : amount);
  
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
    if (!pixData?.reference || !open) return;
    
    const checkInterval = setInterval(async () => {
      setCheckingPayment(true);
      try {
        const response = await fetch(`/api/payment/status/${pixData.reference}`);
        const data = await response.json();
        
        if (data.status === 'approved') {
          // Payment approved!
          let toastTitle = "Pagamento aprovado!";
          let toastDescription = "Seu pagamento foi processado com sucesso.";
          
          if (type === 'premium') {
            toastTitle = "Premium ativado!";
            toastDescription = "Sua assinatura Premium foi ativada com sucesso. Aproveite o multiplicador 3x!";
          } else if (type === 'credits') {
            toastTitle = "Créditos adicionados!";
            toastDescription = `R$ ${finalAmount.toFixed(2)} foram adicionados ao seu saldo.`;
          } else if (type === 'authorization') {
            toastTitle = "Conta autorizada!";
            toastDescription = "Sua conta foi autorizada com sucesso. Agora você tem acesso completo à plataforma.";
          } else if (type === 'pix_key_auth') {
            toastTitle = "Chave PIX Autenticada!";
            toastDescription = `Sua chave PIX foi autenticada com sucesso. R$ ${finalAmount.toFixed(2)} foram adicionados ao seu saldo como reembolso.`;
          }
          
          toast({
            title: toastTitle,
            description: toastDescription,
            duration: 5000,
          });
          
          // Close modal and refresh user data
          onOpenChange(false);
          
          // Refresh the page to update user status
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else if (data.status === 'rejected') {
          // Payment rejected
          toast({
            title: "Pagamento recusado",
            description: "Seu pagamento foi recusado. Por favor, tente novamente.",
            variant: "destructive",
            duration: 5000,
          });
          onOpenChange(false);
        }
        
        setCheckingPayment(false);
      } catch (error) {
        setCheckingPayment(false);
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(checkInterval);
  }, [pixData, open, type, finalAmount, onOpenChange, toast]);
  
  const generatePixPayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get stored UTM parameters from localStorage (or fallback to URL)
      const utms = getStoredUTMs();
      
      // Use dedicated endpoint for PIX key authentication
      const endpoint = type === 'pix_key_auth' 
        ? '/api/payment/pix-key-auth'
        : '/api/payment/create-pix';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          type,
          amount: finalAmount,
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
      <DialogContent className="w-[90%] max-w-sm p-0 mx-auto rounded-2xl overflow-hidden fixed top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] max-h-[90vh]">
        <DialogHeader className="sr-only">
          <DialogTitle>Pagamento via Pix</DialogTitle>
          <DialogDescription>
            Complete seu pagamento escaneando o QR Code ou copiando o código PIX
          </DialogDescription>
        </DialogHeader>
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
        <div className="max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Header with gradient - Blue for authorization/pix_key_auth, Purple for others */}
          <div className={`px-4 py-3 sticky top-0 z-10 ${
            type === 'authorization' || type === 'pix_key_auth'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
              : 'bg-gradient-to-r from-purple-500 to-pink-500'
          }`}>
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Pagamento via Pix</h2>
                <p className="text-[11px] opacity-90">
                  {type === 'premium' 
                    ? `Premium Vitalício - R$ ${finalAmount.toFixed(2)}` 
                    : type === 'credits'
                    ? `Adicionar R$ ${finalAmount.toFixed(2)} em créditos`
                    : type === 'pix_key_auth'
                    ? `Autenticação de Chave PIX - R$ ${finalAmount.toFixed(2)} (Reembolsável)`
                    : `Autorização de Conta - R$ ${finalAmount.toFixed(2)}`}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <Loader2 className={`w-8 h-8 animate-spin ${
                  type === 'authorization' || type === 'pix_key_auth' ? 'text-blue-500' : 'text-purple-500'
                }`} />
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
                  className={`text-white ${
                    type === 'authorization' || type === 'pix_key_auth'
                      ? 'bg-blue-500 hover:bg-blue-600'
                      : 'bg-purple-500 hover:bg-purple-600'
                  }`}
                  data-testid="retry-pix-generation"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : pixData ? (
              <>
                {/* QR Code Image - Beautiful and animated */}
                <div className="flex justify-center py-4">
                  <PixQRCode 
                    pixCode={pixData?.pix?.payload}
                    encodedImage={pixData?.pix?.encodedImage}
                    size={180}
                    color={type === 'authorization' || type === 'pix_key_auth' ? '#3B82F6' : '#A855F7'}
                  />
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
                  <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-200 max-h-20 overflow-y-auto">
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
              <div className={`rounded-lg p-2.5 border ${
                type === 'authorization' || type === 'pix_key_auth'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-purple-50 border-purple-200'
              }`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ShieldCheck className={`w-3.5 h-3.5 ${
                    type === 'authorization' || type === 'pix_key_auth' ? 'text-blue-600' : 'text-purple-600'
                  }`} />
                  <span className={`text-[11px] font-semibold ${
                    type === 'authorization' || type === 'pix_key_auth' ? 'text-blue-900' : 'text-purple-900'
                  }`}>
                    Ativação automática
                  </span>
                </div>
                <p className={`text-[10px] leading-relaxed ${
                  type === 'authorization' || type === 'pix_key_auth' ? 'text-blue-700' : 'text-purple-700'
                }`}>
                  {type === 'authorization' 
                    ? "Após a confirmação do pagamento, sua conta será autorizada automaticamente em até 5 minutos."
                    : type === 'pix_key_auth'
                    ? "Após a confirmação do pagamento, sua chave PIX será autenticada e o valor será reembolsado ao seu saldo."
                    : type === 'premium'
                    ? "Após a confirmação do pagamento, seu plano Premium será ativado automaticamente em até 5 minutos."
                    : "Após a confirmação do pagamento, os créditos serão adicionados automaticamente em até 5 minutos."}
                  {' '}Você receberá uma notificação de confirmação.
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