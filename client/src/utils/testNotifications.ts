/**
 * Utilitários para testar notificações push em diferentes cenários
 * 
 * Este arquivo fornece funções para testar o sistema de notificações
 * em desenvolvimento e produção, incluindo diferentes tipos de payload
 * e cenários específicos de cada plataforma.
 */

import { messaging, VAPID_KEY, isMessagingSupported } from '@/config/firebase';
import { getToken, onMessage } from 'firebase/messaging';

/**
 * Interface para o resultado dos testes
 */
interface TestResult {
  test: string;
  success: boolean;
  message: string;
  details?: any;
}

/**
 * Tipos de payload para diferentes cenários de teste
 */
export const TEST_PAYLOADS = {
  // Notificação simples
  simple: {
    title: '🔔 Teste Simples',
    body: 'Esta é uma notificação de teste simples',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png'
  },

  // Notificação com dados customizados
  withData: {
    title: '📊 Teste com Dados',
    body: 'Notificação com dados adicionais',
    icon: '/icon-192x192.png',
    data: {
      type: 'test',
      userId: '12345',
      action: 'view_details',
      timestamp: new Date().toISOString()
    }
  },

  // Notificação com ações (desktop/android)
  withActions: {
    title: '🎯 Teste com Ações',
    body: 'Clique em uma das opções abaixo',
    icon: '/icon-192x192.png',
    actions: [
      {
        action: 'view',
        title: '👁️ Visualizar',
        icon: '/icon-48x48.png'
      },
      {
        action: 'dismiss',
        title: '❌ Fechar',
        icon: '/icon-48x48.png'
      }
    ],
    requireInteraction: true
  },

  // Notificação com imagem (rich notification)
  withImage: {
    title: '🖼️ Teste com Imagem',
    body: 'Notificação com imagem em destaque',
    icon: '/icon-192x192.png',
    image: '/icon-512x512.png',
    badge: '/icon-72x72.png'
  },

  // Notificação com vibração (mobile)
  withVibration: {
    title: '📳 Teste com Vibração',
    body: 'Esta notificação deve vibrar o dispositivo',
    icon: '/icon-192x192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'vibration-test'
  },

  // Notificação silenciosa
  silent: {
    title: '🔇 Teste Silencioso',
    body: 'Notificação sem som',
    icon: '/icon-192x192.png',
    silent: true,
    tag: 'silent-test'
  },

  // Notificação urgente
  urgent: {
    title: '🚨 Teste Urgente',
    body: 'Notificação de alta prioridade!',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    requireInteraction: true,
    tag: 'urgent',
    renotify: true,
    vibrate: [500, 200, 500]
  },

  // Teste específico para iOS
  iosTest: {
    title: '🍎 Teste iOS',
    body: 'Notificação otimizada para iOS 16.4+',
    icon: '/icon-180x180.png', // iOS prefere 180x180
    badge: '/icon-72x72.png'
  },

  // Teste específico para Android
  androidTest: {
    title: '🤖 Teste Android',
    body: 'Notificação otimizada para Android',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    color: '#FF6B6B', // Cor da notificação no Android
    vibrate: [200, 100, 200]
  }
};

/**
 * Classe principal para testes de notificação
 */
export class NotificationTester {
  private results: TestResult[] = [];

  /**
   * Executa todos os testes de notificação
   */
  async runAllTests(): Promise<TestResult[]> {
    console.log('🧪 Iniciando testes de notificação...');
    this.results = [];

    // Teste 1: Verificar suporte do navegador
    await this.testBrowserSupport();

    // Teste 2: Verificar Service Worker
    await this.testServiceWorker();

    // Teste 3: Verificar permissões
    await this.testPermissions();

    // Teste 4: Obter token FCM
    await this.testFCMToken();

    // Teste 5: Testar notificação local
    await this.testLocalNotification();

    // Teste 6: Verificar configuração do Firebase
    await this.testFirebaseConfig();

    // Teste 7: Testar diferentes payloads
    await this.testPayloads();

    console.log('✅ Testes concluídos!', this.results);
    return this.results;
  }

