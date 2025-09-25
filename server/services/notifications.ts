import * as admin from 'firebase-admin';
import { getMessaging, isFirebaseConfigured } from '../config/firebase-admin';
import { storage } from '../storage';
import type { PushToken } from '@shared/schema';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  badge?: number;
  sound?: string;
}

export interface NotificationOptions {
  priority?: 'high' | 'normal';
  collapseKey?: string;
  ttl?: number; // Time to live in seconds
}

export type NotificationType = 
  | 'points'        // Ganho de pontos
  | 'reward'        // Prêmio ou conquista
  | 'withdrawal'    // Status de saque
  | 'alert'         // Alerta geral
  | 'premium'       // Relacionado a assinatura premium
  | 'message'       // Mensagem enviada para rádio
  | 'referral'      // Novo referido
  | 'system';       // Notificação do sistema

interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  token?: string;
}

/**
 * Serviço de Notificações Push usando Firebase Cloud Messaging
 */
export class NotificationService {
  private messaging: admin.messaging.Messaging | null = null;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000; // 1 segundo

  constructor() {
    if (isFirebaseConfigured()) {
      this.messaging = getMessaging();
      console.log('Notification service initialized with Firebase');
    } else {
      console.warn('Notification service running without Firebase (development mode)');
    }
  }

