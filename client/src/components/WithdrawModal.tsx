import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Wallet, Key, AlertCircle } from "lucide-react";
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onConfirm: (amount: number, pixType: string, pixKey: string) => void;
}

export default function WithdrawModal({ 
  open, 
  onOpenChange, 
  balance,
  onConfirm 
}: WithdrawModalProps) {
  const { toast } = useToast();
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [pixType, setPixType] = useState("");
  const [pixKey, setPixKey] = useState("");
  const [errors, setErrors] = useState<{amount?: string, pixKey?: string}>({});
  
  const minimumWithdrawal = 150;
  const maxWithdrawal = balance;

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setAmount("");
      setPixType("");
      setPixKey("");
      setErrors({});
    }
  }, [open]);

  // Format currency input
  const handleAmountChange = (value: string) => {
    // Remove all non-numeric characters except comma and dot
    const cleaned = value.replace(/[^0-9.,]/g, '');
    // Replace comma with dot for calculation
    const normalized = cleaned.replace(',', '.');
    setAmount(normalized);
    
    // Clear error when typing
    if (errors.amount) {
      setErrors(prev => ({ ...prev, amount: undefined }));
    }
  };

  // Format Pix key based on type
  const formatPixKey = (value: string, type: string) => {
    let formatted = value;
    
    switch (type) {
      case 'cpf':
        // Format as XXX.XXX.XXX-XX
        formatted = value.replace(/\D/g, '');
        if (formatted.length <= 11) {
          formatted = formatted.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
        }
        break;
      case 'cnpj':
        // Format as XX.XXX.XXX/XXXX-XX
        formatted = value.replace(/\D/g, '');
        if (formatted.length <= 14) {
          formatted = formatted.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
        }
        break;
      case 'phone':
        // Format as (XX) XXXXX-XXXX
        formatted = value.replace(/\D/g, '');
        if (formatted.length <= 11) {
          formatted = formatted.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        break;
      case 'email':
        formatted = value.toLowerCase();
        break;
      case 'random':
        // Random keys are usually UUID format
        formatted = value;
        break;
    }
    
    return formatted;
  };

  const handlePixKeyChange = (value: string) => {
    const formatted = formatPixKey(value, pixType);
    setPixKey(formatted);
    
    // Clear error when typing
    if (errors.pixKey) {
      setErrors(prev => ({ ...prev, pixKey: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: {amount?: string, pixKey?: string} = {};
    const numAmount = parseFloat(amount);
    
    // Validate amount
    if (!amount || isNaN(numAmount)) {
      newErrors.amount = "Digite um valor válido";
    } else if (numAmount < minimumWithdrawal) {
      newErrors.amount = `Valor mínimo: R$ ${minimumWithdrawal.toFixed(2)}`;
    } else if (numAmount > maxWithdrawal) {
      newErrors.amount = `Valor máximo: R$ ${maxWithdrawal.toFixed(2)}`;
    }
    
    // Validate Pix key
    if (!pixType) {
      newErrors.pixKey = "Selecione o tipo de chave Pix";
    } else if (!pixKey) {
      newErrors.pixKey = "Digite sua chave Pix";
    } else {
      // Validate format based on type
      switch (pixType) {
        case 'cpf':
          if (pixKey.replace(/\D/g, '').length !== 11) {
            newErrors.pixKey = "CPF deve ter 11 dígitos";
          }
          break;
        case 'cnpj':
          if (pixKey.replace(/\D/g, '').length !== 14) {
            newErrors.pixKey = "CNPJ deve ter 14 dígitos";
          }
          break;
        case 'phone':
          if (pixKey.replace(/\D/g, '').length < 10) {
            newErrors.pixKey = "Telefone inválido";
          }
          break;
        case 'email':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(pixKey)) {
            newErrors.pixKey = "Email inválido";
          }
          break;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = () => {
    if (validateForm()) {
      const numAmount = parseFloat(amount);
      // Proceed with withdrawal (authorization check happens in parent component)
      onConfirm(numAmount, pixType, pixKey);
    }
  };

  const getPixKeyPlaceholder = () => {
    switch (pixType) {
      case 'cpf': return "123.456.789-00";
      case 'cnpj': return "12.345.678/0001-00";
      case 'phone': return "(11) 98765-4321";
      case 'email': return "seu@email.com";
      case 'random': return "12345678-abcd-1234-abcd-123456789012";
      default: return "Selecione o tipo de chave primeiro";
    }
  };

  const getPixKeyLabel = () => {
    switch (pixType) {
      case 'cpf': return "CPF";
      case 'cnpj': return "CNPJ";
      case 'phone': return "Celular";
      case 'email': return "Email";
      case 'random': return "Chave aleatória";
      default: return "Chave Pix";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-md bg-white rounded-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-gray-900">Realizar Saque</DialogTitle>
          </div>
          <p className="text-sm text-gray-600 mt-1">Transfira seu saldo para sua conta via Pix</p>
        </DialogHeader>
        
        <div className="space-y-4 pt-4 overflow-y-auto flex-1">
          {/* Balance Info */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-green-600" />
                <span className="text-sm text-gray-700">Saldo disponível</span>
              </div>
              <span className="text-lg font-bold text-green-600">R$ {balance.toFixed(2)}</span>
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
              Valor do saque
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">R$</span>
              <Input
                id="amount"
                type="text"
                placeholder="0,00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className={`pl-10 text-lg font-semibold ${errors.amount ? 'border-red-500' : ''}`}
                data-testid="input-withdraw-amount"
              />
            </div>
            {errors.amount && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.amount}
              </p>
            )}
            <p className="text-xs text-gray-500">
              Mínimo: R$ {minimumWithdrawal.toFixed(2)} • Máximo: R$ {maxWithdrawal.toFixed(2)}
            </p>
          </div>

          {/* Pix Type Selection */}
          <div className="space-y-2">
            <Label htmlFor="pix-type" className="text-sm font-medium text-gray-700">
              Tipo de chave Pix
            </Label>
            <Select value={pixType} onValueChange={setPixType}>
              <SelectTrigger 
                id="pix-type" 
                className={errors.pixKey && !pixType ? 'border-red-500' : ''}
                data-testid="select-pix-type"
              >
                <SelectValue placeholder="Selecione o tipo de chave" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpf">CPF</SelectItem>
                <SelectItem value="cnpj">CNPJ</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="phone">Celular</SelectItem>
                <SelectItem value="random">Chave aleatória</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Pix Key Input */}
          {pixType && (
            <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
              <Label htmlFor="pix-key" className="text-sm font-medium text-gray-700">
                {getPixKeyLabel()}
              </Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="pix-key"
                  type={pixType === 'email' ? 'email' : 'text'}
                  placeholder={getPixKeyPlaceholder()}
                  value={pixKey}
                  onChange={(e) => handlePixKeyChange(e.target.value)}
                  className={`pl-10 ${errors.pixKey && pixKey ? 'border-red-500' : ''}`}
                  data-testid="input-pix-key"
                />
              </div>
              {errors.pixKey && pixKey && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.pixKey}
                </p>
              )}
            </div>
          )}

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-amber-900">Importante</p>
                <p className="text-xs text-amber-800">
                  Verifique os dados antes de confirmar. O valor será transferido imediatamente após a confirmação.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1 py-5 border-gray-300 hover:bg-gray-50"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-withdraw"
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 py-5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold"
              onClick={handleConfirm}
              data-testid="button-confirm-withdraw"
            >
              Confirmar Saque
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}