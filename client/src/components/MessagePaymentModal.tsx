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
  Radio,
  MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jovemPanLogo from '@assets/channels4_profile-removebg-preview_1758313844024.png';

interface MessagePaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedRadio?: {
    id: number;
    name: string;
    description: string;
    pointsPerMin: number;
    isPremium: boolean;
  };
  message: string;
  price: number;
}

export default function MessagePaymentModal({ 
  open, 
  onOpenChange,
  selectedRadio,
  message,
  price
}: MessagePaymentModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("");
  
  // Generate unique Pix code for message payment
  const pixCode = `00020126330014BR.GOV.BCB.PIX0114+551199999999520400005303986540${price.toFixed(2)}5802BR5925RadioPlay Alo Service6009SAO PAULO62140510RADIOALO${Date.now()}6304B2D7`;

  // Calculate delivery time (current time + 8 minutes in Brazil timezone)
  useEffect(() => {
    const calculateDeliveryTime = () => {
      const now = new Date();
      const deliveryDate = new Date(now.getTime() + 8 * 60 * 1000); // Add 8 minutes
      
      // Format time in Brazil timezone (Brasília time)
      const options: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      };
      
      const formattedTime = new Intl.DateTimeFormat('pt-BR', options).format(deliveryDate);
      setDeliveryTime(formattedTime);
    };

    if (open) {
      calculateDeliveryTime();
      // Update every minute
      const interval = setInterval(calculateDeliveryTime, 60000);
      return () => clearInterval(interval);
    }
  }, [open]);

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

  const truncateMessage = (text: string, maxLength: number = 80) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!selectedRadio) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] sm:max-w-sm p-0 mx-auto rounded-2xl max-h-[90vh] overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full w-7 h-7 hover:bg-white/20 bg-white/10"
          onClick={() => onOpenChange(false)}
          data-testid="close-payment-modal"
        >
          <X className="w-4 h-4 text-white" />
        </Button>

        {/* Scrollable content wrapper */}
        <div className="max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {/* Header with gradient */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 sticky top-0 z-10">
            <div className="flex items-center gap-2.5 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold">Pagamento do Alô</h2>
                <p className="text-[11px] opacity-90">
                  R$ {price.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-3">
            {/* Message Preview */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <MessageSquare className="w-4 h-4" />
                <span>Seu recado:</span>
              </div>
              <p className="text-sm text-gray-600 italic">
                "{truncateMessage(message)}"
              </p>
            </div>

            {/* Radio Selected */}
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                {selectedRadio.id === 1 ? (
                  <img 
                    src={jovemPanLogo} 
                    alt="Jovem Pan Sports" 
                    className="w-5 h-5 object-contain"
                  />
                ) : (
                  <Radio className="w-4 h-4 text-blue-600" />
                )}
                <div>
                  <p className="text-xs text-blue-600 font-medium">Será enviado para:</p>
                  <p className="text-sm font-semibold text-gray-800">{selectedRadio.name}</p>
                </div>
              </div>
            </div>

            {/* Delivery Time */}
            <div className="bg-green-50 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-medium">Seu alô será enviado em:</p>
                  <p className="text-sm font-bold text-gray-800" data-testid="delivery-time">
                    {deliveryTime}
                  </p>
                </div>
              </div>
            </div>

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
                    <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded"></div>
                  </div>
                </div>
              </div>
            </div>


            {/* Pix Code Copy Section - Compact */}
            <div className="bg-white border border-gray-200 rounded-lg p-2.5">
              <p className="text-[10px] font-medium text-gray-700 mb-1.5">
                Código Pix (copia e cola):
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 rounded p-2 overflow-hidden">
                  <p className="text-[10px] text-gray-600 break-all font-mono leading-tight">
                    {pixCode.substring(0, 35)}...
                  </p>
                </div>
                <Button
                  onClick={handleCopyPixCode}
                  variant={copied ? "default" : "outline"}
                  size="sm"
                  className={`${
                    copied 
                      ? 'bg-green-500 hover:bg-green-600 text-white' 
                      : ''
                  } h-auto py-2 px-3`}
                  data-testid="copy-pix-button"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 mr-1" />
                      <span className="text-xs">Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Total Value Summary - Compact */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-3 text-white">
              <div className="flex justify-between items-center">
                <span className="text-xs opacity-90">Valor total:</span>
                <span className="text-lg font-bold">
                  R$ {price.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-[10px] opacity-80 mt-1">
                Após o pagamento, seu alô será enviado automaticamente
              </p>
            </div>

            {/* Cancel Button */}
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="w-full py-3 border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
              data-testid="cancel-payment-button"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}