  /**
   * Teste 1: Verificar suporte do navegador
   */
  async testBrowserSupport(): Promise<void> {
    const test = 'Suporte do Navegador';
    
    try {
      const checks = {
        notifications: 'Notification' in window,
        serviceWorker: 'serviceWorker' in navigator,
        pushManager: 'PushManager' in window,
        firebase: isMessagingSupported()
      };

      const allSupported = Object.values(checks).every(v => v === true);
      
      this.results.push({
        test,
        success: allSupported,
        message: allSupported 
          ? 'Navegador suporta todas as funcionalidades'
          : 'Navegador não suporta algumas funcionalidades',
        details: checks
      });
    } catch (error) {
      this.results.push({
        test,
        success: false,
        message: `Erro ao verificar suporte: ${error}`,
        details: error
      });
    }
  }

  /**
   * Teste 2: Verificar Service Worker
   */
  async testServiceWorker(): Promise<void> {
    const test = 'Service Worker';
    
    try {
      if (!('serviceWorker' in navigator)) {
        this.results.push({
          test,
          success: false,
          message: 'Service Worker não suportado'
        });
        return;
      }

      const registrations = await navigator.serviceWorker.getRegistrations();
      const firebaseSW = registrations.find(reg => 
        reg.active?.scriptURL.includes('firebase-messaging-sw.js')
      );

      this.results.push({
        test,
        success: !!firebaseSW,
        message: firebaseSW 
          ? 'Firebase Service Worker registrado'
          : 'Firebase Service Worker não encontrado',
        details: {
          totalRegistrations: registrations.length,
          firebaseSW: firebaseSW?.active?.scriptURL
        }
      });
    } catch (error) {
      this.results.push({
        test,
        success: false,
        message: `Erro ao verificar Service Worker: ${error}`,
        details: error
      });
    }
  }

  /**
   * Teste 3: Verificar permissões
   */
  async testPermissions(): Promise<void> {
    const test = 'Permissões de Notificação';
    
    try {
      const permission = Notification.permission;
      
      this.results.push({
        test,
        success: permission === 'granted',
        message: `Permissão: ${permission}`,
        details: {
          permission,
          needsRequest: permission === 'default',
          isDenied: permission === 'denied'
        }
      });

      // Se a permissão for 'default', tentar solicitar
      if (permission === 'default') {
        console.log('📋 Solicitando permissão...');
        const newPermission = await Notification.requestPermission();
        
        this.results.push({
          test: 'Solicitação de Permissão',
          success: newPermission === 'granted',
          message: `Nova permissão: ${newPermission}`,
          details: { newPermission }
        });
      }
    } catch (error) {
      this.results.push({
        test,
        success: false,
        message: `Erro ao verificar permissões: ${error}`,
        details: error
      });
    }
  }

