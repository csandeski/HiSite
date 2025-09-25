// Push Notification Manager with iOS 16.4+ Support
import { messaging, getToken, onMessage, VAPID_KEY, isMessagingSupported } from '@/config/firebase';
import { apiRequest } from '@/lib/queryClient';

export interface NotificationSettings {
  enabled: boolean;
  token: string | null;
  permission: NotificationPermission;
}

class NotificationManager {
  private isSupported: boolean = false;
  private currentToken: string | null = null;
  private unsubscribeOnMessage: (() => void) | null = null;
  private isIOS: boolean = false;
  private iOSVersion: number = 0;
  private isStandalone: boolean = false;

  constructor() {
    // Detectar iOS e versão
    this.detectiOSEnvironment();
    
    // Usar a função importada do Firebase config para verificar suporte
    this.isSupported = isMessagingSupported();
    
    // Configurar handlers apenas se suportado e messaging disponível
    if (this.isSupported && messaging) {
      this.setupMessageHandlers();
      this.setupiOSWorkarounds();
    }
  }

  // Métodos públicos para obter informações do dispositivo
  public getDeviceInfo() {
    return {
      isIOS: this.isIOS,
      iOSVersion: this.iOSVersion,
      isStandalone: this.isStandalone
    };
  }

  public isSupportedDevice(): boolean {
    return this.isSupported;
  }

  private detectiOSEnvironment() {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Detectar iOS (iPhone, iPad, iPod ou iPad no desktop mode)
    this.isIOS = /iphone|ipad|ipod/.test(userAgent) || 
                 (platform === 'macintel' && navigator.maxTouchPoints > 1);
    
    if (this.isIOS) {
      // Extrair versão do iOS
      const versionMatch = userAgent.match(/os (\d+)_(\d+)/);
      if (versionMatch) {
        this.iOSVersion = parseInt(versionMatch[1]) + (parseInt(versionMatch[2]) / 10);
      }
      
      // Verificar se está em modo standalone (PWA instalado)
      this.isStandalone = (window.navigator as any).standalone === true ||
                          window.matchMedia('(display-mode: standalone)').matches ||
                          window.matchMedia('(display-mode: fullscreen)').matches;
    }
  }

