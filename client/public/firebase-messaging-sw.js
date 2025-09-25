/**
 * Firebase Messaging Service Worker
 * 
 * Este arquivo é dedicado para o Firebase Cloud Messaging (FCM)
 * Suporta notificações push em background para todos os navegadores,
 * incluindo iOS Safari 16.4+
 */

// Importar scripts do Firebase
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Cache para configurações do Firebase
const CONFIG_CACHE_NAME = 'firebase-config-v1';
const CONFIG_CACHE_DURATION = 60 * 60 * 1000; // 1 hora em milliseconds

/**
 * Buscar configurações do Firebase do servidor
 * Com cache para uso offline
 */
async function fetchFirebaseConfig() {
  const cache = await caches.open(CONFIG_CACHE_NAME);
  
  try {
    // Tentar buscar configurações do servidor
    const response = await fetch('/api/config/firebase');
    if (response.ok) {
      const config = await response.json();
      
      // Salvar no cache com timestamp
      const cacheData = {
        config,
        timestamp: Date.now()
      };
      
      // Armazenar no cache
      await cache.put('/api/config/firebase', new Response(JSON.stringify(cacheData)));
      
      console.log('[firebase-messaging-sw.js] Firebase config fetched from server');
      return config;
    }
  } catch (error) {
    console.warn('[firebase-messaging-sw.js] Failed to fetch config from server:', error);
  }
  
  // Tentar usar cache se a busca falhar
  try {
    const cachedResponse = await cache.match('/api/config/firebase');
    if (cachedResponse) {
      const cacheData = await cachedResponse.json();
      
      // Verificar se o cache ainda é válido (1 hora)
      if (Date.now() - cacheData.timestamp < CONFIG_CACHE_DURATION) {
        console.log('[firebase-messaging-sw.js] Using cached Firebase config');
        return cacheData.config;
      }
    }
  } catch (error) {
    console.warn('[firebase-messaging-sw.js] Failed to get cached config:', error);
  }
  
  // Fallback para configuração padrão se tudo falhar
  console.warn('[firebase-messaging-sw.js] Using fallback Firebase config');
  return {
    apiKey: "AIzaSyDummy-Key",
    authDomain: "radioplay-app.firebaseapp.com",
    projectId: "radioplay-app",
    storageBucket: "radioplay-app.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:dummy"
  };
}

// Variável global para armazenar o messaging
let messaging = null;
let firebaseInitialized = false;

/**
 * Inicializar Firebase com configurações dinâmicas
 */
async function initializeFirebase() {
  if (firebaseInitialized) {
    return messaging;
  }
  
  try {
    const firebaseConfig = await fetchFirebaseConfig();
    
    // Inicializar Firebase
    firebase.initializeApp(firebaseConfig);
    
    // Inicializar Firebase Messaging
    messaging = firebase.messaging();
    firebaseInitialized = true;
    
    console.log('[firebase-messaging-sw.js] Firebase initialized with dynamic config');
    return messaging;
  } catch (error) {
    console.error('[firebase-messaging-sw.js] Failed to initialize Firebase:', error);
    return null;
  }
}

/**
 * Detectar se é iOS usando dados da notificação ou contexto disponível
 * Service workers não têm acesso direto ao user agent, então precisamos
 * usar métodos alternativos
 */
const isIOSFromNotificationData = (data) => {
  // Verificar se temos informação de plataforma nos dados
  if (data?.platform) {
    return data.platform === 'ios' || data.platform === 'iOS';
  }
  
  // Verificar se temos informação de iOS version nos dados
  if (data?.iOSVersion) {
    return true;
  }
  
  // Verificar se temos um campo específico indicando iOS
  if (data?.isIOS !== undefined) {
    return data.isIOS;
  }
  
  // Como fallback, não assumir iOS para garantir funcionalidade completa
  return false;
};

/**
 * Manipular mensagens em background
 * Este método é chamado quando o app está em background e recebe uma notificação
 */
self.addEventListener('push', async (event) => {
  console.log('[firebase-messaging-sw.js] Push event received:', event);
  
  // Garantir que o Firebase está inicializado
  const messagingInstance = await initializeFirebase();
  if (!messagingInstance) {
    console.error('[firebase-messaging-sw.js] Firebase not initialized, cannot handle push');
    return;
  }
  
  // Deixar o Firebase processar a mensagem também
  // Isso é importante para manter compatibilidade com o SDK
});

