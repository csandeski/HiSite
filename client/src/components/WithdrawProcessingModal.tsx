import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";

interface WithdrawProcessingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function WithdrawProcessingModal({ 
  open, 
  onOpenChange 
}: WithdrawProcessingModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90%] max-w-xs p-0 overflow-hidden mx-auto">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full w-8 h-8 hover:bg-gray-100"
          onClick={() => onOpenChange(false)}
          data-testid="close-processing-modal"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-6 text-center space-y-4">
          {/* Loading Icon */}
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          </div>

          {/* Text */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Processando Saque
            </h3>
            <p className="text-sm text-gray-600">
              Aguarde enquanto processamos sua solicitação...
            </p>
          </div>

          {/* Loading dots animation */}
          <div className="flex justify-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}