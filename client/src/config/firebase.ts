// Firebase configuration for push notifications
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

/**
 * Firebase Configuration
 * 
 * Para obter essas credenciais:
 * 1. Acesse o Console do Firebase: https://console.firebase.google.com/
 * 2. Selecione ou crie um novo projeto
 * 3. Vá em Configurações do Projeto (ícone de engrenagem)
 * 4. Na aba "Geral", role até "Seus aplicativos" e selecione Web
 * 5. Copie as credenciais do seu aplicativo
 * 
 * IMPORTANTE: Nunca exponha essas credenciais publicamente em produção
 */
const firebaseConfig = {
  // Obtido em: Console Firebase > Configurações do Projeto > Geral
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDummy-Key",
  
  // Formato: [projeto].firebaseapp.com
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "radioplay-app.firebaseapp.com",
  
  // ID único do seu projeto no Firebase
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "radioplay-app",
  
  // Formato: [projeto].appspot.com
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "radioplay-app.appspot.com",
  
  // ID numérico do remetente de mensagens
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  
  // ID único do aplicativo web
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:dummy",
  
  // (Opcional) ID para Google Analytics
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DUMMY"
};

/**
 * VAPID Key (Voluntary Application Server Identification)
 * 
 * Para obter a VAPID Key:
 * 1. No Console Firebase, vá em Cloud Messaging
 * 2. Na seção "Web configuration", encontre "Web Push certificates"
 * 3. Gere ou copie a "Key pair" existente
 * 
 * NOTA: Esta chave é pública e pode ser exposta no código cliente
 */
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || "BKagOny0KF_dummy_vapid_key";

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging with proper browser support check
let messaging: any = null;

/**
 * Verifica se o navegador suporta notificações push
 * 
 * Requisitos mínimos:
 * - Service Workers
 * - Push API
 * - Notifications API
 * - HTTPS (ou localhost)
 * 
 * iOS 16.4+ Support:
 * - Safari no iOS 16.4+ suporta notificações web
 * - Requer que o app seja instalado como PWA
 * - Usuário deve permitir notificações explicitamente
 */
const isMessagingSupported = () => {
  // Verificação básica de suporte
  const basicSupport = (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
  
  if (!basicSupport) return false;
  
  // Verificação de contexto seguro (HTTPS ou localhost)
  const isSecureContext = (
    window.location.protocol === 'https:' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.endsWith('.localhost')
  );
  
  if (!isSecureContext) {
    console.warn('Push notifications require HTTPS or localhost');
    return false;
  }
  
  // Detecção específica para iOS
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || 
                (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  
  if (isIOS) {
    // iOS requer que o app seja instalado como PWA para notificações
    const isStandalone = (window.navigator as any).standalone === true ||
                         window.matchMedia('(display-mode: standalone)').matches;
    
    if (!isStandalone) {
      console.info('iOS requires the app to be installed as PWA for notifications');
    }
    
    // Verificar versão do iOS (16.4+ suporta notificações web)
    const iOSVersion = navigator.userAgent.match(/OS (\d+)_(\d+)/)?.[1];
    if (iOSVersion && parseInt(iOSVersion) < 16) {
      console.warn('iOS version must be 16.4 or higher for web push notifications');
      return false;
    }
  }
  
  return true;
};

// Only initialize messaging if fully supported
if (isMessagingSupported()) {
  try {
    messaging = getMessaging(app);
    console.log('Firebase Messaging initialized successfully');
  } catch (error) {
    console.warn('Firebase Messaging could not be initialized:', error);
    messaging = null;
  }
} else {
  console.warn('Push notifications are not supported in this browser/environment');
}

export { app, messaging, getToken, onMessage, VAPID_KEY, isMessagingSupported };