// Registrar o handler de mensagens em background após a inicialização
initializeFirebase().then((messagingInstance) => {
  if (messagingInstance) {
    messagingInstance.onBackgroundMessage((payload) => {
      console.log('[firebase-messaging-sw.js] Background message received:', payload);
      
      // Extrair dados da notificação
      const notificationTitle = payload.notification?.title || payload.data?.title || 'RádioPlay';
      const notificationBody = payload.notification?.body || payload.data?.body || 'Nova notificação';
      
      // Detectar iOS usando dados da notificação
      const isIOS = isIOSFromNotificationData(payload.data);
      
      // Opções da notificação com suporte para iOS
      const notificationOptions = {
        body: notificationBody,
        icon: '/icon-192x192.png',
        badge: '/icon-96x96.png',
        tag: payload.data?.tag || `radioplay-${Date.now()}`,
        data: {
          ...payload.data,
          FCM_MSG: payload,
          timestamp: Date.now(),
          url: payload.data?.url || '/',
          isIOS: isIOS
        },
        requireInteraction: false,
        silent: false,
        // Vibração (não suportado no iOS)
        vibrate: isIOS ? undefined : [200, 100, 200],
        // Imagem da notificação (se fornecida)
        image: payload.notification?.image || payload.data?.image
      };
      
      // Adicionar ações à notificação (suporte limitado no iOS 16.4+)
      if (!isIOS || (payload.data?.iOSVersion && parseFloat(payload.data.iOSVersion) >= 16.4)) {
        notificationOptions.actions = [
          {
            action: 'open',
            title: 'Abrir',
            icon: '/icon-48x48.png'
          },
          {
            action: 'dismiss',
            title: 'Dispensar',
            icon: '/icon-48x48.png'
          }
        ];
      }
      
      // iOS Safari específico: adicionar timestamp para evitar duplicatas
      if (isIOS) {
        notificationOptions.tag = `ios-${notificationOptions.tag}-${Date.now()}`;
        // iOS prefere notificações simples
        delete notificationOptions.requireInteraction;
      }
      
      // Mostrar a notificação
      return self.registration.showNotification(notificationTitle, notificationOptions);
    });
  }
});

/**
 * Manipular cliques na notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  const notification = event.notification;
  const action = event.action;
  const notificationData = notification.data || {};
  
  // Fechar a notificação
  notification.close();
  
  // Manipular ações específicas
  if (action === 'dismiss') {
    // Apenas fechar a notificação
    return;
  }
  
  // URL para abrir (padrão ou específico)
  const urlToOpen = notificationData.url || notificationData.click_action || '/';
  
  // Abrir ou focar janela existente
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Procurar janela existente
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        // Se já existe uma janela aberta, focar nela
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus().then((focusedClient) => {
            // Enviar mensagem para o cliente sobre a notificação clicada
            if (focusedClient) {
              focusedClient.postMessage({
                type: 'notification-clicked',
                data: notificationData
              });
            }
            return focusedClient;
          });
        }
      }
      
      // Se não existe janela, abrir uma nova
      return clients.openWindow(urlToOpen).then((newClient) => {
        // Enviar mensagem para o novo cliente
        if (newClient) {
          // Aguardar um pouco para garantir que o cliente está pronto
          setTimeout(() => {
            newClient.postMessage({
              type: 'notification-clicked',
              data: notificationData
            });
          }, 1000);
        }
        return newClient;
      });
    })
  );
});

/**
 * Manipular fechamento da notificação
 */
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification dismissed:', event);
  
  const notificationData = event.notification.data || {};
  
  // Registrar analytics ou telemetria se necessário
  if (notificationData.analyticsLabel) {
    // Enviar evento de dismissal para analytics
    console.log('Notification dismissed:', notificationData.analyticsLabel);
  }
});

/**
 * Manipular instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker installing...');
  // Forçar ativação imediata
  self.skipWaiting();
  
  // Pré-buscar configurações durante a instalação
  event.waitUntil(
    fetchFirebaseConfig().then(() => {
      console.log('[firebase-messaging-sw.js] Config pre-fetched during install');
    }).catch((error) => {
      console.warn('[firebase-messaging-sw.js] Failed to pre-fetch config:', error);
    })
  );
});

/**
 * Manipular ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[firebase-messaging-sw.js] Service Worker activated');
  // Tomar controle de todas as páginas imediatamente
  event.waitUntil(
    Promise.all([
      clients.claim(),
      // Inicializar Firebase na ativação
      initializeFirebase().then(() => {
        console.log('[firebase-messaging-sw.js] Firebase initialized on activation');
      }).catch((error) => {
        console.warn('[firebase-messaging-sw.js] Failed to initialize on activation:', error);
      })
    ])
  );
});

/**
 * Mensagem de comunicação com o app
 */
self.addEventListener('message', async (event) => {
  console.log('[firebase-messaging-sw.js] Message received:', event.data);
  
  if (event.data && event.data.type === 'CHECK_SW_STATUS') {
    // Garantir que o Firebase está inicializado
    const messagingInstance = await initializeFirebase();
    
    // Responder que o SW está ativo
    event.ports[0].postMessage({
      type: 'SW_STATUS',
      status: 'active',
      messaging: !!messagingInstance,
      firebaseInitialized: firebaseInitialized
    });
  } else if (event.data && event.data.type === 'REFRESH_CONFIG') {
    // Permitir que o app force uma atualização das configurações
    try {
      // Limpar cache antigo
      await caches.delete(CONFIG_CACHE_NAME);
      
      // Re-buscar configurações
      const newConfig = await fetchFirebaseConfig();
      
      // Re-inicializar Firebase se necessário
      firebaseInitialized = false;
      await initializeFirebase();
      
      event.ports[0].postMessage({
        type: 'CONFIG_REFRESHED',
        success: true,
        config: newConfig
      });
    } catch (error) {
      event.ports[0].postMessage({
        type: 'CONFIG_REFRESHED',
        success: false,
        error: error.message
      });
    }
  }
});

console.log('[firebase-messaging-sw.js] Firebase Messaging Service Worker loaded - Dynamic config enabled');