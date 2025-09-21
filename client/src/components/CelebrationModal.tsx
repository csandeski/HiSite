import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Users, Trophy, X } from "lucide-react";

interface CelebrationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CelebrationModal({ open, onOpenChange }: CelebrationModalProps) {
  const handleContinue = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[calc(100%-2rem)] max-w-[calc(100%-2rem)] sm:w-full p-0 overflow-hidden mx-auto rounded-lg">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 z-10 rounded-full w-8 h-8 hover:bg-gray-100"
          onClick={() => onOpenChange(false)}
          data-testid="close-celebration-modal"
        >
          <X className="w-4 h-4" />
        </Button>

        <div className="p-4 sm:p-6 text-center space-y-4">
          {/* Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center animate-pulse">
              <Trophy className="w-10 h-10 text-white" fill="white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
            RádioPlay COMEMORA!
          </h2>

          {/* Description */}
          <div className="text-gray-600 text-sm leading-relaxed px-2 sm:px-4 space-y-2">
            <p>
              A RádioPlay atingiu o marco de mais de <span className="font-bold text-green-600">53.000</span> usuários ativos!
            </p>
            <p className="flex items-center justify-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span>E Mais de <span className="font-bold text-blue-600">8.300</span> usuários simultâneos neste exato momento!</span>
            </p>
          </div>

          {/* Celebration Message */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-3 sm:p-4 mt-4">
            <p className="text-xs sm:text-sm text-gray-700 font-medium">
              🎉 Obrigado por fazer parte desta comunidade incrível!
            </p>
          </div>

          {/* Button */}
          <div className="flex flex-col gap-3 pt-2 sm:pt-4">
            <Button
              className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-semibold py-5 sm:py-6 text-sm sm:text-base shadow-lg"
              onClick={handleContinue}
              data-testid="button-continue-celebration"
            >
              Continuar Ganhando!
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}