  /**
   * Teste 4: Obter token FCM
   */
  async testFCMToken(): Promise<void> {
    const test = 'Token FCM';
    
    try {
      if (!messaging) {
        this.results.push({
          test,
          success: false,
          message: 'Firebase Messaging não inicializado'
        });
        return;
      }

      if (Notification.permission !== 'granted') {
        this.results.push({
          test,
          success: false,
          message: 'Permissão não concedida para obter token'
        });
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: registration
      });

      this.results.push({
        test,
        success: !!token,
        message: token ? 'Token obtido com sucesso' : 'Falha ao obter token',
        details: {
          token: token ? `${token.substring(0, 20)}...` : null,
          length: token?.length
        }
      });

      // Salvar token para uso posterior
      if (token) {
        console.log('📱 Token FCM completo:', token);
        localStorage.setItem('fcm_token', token);
      }
    } catch (error) {
      this.results.push({
        test,
        success: false,
        message: `Erro ao obter token: ${error}`,
        details: error
      });
    }
  }

  /**
   * Teste 5: Testar notificação local
   */
  async testLocalNotification(): Promise<void> {
    const test = 'Notificação Local';
    
    try {
      if (Notification.permission !== 'granted') {
        this.results.push({
          test,
          success: false,
          message: 'Permissão não concedida'
        });
        return;
      }

      const notification = new Notification('🧪 Teste Local', {
        body: 'Esta é uma notificação de teste local',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'test-local',
        requireInteraction: false
      });

      // Fechar após 3 segundos
      setTimeout(() => notification.close(), 3000);

      this.results.push({
        test,
        success: true,
        message: 'Notificação local enviada',
        details: {
          title: notification.title,
          body: notification.body
        }
      });
    } catch (error) {
      this.results.push({
        test,
        success: false,
        message: `Erro ao enviar notificação local: ${error}`,
        details: error
      });
    }
  }

  /**
   * Teste 6: Verificar configuração do Firebase
   */
  async testFirebaseConfig(): Promise<void> {
    const test = 'Configuração Firebase';
    
    try {
      const config = {
        apiKey: !!import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: !!import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: !!import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: !!import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: !!import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: !!import.meta.env.VITE_FIREBASE_APP_ID,
        vapidKey: !!VAPID_KEY
      };

      const allConfigured = Object.values(config).every(v => v === true);

      this.results.push({
        test,
        success: allConfigured,
        message: allConfigured 
          ? 'Firebase totalmente configurado'
          : 'Configuração incompleta',
        details: config
      });
    } catch (error) {
      this.results.push({
        test,
        success: false,
        message: `Erro ao verificar configuração: ${error}`,
        details: error
      });
    }
  }

  /**
   * Teste 7: Testar diferentes payloads
   */
  async testPayloads(): Promise<void> {
    const test = 'Payloads de Teste';
    
    try {
      // Detectar plataforma
      const platform = this.detectPlatform();
      console.log(`📱 Plataforma detectada: ${platform}`);

      // Selecionar payload apropriado
      let testPayload;
      switch (platform) {
        case 'ios':
          testPayload = TEST_PAYLOADS.iosTest;
          break;
        case 'android':
          testPayload = TEST_PAYLOADS.androidTest;
          break;
        default:
          testPayload = TEST_PAYLOADS.simple;
      }

      this.results.push({
        test,
        success: true,
        message: `Payload selecionado para ${platform}`,
        details: {
          platform,
          payload: testPayload
        }
      });
    } catch (error) {
      this.results.push({
        test,
        success: false,
        message: `Erro ao testar payloads: ${error}`,
        details: error
      });
    }
  }

  /**
   * Detectar plataforma do dispositivo
   */
  private detectPlatform(): 'ios' | 'android' | 'desktop' {
    const userAgent = navigator.userAgent;
    
    if (/iPhone|iPad|iPod/i.test(userAgent)) {
      return 'ios';
    }
    
    if (/Android/i.test(userAgent)) {
      return 'android';
    }
    
    return 'desktop';
  }

  /**
   * Mostrar resultados dos testes em formato de tabela
   */
  showResults(): void {
    console.table(this.results.map(r => ({
      'Teste': r.test,
      'Status': r.success ? '✅' : '❌',
      'Mensagem': r.message
    })));
  }

  /**
   * Exportar resultados como JSON
   */
  exportResults(): string {
    return JSON.stringify(this.results, null, 2);
  }
}

/**
 * Função helper para executar teste rápido
 */
export async function quickTest(): Promise<void> {
  console.log('🚀 Iniciando teste rápido de notificações...');
  
  const tester = new NotificationTester();
  const results = await tester.runAllTests();
  
  tester.showResults();
  
  // Mostrar resumo
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`
📊 Resumo dos Testes:
✅ Passou: ${passed}
❌ Falhou: ${failed}
📈 Taxa de sucesso: ${Math.round((passed / results.length) * 100)}%
  `);

  // Se todos passaram, mostrar token para teste de backend
  if (failed === 0) {
    const token = localStorage.getItem('fcm_token');
    if (token) {
      console.log(`
🎯 Todos os testes passaram!

Use este token para testar o envio do backend:
${token}

Exemplo de comando cURL:
\`\`\`bash
curl -X POST http://localhost:5000/api/test-notification \\
  -H "Content-Type: application/json" \\
  -d '{
    "token": "${token}",
    "title": "Teste do Backend",
    "body": "Notificação enviada pelo servidor"
  }'
\`\`\`
      `);
    }
  }
}

