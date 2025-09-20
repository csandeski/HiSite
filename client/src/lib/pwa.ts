// PWA installation and service worker registration

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

class PWAManager {
  private deferredPrompt: BeforeInstallPromptEvent | null = null;
  private isStandalone = false;

  constructor() {
    this.isStandalone = this.checkIfStandalone();
    this.init();
  }

  private checkIfStandalone(): boolean {
    // Check if app is running in standalone mode
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://')
    );
  }

  private init() {
    // Service worker registration moved to main.tsx to avoid duplicate registration

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      
      // Show install button or banner if needed
      this.notifyInstallAvailable();
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('PWA installed');
      this.deferredPrompt = null;
      
      // Track installation (optional - if using Google Analytics)
      // You can add your analytics tracking here
      console.log('PWA was installed successfully');
    });
  }

  private async registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60 * 60 * 1000); // Check every hour
      
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private notifyInstallAvailable() {
    // Dispatch custom event that components can listen to
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('Install prompt not available');
      return false;
    }

    try {
      // Show the install prompt
      await this.deferredPrompt.prompt();
      
      // Wait for the user's response
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`User response to install prompt: ${outcome}`);
      
      // Clear the deferredPrompt
      this.deferredPrompt = null;
      
      return outcome === 'accepted';
    } catch (error) {
      console.error('Error showing install prompt:', error);
      return false;
    }
  }

  public canPromptInstall(): boolean {
    return this.deferredPrompt !== null;
  }

  public isInstalled(): boolean {
    return this.isStandalone;
  }

  public getInstallInstructions(): { platform: string; instructions: string[] } {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return {
        platform: 'iOS',
        instructions: [
          'Toque no botão de compartilhar (🔗) na barra do Safari',
          'Role para baixo e toque em "Adicionar à Tela de Início"',
          'Toque em "Adicionar" no canto superior direito'
        ]
      };
    } else if (/android/.test(userAgent)) {
      return {
        platform: 'Android',
        instructions: [
          'Toque no menu (⋮) do navegador',
          'Selecione "Adicionar à tela inicial" ou "Instalar aplicativo"',
          'Confirme a instalação'
        ]
      };
    } else {
      return {
        platform: 'Desktop',
        instructions: [
          'Clique no ícone de instalação na barra de endereços',
          'Ou acesse o menu do navegador e selecione "Instalar RádioPlay"',
          'Confirme a instalação'
        ]
      };
    }
  }
}

// Create singleton instance
export const pwaManager = new PWAManager();