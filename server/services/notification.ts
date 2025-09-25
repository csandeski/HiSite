// Push Notification Service using Firebase Admin SDK
import * as admin from 'firebase-admin';
import { storage } from '../storage';

class NotificationService {
  private app: admin.app.App | null = null;
  private messaging: admin.messaging.Messaging | null = null;
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      // Firebase Admin configuration
      // You need to get these from Firebase Console -> Project Settings -> Service Accounts
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID || "radioplay-app",
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "",
        private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL || "",
        client_id: process.env.FIREBASE_CLIENT_ID || "",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: process.env.FIREBASE_CERT_URL || ""
      };

      // Initialize only if we have valid credentials
      if (serviceAccount.private_key && serviceAccount.client_email) {
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
        });
        
        this.messaging = admin.messaging(this.app);
        this.initialized = true;
        console.log('✅ Firebase Admin SDK initialized for push notifications');
      } else {
        console.warn('⚠️ Firebase Admin SDK not initialized - missing credentials');
      }
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
    }
  }

  // Send notification to a specific user
  async sendToUser(userId: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized || !this.messaging) {
      return { success: false, error: 'Notification service not initialized' };
    }

    try {
      // Get user's push tokens
      const tokens = await storage.getUserPushTokens(userId);
      
      if (!tokens || tokens.length === 0) {
        return { success: false, error: 'No push tokens found for user' };
      }

      // Prepare message
      const message: admin.messaging.MulticastMessage = {
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: {
          ...notification.data,
          userId,
          timestamp: Date.now().toString(),
          url: notification.data?.url || '/'
        },
        tokens: tokens.map(t => t.token),
        webpush: {
          fcmOptions: {
            link: notification.data?.url || '/'
          },
          notification: {
            icon: '/icon-192x192.png',
            badge: '/icon-96x96.png',
            vibrate: [200, 100, 200],
            requireInteraction: false,
            actions: notification.data?.actions ? JSON.parse(notification.data.actions) : undefined
          }
        },
        android: {
          priority: 'high' as const,
          notification: {
            icon: 'ic_notification',
            color: '#7c3aed'
          }
        },
        apns: {
          payload: {
            aps: {
              badge: 1,
              sound: 'default',
              contentAvailable: true
            }
          }
        }
      };

      // Send multicast message
      const response = await this.messaging.sendMulticast(message);
      
      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const token = tokens[idx].token;
            failedTokens.push(token);
            
            // If the error indicates an invalid token, deactivate it
            if (resp.error.code === 'messaging/invalid-registration-token' ||
                resp.error.code === 'messaging/registration-token-not-registered') {
              storage.unregisterPushToken(token);
            }
          }
        });
        
        if (failedTokens.length > 0) {
          console.warn('Failed to send to tokens:', failedTokens);
        }
      }

      // Update last used timestamp for successful tokens
      const successTokens = tokens.filter((_, idx) => response.responses[idx].success);
      for (const token of successTokens) {
        await storage.updatePushTokenLastUsed(token.token);
      }

      // Save notification to database
      await storage.createNotification({
        userId,
        title: notification.title,
        message: notification.body,
        type: 'push',
        data: notification.data
      });

      return { 
        success: response.successCount > 0,
        error: response.failureCount > 0 ? `Failed to send to ${response.failureCount} devices` : undefined
      };
    } catch (error) {
      console.error('Error sending push notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Send notification to multiple users
  async sendToUsers(userIds: string[], notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }): Promise<{ success: boolean; sent: number; failed: number }> {
    const results = await Promise.all(
      userIds.map(userId => this.sendToUser(userId, notification))
    );
    
    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return { success: sent > 0, sent, failed };
  }

  // Send notification to all users
  async sendToAll(notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }): Promise<{ success: boolean; sent: number; failed: number }> {
    if (!this.initialized || !this.messaging) {
      return { success: false, sent: 0, failed: 0 };
    }

    try {
      // Get all active push tokens
      const tokens = await storage.getAllActivePushTokens();
      
      if (!tokens || tokens.length === 0) {
        return { success: false, sent: 0, failed: 0 };
      }

      // Send in batches (FCM allows max 500 tokens per request)
      const batchSize = 500;
      let totalSent = 0;
      let totalFailed = 0;

      for (let i = 0; i < tokens.length; i += batchSize) {
        const batch = tokens.slice(i, i + batchSize);
        
        const message: admin.messaging.MulticastMessage = {
          notification: {
            title: notification.title,
            body: notification.body,
            imageUrl: notification.imageUrl
          },
          data: {
            ...notification.data,
            timestamp: Date.now().toString(),
            url: notification.data?.url || '/'
          },
          tokens: batch.map(t => t.token),
          webpush: {
            fcmOptions: {
              link: notification.data?.url || '/'
            },
            notification: {
              icon: '/icon-192x192.png',
              badge: '/icon-96x96.png',
              vibrate: [200, 100, 200]
            }
          }
        };

        const response = await this.messaging.sendMulticast(message);
        totalSent += response.successCount;
        totalFailed += response.failureCount;

        // Handle failed tokens
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success && resp.error) {
              const token = batch[idx].token;
              
              if (resp.error.code === 'messaging/invalid-registration-token' ||
                  resp.error.code === 'messaging/registration-token-not-registered') {
                storage.unregisterPushToken(token);
              }
            }
          });
        }
      }

      return { success: totalSent > 0, sent: totalSent, failed: totalFailed };
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      return { success: false, sent: 0, failed: 0 };
    }
  }

  // Send notification by topic (for future use)
  async sendToTopic(topic: string, notification: {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
  }): Promise<{ success: boolean; error?: string }> {
    if (!this.initialized || !this.messaging) {
      return { success: false, error: 'Notification service not initialized' };
    }

    try {
      const message: admin.messaging.Message = {
        topic,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl
        },
        data: notification.data,
        webpush: {
          notification: {
            icon: '/icon-192x192.png',
            badge: '/icon-96x96.png'
          }
        }
      };

      const messageId = await this.messaging.send(message);
      return { success: true };
    } catch (error) {
      console.error('Error sending topic notification:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }
}

// Create singleton instance
export const notificationService = new NotificationService();