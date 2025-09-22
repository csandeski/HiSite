import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  X, 
  Radio, 
  AlertCircle,
  Rocket,
  Lock
} from "lucide-react";
import { radios } from '../App';
import MessagePaymentModal from './MessagePaymentModal';
import PremiumAloModal from './PremiumAlôModal';
import { useAuth } from '@/contexts/AuthContext';
import jovemPanLogo from '@assets/channels4_profile-removebg-preview_1758313844024.png';

interface SendMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SendMessageModal({ open, onOpenChange }: SendMessageModalProps) {
  const { user } = useAuth();
  const [selectedRadio, setSelectedRadio] = useState<string>("");
  const [message, setMessage] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [errors, setErrors] = useState({ radio: false, message: false });

  // Verificar se usuário é premium quando o modal abrir
  useEffect(() => {
    if (open && user && !user.isPremium) {
      // Se não for premium, fecha o modal de mensagem e abre o de premium
      onOpenChange(false);
      setShowPremiumModal(true);
    }
  }, [open, user]);

  const characterCount = message.length;
  const isExtended = characterCount > 100;
  const price = isExtended ? 16.80 : 9.90;
  const originalPrice = 18.99;

  const handleSendMessage = () => {
    let hasError = false;
    const newErrors = { radio: false, message: false };

    if (!selectedRadio) {
      newErrors.radio = true;
      hasError = true;
    }

    if (!message.trim()) {
      newErrors.message = true;
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      setShowPaymentModal(true);
    }
  };

  const handleModalClose = (isOpen: boolean) => {
    if (!isOpen) {
      // Reset form when closing
      setSelectedRadio("");
      setMessage("");
      setErrors({ radio: false, message: false });
    }
    onOpenChange(isOpen);
  };

  const handlePaymentModalClose = (isOpen: boolean) => {
    setShowPaymentModal(isOpen);
    if (!isOpen) {
      // Close both modals after payment
      handleModalClose(false);
    }
  };

  const selectedRadioData = radios.find(r => r.id === Number(selectedRadio));

  return (
    <>
      <Dialog open={open} onOpenChange={handleModalClose}>
        <DialogContent className="w-[90%] max-w-md p-0 mx-auto rounded-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-4 py-4 rounded-t-2xl relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 z-10 rounded-full w-7 h-7 hover:bg-white/20 bg-white/10"
              onClick={() => handleModalClose(false)}
              data-testid="close-message-modal"
            >
              <X className="w-4 h-4 text-white" />
            </Button>
            <div className="text-white">
              <h2 className="text-lg font-bold mb-1">📢 Envie seu Alô!</h2>
              <p className="text-sm opacity-90">Seu recado na rádio favorita</p>
            </div>
            {user && user.isPremium && (
              <div className="absolute right-12 top-3">
                <div className="bg-yellow-400 text-xs font-bold text-gray-900 px-2 py-0.5 rounded-full flex items-center gap-1">
                  ⭐ Premium
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Radio Selection */}
            <div className="space-y-2">
              <Label htmlFor="radio-select" className="text-sm font-medium">
                Escolha a rádio
              </Label>
              <Select 
                value={selectedRadio} 
                onValueChange={setSelectedRadio}
                data-testid="radio-select"
              >
                <SelectTrigger 
                  id="radio-select"
                  className={`w-full ${errors.radio ? 'border-red-500' : ''}`}
                  data-testid="radio-select-trigger"
                >
                  <SelectValue placeholder="Selecione uma rádio" />
                </SelectTrigger>
                <SelectContent>
                  {radios.map((radio) => (
                    <SelectItem 
                      key={radio.id} 
                      value={radio.id.toString()}
                      data-testid={`radio-option-${radio.id}`}
                    >
                      <div className="flex items-center gap-2">
                        {radio.id === 1 ? (
                          <img 
                            src={jovemPanLogo} 
                            alt="Jovem Pan Sports" 
                            className="w-4 h-4 object-contain"
                          />
                        ) : (
                          <Radio className="w-3 h-3 text-gray-500" />
                        )}
                        <span>{radio.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.radio && (
                <p className="text-xs text-red-500">Por favor, selecione uma rádio</p>
              )}
            </div>

            {/* Message Input */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="message" className="text-sm font-medium">
                  Seu recado
                </Label>
                <span 
                  className={`text-xs ${
                    isExtended ? 'text-orange-600 font-semibold' : 'text-gray-500'
                  }`}
                  data-testid="character-counter"
                >
                  {characterCount}/100 caracteres
                </span>
              </div>
              <Textarea
                id="message"
                placeholder="Digite seu recado aqui..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className={`min-h-[100px] resize-none ${errors.message ? 'border-red-500' : ''}`}
                data-testid="message-input"
              />
              {errors.message && (
                <p className="text-xs text-red-500">Por favor, digite seu recado</p>
              )}
              
              {isExtended && (
                <div className="flex items-start gap-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
                  <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-orange-700">
                    Mensagem estendida! Será cobrada taxa extra de R$ 6,90
                  </p>
                </div>
              )}
            </div>

            {/* Price Display */}
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Valor total:</span>
                <div className="flex items-center gap-2">
                  {!isExtended && (
                    <span className="text-sm text-gray-400 line-through">
                      R$ {originalPrice.toFixed(2).replace('.', ',')}
                    </span>
                  )}
                  <span className={`font-bold ${isExtended ? 'text-orange-600 text-lg' : 'text-green-600 text-lg'}`}>
                    R$ {price.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
              {!isExtended && (
                <p className="text-xs text-green-600 mt-1">
                  Promoção especial! Economize R$ 9,09
                </p>
              )}
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-5"
              data-testid="send-message-button"
            >
              <Rocket className="w-5 h-5 mr-2" />
              Enviar meu Alô agora
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <MessagePaymentModal
        open={showPaymentModal}
        onOpenChange={handlePaymentModalClose}
        selectedRadio={selectedRadioData}
        message={message}
        price={price}
      />

      <PremiumAloModal
        open={showPremiumModal}
        onOpenChange={setShowPremiumModal}
      />
    </>
  );
}