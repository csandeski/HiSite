import { useState, useEffect } from 'react';
import { X, Smartphone, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { pwaManager } from '@/lib/pwa';

export function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (pwaManager.isInstalled()) {
      setIsInstalled(true);
      return;
    }

    // Check if can show prompt after a delay (user engagement)
    const timer = setTimeout(() => {
      const promptSeenTime = localStorage.getItem('pwa-prompt-seen');
      const canInstall = pwaManager.canPromptInstall();
      
      // In development, always show prompt if available
      const isDev = window.location.hostname === 'localhost';
      if (isDev && canInstall) {
        setShowPrompt(true);
        return;
      }
      
      // Check if prompt was dismissed more than 7 days ago
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const shouldShowPrompt = !promptSeenTime || parseInt(promptSeenTime) < sevenDaysAgo;
      
      // Show prompt if can install and user hasn't dismissed it recently
      if (canInstall && shouldShowPrompt) {
        setShowPrompt(true);
      }
    }, 3000); // Show after 3 seconds of engagement

    // Listen for install available event
    const handleInstallAvailable = () => {
      const promptSeenTime = localStorage.getItem('pwa-prompt-seen');
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const shouldShowPrompt = !promptSeenTime || parseInt(promptSeenTime) < sevenDaysAgo;
      
      if (shouldShowPrompt) {
        setShowPrompt(true);
      }
    };
    
    window.addEventListener('pwa-install-available', handleInstallAvailable);
    
    return () => {
      clearTimeout(timer);
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
    };
  }, []);

  const handleInstall = async () => {
    const installed = await pwaManager.promptInstall();
    if (installed) {
      setIsInstalled(true);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-prompt-seen', Date.now().toString());
  };

  if (!showPrompt || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom-5">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              <span className="font-semibold text-sm">Instalar RádioPlay</span>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white/80 hover:text-white transition-colors"
              data-testid="dismiss-pwa-prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <p className="text-sm text-gray-600 mb-4">
            Instale o app no seu dispositivo para acesso rápido e melhor experiência!
          </p>
          
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              data-testid="install-pwa-now"
            >
              <Download className="w-4 h-4 mr-2" />
              Instalar Agora
            </Button>
            <Button
              onClick={handleDismiss}
              variant="outline"
              className="flex-1"
              data-testid="maybe-later"
            >
              Depois
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}