/**
 * Monitorar notificações recebidas
 */
export function monitorNotifications(): void {
  if (!messaging) {
    console.warn('Firebase Messaging não está disponível');
    return;
  }

  console.log('👁️ Monitorando notificações...');

  // Escutar notificações em foreground
  onMessage(messaging, (payload) => {
    console.log('📨 Notificação recebida em foreground:', payload);
    
    // Log detalhado
    console.group('Detalhes da Notificação');
    console.log('Título:', payload.notification?.title);
    console.log('Corpo:', payload.notification?.body);
    console.log('Dados:', payload.data);
    console.log('FCM Options:', payload.fcmOptions);
    console.groupEnd();

    // Mostrar notificação customizada
    if (Notification.permission === 'granted' && payload.notification) {
      const notification = new Notification(
        payload.notification.title || 'Nova Notificação',
        {
          body: payload.notification.body,
          icon: payload.notification.icon || '/icon-192x192.png',
          data: payload.data,
          tag: `fcm-${Date.now()}`
        }
      );

      // Click handler
      notification.onclick = () => {
        console.log('Notificação clicada:', payload);
        window.focus();
        notification.close();
      };
    }
  });

  // Escutar mensagens do Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('📨 Mensagem do Service Worker:', event.data);
    });
  }
}

/**
 * Simular diferentes cenários de erro
 */
export async function simulateErrors(): Promise<void> {
  console.log('🐛 Simulando cenários de erro...');

  const scenarios = [
    {
      name: 'Token Inválido',
      test: async () => {
        // Tentar usar um token inválido
        console.log('Testando com token inválido...');
        // Este teste deve falhar no backend
      }
    },
    {
      name: 'Sem Internet',
      test: async () => {
        // Simular offline
        console.log('Simulando modo offline...');
        if ('onLine' in navigator) {
          console.log('Status de conexão:', navigator.onLine ? 'Online' : 'Offline');
        }
      }
    },
    {
      name: 'Service Worker Bloqueado',
      test: async () => {
        // Verificar se SW está bloqueado
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('Service Workers ativos:', registrations.length);
      }
    }
  ];

  for (const scenario of scenarios) {
    console.group(`🔍 ${scenario.name}`);
    try {
      await scenario.test();
      console.log('✅ Cenário executado');
    } catch (error) {
      console.error('❌ Erro no cenário:', error);
    }
    console.groupEnd();
  }
}

/**
 * Limpar todos os dados de teste
 */
export async function cleanupTests(): Promise<void> {
  console.log('🧹 Limpando dados de teste...');

  try {
    // Limpar localStorage
    localStorage.removeItem('fcm_token');
    
    // Fechar todas as notificações
    if ('getNotifications' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      const notifications = await registration.getNotifications();
      notifications.forEach(n => n.close());
      console.log(`✅ ${notifications.length} notificações fechadas`);
    }

    // Limpar console
    console.clear();
    console.log('✅ Limpeza concluída');
  } catch (error) {
    console.error('❌ Erro na limpeza:', error);
  }
}

// Exportar instância global para uso no console
if (typeof window !== 'undefined') {
  (window as any).notificationTester = {
    quickTest,
    monitorNotifications,
    simulateErrors,
    cleanupTests,
    NotificationTester,
    TEST_PAYLOADS
  };
  
  console.log(`
🧪 Utilitários de Teste de Notificação Carregados!

Use no console:
- notificationTester.quickTest() - Executar todos os testes
- notificationTester.monitorNotifications() - Monitorar notificações
- notificationTester.simulateErrors() - Simular erros
- notificationTester.cleanupTests() - Limpar dados de teste

Para teste detalhado:
const tester = new notificationTester.NotificationTester();
await tester.runAllTests();
tester.showResults();
  `);
}