  private setupiOSWorkarounds() {
    if (!this.isIOS) return;
    
    // iOS 16.4+ requer algumas configurações especiais
    if (this.iOSVersion >= 16.4) {
      // Forçar registro do service worker antes de solicitar permissão
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js', { scope: '/' })
          .then(() => console.log('Service Worker registered for iOS'))
          .catch(error => console.error('SW registration failed:', error));
      }
      
      // Adicionar listener para quando o app é instalado
      window.addEventListener('appinstalled', () => {
        console.log('PWA was installed on iOS');
        // Tentar registrar notificações após instalação
        setTimeout(() => this.requestPermission(), 2000);
      });
    }
  }

  private setupMessageHandlers() {
    if (!messaging) return;

    // Handle foreground messages
    this.unsubscribeOnMessage = onMessage(messaging, (payload) => {
      console.log('Received foreground message:', payload);
      
      // Show notification even when app is in foreground
      if (payload.notification) {
        const notificationTitle = payload.notification.title || 'RádioPlay';
        const notificationOptions = {
          body: payload.notification.body || 'Nova notificação',
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          vibrate: this.isIOS ? undefined : [200, 100, 200],
          tag: (payload.data?.tag as string) || 'radioplay-notification',
          data: payload.data || {},
          requireInteraction: false
        };

        // Check if we can show notifications
        if (Notification.permission === 'granted') {
          navigator.serviceWorker.ready.then(registration => {
            registration.showNotification(notificationTitle, notificationOptions);
          });
        }
      }

      // Dispatch custom event for app to handle
      window.dispatchEvent(new CustomEvent('push-notification', { detail: payload }));
    });
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications are not supported on this device');
      
      // Mensagem específica para iOS < 16.4
      if (this.isIOS && this.iOSVersion < 16.4) {
        console.warn('iOS 16.4 or higher is required for web push notifications');
      }
      
      // Mensagem para iOS não instalado como PWA
      if (this.isIOS && !this.isStandalone) {
        console.warn('Please install this app to your home screen to receive notifications');
      }
      
      return false;
    }

    try {
      // iOS requer interação do usuário para solicitar permissão
      if (this.isIOS && Notification.permission === 'default') {
        // Garantir que a solicitação é feita em resposta a uma ação do usuário
        console.log('iOS detected - requesting notification permission');
      }
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        
        // Para iOS, aguardar um pouco antes de tentar obter o token
        if (this.isIOS) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        return true;
      } else if (permission === 'denied') {
        console.warn('Notification permission was denied');
      } else {
        console.log('Notification permission dismissed');
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      
      // Tratamento de erro específico para iOS
      if (this.isIOS && error instanceof Error) {
        if (error.message.includes('registration')) {
          console.error('Service Worker registration issue on iOS:', error);
        }
      }
      
      return false;
    }
  }
  
  public async register(): Promise<boolean> {
    if (!this.isSupported) {
      console.error('Notifications not supported on this device/browser');
      return false;
    }
    
    if (Notification.permission !== 'granted') {
      console.error('Notification permission not granted');
      return false;
    }
    
    // Verificar se é iOS e se está instalado como PWA
    if (this.isIOS && !this.isStandalone) {
      console.warn('iOS requires app to be installed as PWA for notifications');
      return false;
    }
    
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      try {
        // Get FCM token com retry para iOS
        const token = await this.getToken();
        
        if (token) {
          // Save token to backend
          await this.saveTokenToBackend(token);
          console.log('Successfully registered for push notifications');
          return true;
        }
        
        // Se não conseguiu token, tentar novamente (iOS às vezes precisa)
        if (this.isIOS && retryCount < maxRetries - 1) {
          console.log(`Retrying token generation (attempt ${retryCount + 2}/${maxRetries})...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          retryCount++;
        } else {
          break;
        }
      } catch (error) {
        console.error(`Error registering for push notifications (attempt ${retryCount + 1}):`, error);
        
        if (retryCount < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          retryCount++;
        } else {
          return false;
        }
      }
    }
    
    return false;
  }

  public async getToken(): Promise<string | null> {
    if (!this.isSupported || !messaging) {
      console.warn('Cannot get token: messaging not supported');
      return null;
    }

    try {
      // Garantir que o service worker está registrado
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        console.log('Registering service worker...');
        registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
      }
      
      // Aguardar o service worker estar pronto
      registration = await navigator.serviceWorker.ready;
      console.log('Service worker is ready');
      
      // Configurações especiais para iOS
      const tokenOptions: any = {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      };
      
      // Get FCM token com timeout para evitar travamento
      const tokenPromise = getToken(messaging, tokenOptions);
      const timeoutPromise = new Promise<null>((_, reject) => {
        setTimeout(() => reject(new Error('Token generation timeout')), 10000);
      });
      
      const token = await Promise.race([tokenPromise, timeoutPromise]) as string | null;

      if (token) {
        console.log('FCM Token obtained successfully');
        this.currentToken = token;
        return token;
      } else {
        console.warn('No FCM token available - may need to retry');
        return null;
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('timeout')) {
          console.error('Token generation timed out - Firebase may be blocked');
        } else if (error.message.includes('messaging/permission-blocked')) {
          console.error('Notifications are blocked by the browser');
        } else if (error.message.includes('messaging/registration-token-not-registered')) {
          console.error('Token registration failed - clearing and retrying');
          // Limpar token inválido
          this.currentToken = null;
        } else {
          console.error('Error getting FCM token:', error.message);
        }
      } else {
        console.error('Unknown error getting FCM token:', error);
      }
      return null;
    }
  }

  private async saveTokenToBackend(token: string): Promise<void> {
    try {
      await apiRequest('POST', '/api/notifications/register', {
        token,
        platform: this.detectPlatform(),
        userAgent: navigator.userAgent
      });
      console.log('Token saved to backend');
    } catch (error) {
      console.error('Error saving token to backend:', error);
      throw error;
    }
  }

  public async unregister(): Promise<void> {
    if (this.currentToken) {
      try {
        await apiRequest('POST', '/api/notifications/unregister', {
          token: this.currentToken
        });
        this.currentToken = null;
        console.log('Token removed from backend');
      } catch (error) {
        console.error('Error removing token from backend:', error);
      }
    }

    // Clean up message handler
    if (this.unsubscribeOnMessage) {
      this.unsubscribeOnMessage();
      this.unsubscribeOnMessage = null;
    }
  }

  public async unsubscribe(): Promise<boolean> {
    try {
      await this.unregister();
      return true;
    } catch (error) {
      console.error('Error unsubscribing:', error);
      return false;
    }
  }

  public async getStatus(): Promise<NotificationSettings> {
    return {
      enabled: this.isSupported && Notification.permission === 'granted' && !!this.currentToken,
      token: this.currentToken,
      permission: this.getPermissionStatus()
    };
  }

  public async sendTestNotification(): Promise<void> {
    // Envia uma notificação de teste local
    await this.showLocal(
      'RádioPlay - Teste de Notificação',
      'Esta é uma notificação de teste. As notificações estão funcionando corretamente!',
      { tag: 'test-notification', timestamp: Date.now() }
    );
  }

  public getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) {
      return 'denied';
    }
    return Notification.permission;
  }

  public isNotificationsSupported(): boolean {
    return this.isSupported;
  }

  public getCurrentToken(): string | null {
    return this.currentToken;
  }

  private detectPlatform(): string {
    if (this.isIOS) {
      // Adicionar versão do iOS para melhor rastreamento
      return `ios_${this.iOSVersion}_${this.isStandalone ? 'pwa' : 'browser'}`;
    }
    
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // Android Detection
    if (/android/.test(userAgent)) {
      return 'android';
    }
    
    // Desktop
    if (/windows|mac|linux/.test(platform)) {
      return 'desktop';
    }
    
    return 'unknown';
  }
  
  public async showLocal(title: string, body: string, data?: any): Promise<void> {
    if (!this.isSupported || Notification.permission !== 'granted') {
      console.error('Cannot show notification: not supported or permission not granted');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Opções de notificação com suporte para iOS
      const options: NotificationOptions = {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: data?.tag || 'radioplay-notification',
        requireInteraction: false,
        // iOS não suporta vibração, mas incluir não causa problemas
        vibrate: this.isIOS ? undefined : [200, 100, 200],
        // iOS 16.4+ suporta actions limitadas
        actions: this.isIOS && this.iOSVersion >= 16.4 ? 
          [{action: 'open', title: 'Abrir'}] : 
          [
            {action: 'open', title: 'Abrir'},
            {action: 'dismiss', title: 'Dispensar'}
          ],
        data: {
          url: data?.url || '/',
          timestamp: Date.now(),
          ...data
        }
      };
      
      await registration.showNotification(title, options);
      console.log('Local notification shown successfully');
    } catch (error) {
      console.error('Error showing notification:', error);
      
      // Fallback para notificação básica se a avançada falhar
      if ('Notification' in window && Notification.permission === 'granted') {
        try {
          new Notification(title, { body, icon: '/icon-192x192.png' });
        } catch (fallbackError) {
          console.error('Fallback notification also failed:', fallbackError);
        }
      }
    }
  }

  public async checkAndRefreshToken(): Promise<void> {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return;
    }

    try {
      const token = await this.getToken();
      if (token && token !== this.currentToken) {
        // Token has changed, update backend
        await this.saveTokenToBackend(token);
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
    }
  }
}

// Create singleton instance
export const notificationManager = new NotificationManager();

// Export as default for backward compatibility
export default notificationManager;

// Auto-refresh token on visibility change
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      notificationManager.checkAndRefreshToken();
    }
  });
}