  /**
   * Envia notificação para um único token
   */
  async sendToToken(
    token: string, 
    payload: NotificationPayload, 
    options?: NotificationOptions
  ): Promise<NotificationResult> {
    if (!this.messaging) {
      console.log('Firebase not configured - simulating notification send:', { token, payload });
      return { success: true, messageId: 'simulated-' + Date.now() };
    }

    // Formatar mensagem para iOS 16.4+
    const message: admin.messaging.Message = {
      token,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl })
      },
      data: payload.data || {},
      apns: {
        headers: {
          'apns-priority': options?.priority === 'high' ? '10' : '5',
          ...(options?.collapseKey && { 'apns-collapse-id': options.collapseKey })
        },
        payload: {
          aps: {
            alert: {
              title: payload.title,
              body: payload.body
            },
            ...(payload.badge !== undefined && { badge: payload.badge }),
            sound: payload.sound || 'default',
            'mutable-content': 1,
            'content-available': 1
          }
        }
      },
      android: {
        priority: options?.priority || 'high',
        ttl: (options?.ttl || 3600) * 1000, // Convert to milliseconds
        ...(options?.collapseKey && { collapseKey: options.collapseKey }),
        notification: {
          sound: payload.sound || 'default',
          channelId: 'default'
        }
      },
      webpush: {
        headers: {
          TTL: String(options?.ttl || 3600),
          Urgency: options?.priority || 'high'
        },
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png',
          vibrate: [200, 100, 200]
        }
      }
    };

    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.maxRetries) {
      try {
        const response = await this.messaging.send(message);
        
        // Atualizar lastUsedAt do token
        await storage.updatePushTokenLastUsed(token);
        
        console.log('Notification sent successfully:', response);
        return { 
          success: true, 
          messageId: response,
          token 
        };
      } catch (error: any) {
        lastError = error;
        attempt++;
        
        console.error(`Attempt ${attempt} failed for token ${token}:`, error.message);
        
        // Verificar se o token é inválido
        if (this.isInvalidTokenError(error)) {
          await this.handleInvalidToken(token);
          return { 
            success: false, 
            error: 'Invalid token - removed from database',
            token 
          };
        }
        
        // Se não for a última tentativa, aguardar antes de tentar novamente
        if (attempt < this.maxRetries) {
          await this.delay(this.retryDelay * attempt);
        }
      }
    }

    return { 
      success: false, 
      error: lastError?.message || 'Unknown error',
      token 
    };
  }

  /**
   * Envia notificação para múltiplos tokens
   */
  async sendToMultipleTokens(
    tokens: string[], 
    payload: NotificationPayload, 
    options?: NotificationOptions
  ): Promise<NotificationResult[]> {
    if (tokens.length === 0) {
      return [];
    }

    const promises = tokens.map(token => 
      this.sendToToken(token, payload, options)
    );

    return Promise.all(promises);
  }

  /**
   * Envia notificação para todos os tokens de um usuário
   */
  async sendToUser(
    userId: string, 
    payload: NotificationPayload, 
    options?: NotificationOptions
  ): Promise<NotificationResult[]> {
    const userTokens = await storage.getUserPushTokens(userId);
    
    if (userTokens.length === 0) {
      console.log(`No active tokens found for user ${userId}`);
      return [];
    }

    const tokens = userTokens.map(t => t.token);
    return this.sendToMultipleTokens(tokens, payload, options);
  }

  /**
   * Envia notificação para todos os usuários ativos
   */
  async sendToAllUsers(
    payload: NotificationPayload, 
    options?: NotificationOptions
  ): Promise<{ sent: number; failed: number; results: NotificationResult[] }> {
    const allTokens = await storage.getAllActivePushTokens();
    
    if (allTokens.length === 0) {
      return { sent: 0, failed: 0, results: [] };
    }

    const tokens = allTokens.map(t => t.token);
    const results = await this.sendToMultipleTokens(tokens, payload, options);
    
    const sent = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    return { sent, failed, results };
  }

  /**
   * Envia notificação baseada no tipo
   */
  async sendTypedNotification(
    userId: string,
    type: NotificationType,
    data: {
      points?: number;
      amount?: number;
      achievementName?: string;
      referralName?: string;
      customTitle?: string;
      customBody?: string;
      [key: string]: any;
    }
  ): Promise<NotificationResult[]> {
    const payload = this.buildPayloadForType(type, data);
    const options = this.getOptionsForType(type);
    
    // Salvar notificação no banco de dados
    await storage.createNotification({
      userId,
      title: payload.title,
      message: payload.body,
      type,
      data
    });
    
    return this.sendToUser(userId, payload, options);
  }

  /**
   * Constrói o payload da notificação baseado no tipo
   */
  private buildPayloadForType(
    type: NotificationType, 
    data: any
  ): NotificationPayload {
    switch (type) {
      case 'points':
        return {
          title: '🎉 Pontos Ganhos!',
          body: `Você ganhou ${data.points} pontos!`,
          data: { type, points: String(data.points) }
        };
      
      case 'reward':
        return {
          title: '🏆 Nova Conquista!',
          body: data.achievementName 
            ? `Parabéns! Você desbloqueou "${data.achievementName}"`
            : 'Você recebeu uma nova recompensa!',
          data: { type, achievement: data.achievementName || '' }
        };
      
      case 'withdrawal':
        return {
          title: '💰 Atualização de Saque',
          body: data.customBody || 'Seu saque foi processado com sucesso!',
          data: { type, amount: String(data.amount || 0) }
        };
      
      case 'alert':
        return {
          title: data.customTitle || '📢 Alerta',
          body: data.customBody || 'Você tem uma nova notificação',
          data: { type }
        };
      
      case 'premium':
        return {
          title: '⭐ Premium',
          body: data.customBody || 'Novidades sobre sua assinatura Premium',
          data: { type }
        };
      
      case 'message':
        return {
          title: '📻 Mensagem na Rádio',
          body: data.customBody || 'Sua mensagem foi ao ar!',
          data: { type }
        };
      
      case 'referral':
        return {
          title: '👥 Novo Indicado!',
          body: `${data.referralName || 'Alguém'} entrou usando seu código!`,
          data: { type, referralName: data.referralName || '' }
        };
      
      case 'system':
      default:
        return {
          title: data.customTitle || '🔔 Notificação',
          body: data.customBody || 'Você tem uma nova notificação',
          data: { type }
        };
    }
  }

  /**
   * Obtém as opções de notificação baseadas no tipo
   */
  private getOptionsForType(type: NotificationType): NotificationOptions {
    switch (type) {
      case 'withdrawal':
      case 'alert':
        return { priority: 'high', ttl: 3600 * 24 }; // 24 horas
      
      case 'points':
      case 'reward':
      case 'premium':
        return { priority: 'high', ttl: 3600 * 12 }; // 12 horas
      
      case 'message':
      case 'referral':
        return { priority: 'normal', ttl: 3600 * 6 }; // 6 horas
      
      case 'system':
      default:
        return { priority: 'normal', ttl: 3600 }; // 1 hora
    }
  }

  /**
   * Verifica se o erro é devido a token inválido
   */
  private isInvalidTokenError(error: any): boolean {
    const errorCode = error.code || error.errorCode;
    const invalidCodes = [
      'messaging/registration-token-not-registered',
      'messaging/invalid-registration-token',
      'messaging/mismatched-credential'
    ];
    
    return invalidCodes.includes(errorCode);
  }

  /**
   * Trata token inválido removendo-o do banco
   */
  private async handleInvalidToken(token: string): Promise<void> {
    console.log(`Removing invalid token: ${token}`);
    await storage.unregisterPushToken(token);
  }

  /**
   * Delay helper para retry logic
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Envia notificação de teste para um usuário
   */
  async sendTestNotification(userId: string): Promise<NotificationResult[]> {
    const payload: NotificationPayload = {
      title: '🧪 Notificação de Teste',
      body: 'Se você está vendo isso, as notificações estão funcionando!',
      data: { 
        type: 'test',
        timestamp: new Date().toISOString()
      }
    };
    
    return this.sendToUser(userId, payload, { priority: 'high' });
  }

  /**
   * Valida um token FCM
   */
  async validateToken(token: string): Promise<boolean> {
    if (!this.messaging) {
      console.log('Firebase not configured - token validation skipped');
      return true; // Em desenvolvimento, considera válido
    }

    try {
      // Tenta enviar uma mensagem dry-run para validar o token
      await this.messaging.send({
        token,
        data: { test: 'validation' }
      }, true); // dry-run = true
      
      return true;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  }
}

// Exportar instância singleton
export const notificationService = new NotificationService();