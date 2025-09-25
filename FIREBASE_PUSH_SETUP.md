# 📱 Guia Completo de Configuração do Firebase Push Notifications

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Criando um Projeto no Firebase](#criando-um-projeto-no-firebase)
4. [Configuração do Web App (Frontend)](#configuração-do-web-app-frontend)
5. [Configuração do Service Account (Backend)](#configuração-do-service-account-backend)
6. [Configuração do Firebase Cloud Messaging](#configuração-do-firebase-cloud-messaging)
7. [Requisitos Específicos por Plataforma](#requisitos-específicos-por-plataforma)
8. [Exemplos de Código](#exemplos-de-código)
9. [Testando as Notificações](#testando-as-notificações)
10. [Troubleshooting](#troubleshooting)
11. [Referências Úteis](#referências-úteis)

---

## 📌 Visão Geral

Este guia fornece instruções detalhadas para configurar notificações push em seu aplicativo PWA usando Firebase Cloud Messaging (FCM). O FCM permite enviar notificações para usuários em diversas plataformas: iOS, Android e Desktop.

### Arquitetura do Sistema

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  Cliente (PWA)  │────▶│  Servidor Node   │────▶│  Firebase FCM   │
│                 │     │                  │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
     │                                                     │
     │                                                     │
     └─────────────────────────────────────────────────────┘
               Recebe notificações push
```

---

## 🔧 Pré-requisitos

### Requisitos do Sistema

- **Node.js** 18+ instalado
- **HTTPS** em produção (obrigatório para service workers)
- **Navegador moderno** com suporte a:
  - Service Workers
  - Push API
  - Notifications API

### Requisitos por Plataforma

| Plataforma | Versão Mínima | Requisitos Especiais |
|------------|---------------|----------------------|
| **Chrome** | 42+ | Nenhum |
| **Firefox** | 44+ | Nenhum |
| **Edge** | 17+ | Nenhum |
| **Safari macOS** | 16+ | macOS Ventura 13+ |
| **Safari iOS** | 16.4+ | App instalado como PWA |
| **Android Chrome** | 42+ | Nenhum |

---

## 🚀 Criando um Projeto no Firebase

### Passo 1: Acessar o Console do Firebase

1. Acesse [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Faça login com sua conta Google

### Passo 2: Criar Novo Projeto

1. Clique em **"Adicionar projeto"**
2. Digite um nome para o projeto (ex: `radioplay-app`)
3. (Opcional) Ative o Google Analytics
4. Clique em **"Criar projeto"**

### Passo 3: Aguardar Criação

O Firebase levará alguns segundos para criar seu projeto. Quando estiver pronto, clique em **"Continuar"**.

---

## 💻 Configuração do Web App (Frontend)

### Passo 1: Registrar Aplicativo Web

1. No console do Firebase, clique no ícone de **engrenagem** ⚙️ ao lado de "Visão geral do projeto"
2. Selecione **"Configurações do projeto"**
3. Role até a seção **"Seus aplicativos"**
4. Clique no ícone **Web** `</>`
5. Digite um apelido para o app (ex: `RádioPlay PWA`)
6. Marque **"Também configurar Firebase Hosting"** (opcional)
7. Clique em **"Registrar app"**

### Passo 2: Copiar Credenciais do Web App

Após registrar, você verá um código similar a:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDn5HGLKvDrP_6Y8jOBq3z9Qx2bC3kE4fG",
  authDomain: "radioplay-app.firebaseapp.com",
  projectId: "radioplay-app",
  storageBucket: "radioplay-app.appspot.com",
  messagingSenderId: "987654321098",
  appId: "1:987654321098:web:a1b2c3d4e5f6g7h8",
  measurementId: "G-ABC123DEF4"
};
```

**Guarde essas credenciais!** Você as usará no arquivo `.env` do frontend.

### Passo 3: Obter VAPID Key (Web Push Certificate)

1. No menu lateral, clique em **"Cloud Messaging"**
2. Na aba **"Web configuration"**
3. Em **"Web Push certificates"**, clique em **"Generate key pair"**
4. Copie a chave gerada (começa com "B")

**Exemplo de VAPID Key:**
```
BKagOny0KF_2sYPPiK6RuLp3VTHzsYH0B2sTtUSvwPVQc1QE2IvJfXxA
```

---

## 🔐 Configuração do Service Account (Backend)

### Passo 1: Gerar Service Account

1. Nas **"Configurações do projeto"**
2. Clique na aba **"Service accounts"**
3. Clique em **"Gerar nova chave privada"**
4. Confirme clicando em **"Gerar chave"**
5. Um arquivo JSON será baixado automaticamente

### Passo 2: Estrutura do Service Account JSON

O arquivo baixado terá esta estrutura:

```json
{
  "type": "service_account",
  "project_id": "radioplay-app",
  "private_key_id": "abc123def456",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBg...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@radioplay-app.iam.gserviceaccount.com",
  "client_id": "123456789",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/..."
}
```

### Passo 3: Configurar Variáveis de Ambiente do Backend

Você pode usar o arquivo JSON de duas formas:

**Opção 1: Arquivo completo (Recomendado para produção)**
```bash
GOOGLE_APPLICATION_CREDENTIALS=./path/to/serviceAccount.json
```

**Opção 2: Variáveis separadas**
```bash
FIREBASE_PROJECT_ID=radioplay-app
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@radioplay-app.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

---

## 📨 Configuração do Firebase Cloud Messaging

### Passo 1: Ativar Cloud Messaging

1. No console do Firebase, acesse **"Cloud Messaging"**
2. O serviço geralmente já vem ativado por padrão
3. Se não estiver, clique em **"Ativar"**

### Passo 2: Configurar Domínios Autorizados

1. Vá em **"Authentication"** > **"Settings"**
2. Na aba **"Authorized domains"**
3. Adicione seus domínios:
   - `localhost` (desenvolvimento)
   - `seu-dominio.com` (produção)
   - `*.seu-dominio.com` (subdomínios)

### Passo 3: Configurar Service Worker

Crie o arquivo `public/firebase-messaging-sw.js`:

```javascript
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "sua-api-key",
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
});

const messaging = firebase.messaging();

// Manipular notificações em background
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message:', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

---

## 📱 Requisitos Específicos por Plataforma

### iOS 16.4+ (Safari)

#### Requisitos Obrigatórios

1. ✅ **iOS 16.4 ou superior**
2. ✅ **App instalado como PWA** (Add to Home Screen)
3. ✅ **HTTPS em produção**
4. ✅ **Certificado SSL válido**
5. ✅ **Permissão explícita do usuário**

#### Como Instalar PWA no iOS

1. Abra o Safari
2. Navegue até seu site
3. Toque no botão de **compartilhar** (quadrado com seta)
4. Role e selecione **"Adicionar à Tela de Início"**
5. Digite um nome e toque em **"Adicionar"**

#### Limitações no iOS

- ⚠️ Notificações **NÃO funcionam** no Safari browser
- ⚠️ **APENAS** funcionam com app instalado
- ⚠️ Actions limitadas nas notificações
- ⚠️ Sem suporte a notificações silenciosas
- ⚠️ Ícones personalizados podem não aparecer

### Android (Chrome)

#### Requisitos

1. ✅ Chrome 42+
2. ✅ HTTPS ou localhost
3. ✅ Permissão de notificação

#### Instalação PWA no Android

1. Abra o Chrome
2. Navegue até o site
3. Chrome mostrará um banner de instalação
4. Ou toque nos **3 pontos** > **"Adicionar à tela inicial"**

### Desktop (Chrome, Edge, Firefox)

#### Requisitos

1. ✅ Navegador moderno
2. ✅ HTTPS ou localhost
3. ✅ Permissão de notificação

#### Instalação PWA no Desktop

**Chrome/Edge:**
1. Clique no ícone de **instalação** na barra de endereços
2. Ou menu **3 pontos** > **"Instalar [Nome do App]"**

**Firefox:**
- PWA não é nativamente suportado
- Notificações funcionam no browser

---

## 💻 Exemplos de Código

### Frontend: Solicitar Permissão

```typescript
// client/src/utils/notifications.ts
import { messaging, VAPID_KEY } from '@/config/firebase';
import { getToken } from 'firebase/messaging';

export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Verificar suporte
    if (!('Notification' in window)) {
      console.log('Este browser não suporta notificações');
      return null;
    }

    // Verificar permissão atual
    if (Notification.permission === 'denied') {
      console.log('Notificações foram bloqueadas pelo usuário');
      return null;
    }

    // Solicitar permissão
    const permission = await Notification.requestPermission();
    
    if (permission !== 'granted') {
      console.log('Permissão negada');
      return null;
    }

    // Obter token FCM
    if (messaging) {
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });
      
      console.log('FCM Token:', token);
      return token;
    }
    
    return null;
  } catch (error) {
    console.error('Erro ao solicitar permissão:', error);
    return null;
  }
}
```

### Backend: Enviar Notificação

```typescript
// server/services/notifications.ts
import { getMessaging } from '../config/firebase-admin';

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: Record<string, string>
) {
  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
      data: data || {},
      webpush: {
        fcmOptions: {
          link: 'https://seu-app.com'
        },
        notification: {
          icon: '/icon-192x192.png',
          badge: '/icon-72x72.png',
          vibrate: [200, 100, 200],
          requireInteraction: false,
          actions: [
            {
              action: 'view',
              title: 'Ver'
            },
            {
              action: 'dismiss',
              title: 'Fechar'
            }
          ]
        }
      }
    };

    const response = await getMessaging().send(message);
    console.log('Notificação enviada:', response);
    return response;
  } catch (error) {
    console.error('Erro ao enviar notificação:', error);
    throw error;
  }
}
```

### Frontend: Receber Notificações em Foreground

```typescript
// client/src/hooks/useNotifications.tsx
import { useEffect } from 'react';
import { onMessage } from 'firebase/messaging';
import { messaging } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { toast } = useToast();

  useEffect(() => {
    if (!messaging) return;

    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Notificação recebida:', payload);
      
      // Mostrar notificação personalizada
      toast({
        title: payload.notification?.title || 'Nova Notificação',
        description: payload.notification?.body,
        duration: 5000,
      });
    });

    return unsubscribe;
  }, [toast]);
}
```

---

## 🧪 Testando as Notificações

### Teste 1: Verificar Service Worker

```javascript
// No console do navegador
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers registrados:', registrations);
});
```

### Teste 2: Enviar Notificação via Firebase Console

1. Acesse o [Firebase Console](https://console.firebase.google.com)
2. Vá em **"Cloud Messaging"**
3. Clique em **"Create your first campaign"**
4. Selecione **"Firebase Notification messages"**
5. Preencha:
   - **Título**: Teste de Notificação
   - **Texto**: Esta é uma notificação de teste
6. Em **"Target"**, selecione seu app
7. Clique em **"Review"** e depois **"Publish"**

### Teste 3: Enviar via cURL

```bash
curl -X POST https://fcm.googleapis.com/v1/projects/SEU-PROJETO/messages:send \
  -H "Authorization: Bearer $(gcloud auth print-access-token)" \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "token": "FCM_TOKEN_DO_DISPOSITIVO",
      "notification": {
        "title": "Teste cURL",
        "body": "Notificação enviada via cURL"
      }
    }
  }'
```

### Teste 4: Script de Teste Local

Use o arquivo `client/src/utils/testNotifications.ts` que foi criado para testar diferentes cenários.

---

## 🐛 Troubleshooting

### Problema: "Registration failed - push service error"

**Causa:** VAPID key incorreta ou não configurada

**Solução:**
1. Verifique se a VAPID key está correta
2. Regenere a key no Firebase Console
3. Atualize no arquivo `.env`

### Problema: Notificações não aparecem no iOS

**Causas possíveis:**
1. App não está instalado como PWA
2. iOS < 16.4
3. Permissões não concedidas

**Soluções:**
1. Instale o app via "Add to Home Screen"
2. Atualize para iOS 16.4+
3. Verifique Settings > Notifications > [Seu App]

### Problema: "Failed to register service worker"

**Causa:** Service worker não encontrado ou com erro

**Soluções:**
1. Verifique se `firebase-messaging-sw.js` está em `/public`
2. Verifique erros de sintaxe no arquivo
3. Limpe o cache do navegador

### Problema: Token FCM não é gerado

**Causas possíveis:**
1. Firebase não inicializado
2. Sem conexão com internet
3. Bloqueado por ad-blocker

**Soluções:**
1. Verifique credenciais do Firebase
2. Teste conexão de internet
3. Desative extensões de bloqueio

### Problema: Notificações duplicadas

**Causa:** Múltiplos service workers registrados

**Solução:**
```javascript
// Limpar service workers antigos
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
  });
});
```

### Problema: "Messaging: We are unable to register the default service worker"

**Causas:**
1. Service worker em path incorreto
2. MIME type incorreto

**Soluções:**
1. Mova `firebase-messaging-sw.js` para a raiz pública
2. Configure servidor para servir com `Content-Type: application/javascript`

---

## 🔍 Debug: Checklist Completo

### Frontend

- [ ] Firebase config está correta no `.env`
- [ ] VAPID key está configurada
- [ ] Service worker está em `/public/firebase-messaging-sw.js`
- [ ] HTTPS em produção (ou localhost em dev)
- [ ] Permissão de notificação concedida
- [ ] Token FCM gerado com sucesso

### Backend

- [ ] Service account JSON configurado
- [ ] Firebase Admin SDK inicializado
- [ ] Variáveis de ambiente configuradas
- [ ] Função de envio implementada

### iOS Específico

- [ ] iOS 16.4 ou superior
- [ ] App instalado como PWA
- [ ] Aberto pelo ícone na home screen
- [ ] Permissões ativadas em Settings

### Testes

- [ ] Service worker registrado
- [ ] Token FCM obtido
- [ ] Notificação de teste recebida
- [ ] Notificação em foreground funciona
- [ ] Notificação em background funciona

---

## 📚 Referências Úteis

### Documentação Oficial

- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Web Push com FCM](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [PWA em iOS](https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/)

### Ferramentas de Teste

- [web.dev Push Notifications](https://web.dev/notifications/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Chrome DevTools - Application Tab](https://developer.chrome.com/docs/devtools/progressive-web-apps/)

### Exemplos e Tutoriais

- [FCM Quickstart](https://github.com/firebase/quickstart-js/tree/master/messaging)
- [Web Push Cookbook](https://web-push-book.gauntface.com/)
- [Service Worker Cookbook](https://serviceworke.rs/)

### Suporte da Comunidade

- [Stack Overflow - Firebase Cloud Messaging](https://stackoverflow.com/questions/tagged/firebase-cloud-messaging)
- [Firebase Community](https://firebase.google.com/community)
- [Reddit r/Firebase](https://www.reddit.com/r/Firebase/)

---

## 📝 Notas Finais

Este guia cobre os aspectos essenciais para implementar notificações push em seu PWA usando Firebase. Lembre-se de:

1. **Testar em múltiplos dispositivos** - Cada plataforma tem suas particularidades
2. **Respeitar as preferências do usuário** - Não seja invasivo com notificações
3. **Implementar fallbacks** - Nem todos os browsers suportam todas as features
4. **Monitorar métricas** - Use o Firebase Analytics para acompanhar engajamento
5. **Manter-se atualizado** - APIs e requisitos mudam frequentemente

Para suporte adicional, consulte a documentação oficial ou abra uma issue no repositório do projeto.

---

*Última atualização: Janeiro 2025*