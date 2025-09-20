import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Smartphone, Share2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { pwaManager } from '@/lib/pwa';

export function PWAInstallButton() {
  const [canInstall, setCanInstall] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    setIsInstalled(pwaManager.isInstalled());
    
    // Check if can prompt install
    setCanInstall(pwaManager.canPromptInstall());
    
    // Listen for install available event
    const handleInstallAvailable = () => {
      setCanInstall(true);
    };
    
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    
    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    if (canInstall) {
      const installed = await pwaManager.promptInstall();
      if (installed) {
        setIsInstalled(true);
        setCanInstall(false);
      }
    } else {
      // Show manual instructions
      setShowInstructions(true);
    }
  };

  // Don't show if already installed
  if (isInstalled) {
    return null;
  }

  const instructions = pwaManager.getInstallInstructions();

  return (
    <>
      <Button
        onClick={handleInstall}
        variant="outline"
        className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-none hover:from-purple-600 hover:to-indigo-600"
        data-testid="pwa-install-button"
      >
        <Download className="w-4 h-4 mr-2" />
        Instalar App
      </Button>

      <Dialog open={showInstructions} onOpenChange={setShowInstructions}>
        <DialogContent className="w-[90%] max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-purple-600" />
              Como Instalar o RádioPlay
            </DialogTitle>
            <DialogDescription className="text-left pt-4">
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Para instalar o app no seu {instructions.platform}, siga os passos:
                </p>
                
                <ol className="space-y-2">
                  {instructions.instructions.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </span>
                      <span className="text-sm text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>

                {instructions.platform === 'iOS' && (
                  <div className="mt-4 p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs text-amber-800 flex items-start gap-2">
                      <Share2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>
                        No iPhone, você precisa usar o Safari para instalar o app.
                      </span>
                    </p>
                  </div>
                )}
              </div>
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}