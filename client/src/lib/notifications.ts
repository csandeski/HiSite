// Push Notification Manager
import { messaging, getToken, onMessage, VAPID_KEY } from '@/config/firebase';
import { apiRequest } from '@/lib/queryClient';

export interface NotificationSettings {
  enabled: boolean;
  token: string | null;
  permission: NotificationPermission;
}

class NotificationManager {
  private supported: boolean = false;
  private currentToken: string | null = null;
  private unsubscribeOnMessage: (() => void) | null = null;

  constructor() {
    // Check if notifications are supported
    this.supported = 'Notification' in window && 
                     'serviceWorker' in navigator && 
                     'PushManager' in window;
    
    if (this.supported && messaging) {
      this.setupMessageHandlers();
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
          vibrate: [200, 100, 200],
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
    if (!this.supported) {
      console.warn('Push notifications are not supported on this device');
      return false;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }
  
  public async register(): Promise<boolean> {
    if (!this.supported || Notification.permission !== 'granted') {
      console.error('Notifications not supported or permission not granted');
      return false;
    }
    
    try {
      // Get FCM token
      const token = await this.getToken();
      
      if (token) {
        // Save token to backend
        await this.saveTokenToBackend(token);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error registering for push notifications:', error);
      return false;
    }
  }

  public async getToken(): Promise<string | null> {
    if (!this.supported || !messaging) {
      return null;
    }

    try {
      // Wait for service worker to be ready
      const registration = await navigator.serviceWorker.ready;
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      if (token) {
        console.log('FCM Token obtained:', token);
        this.currentToken = token;
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } catch (error) {
      console.error('Error getting FCM token:', error);
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

  public getPermissionStatus(): NotificationPermission {
    if (!this.supported) {
      return 'denied';
    }
    return Notification.permission;
  }

  public async isSupported(): Promise<boolean> {
    return this.supported;
  }
  
  public isNotificationsSupported(): boolean {
    return this.supported;
  }

  public getCurrentToken(): string | null {
    return this.currentToken;
  }

  private detectPlatform(): string {
    const userAgent = navigator.userAgent.toLowerCase();
    const platform = navigator.platform.toLowerCase();
    
    // iOS Detection
    if (/iphone|ipad|ipod/.test(userAgent) || 
        (platform === 'macintel' && navigator.maxTouchPoints > 1)) {
      return 'ios';
    }
    
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
    if (!this.supported || Notification.permission !== 'granted') {
      console.error('Cannot show notification: not supported or permission not granted');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        vibrate: [200, 100, 200],
        tag: data?.tag || 'radioplay-notification',
        requireInteraction: false,
        data: {
          url: data?.url || '/',
          ...data
        }
      });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  public async checkAndRefreshToken(): Promise<void> {
    if (!this.supported || Notification.permission !== 'granted') {
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

// Auto-refresh token on visibility change
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      notificationManager.checkAndRefreshToken();
    }
  });
}