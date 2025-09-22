# 🚨 CORREÇÃO URGENTE PARA O RAILWAY

## O Problema Real
O banco está conectado mas as SESSÕES não estão funcionando porque faltam variáveis críticas!

## CONFIGURE ESTAS 4 VARIÁVEIS NO RAILWAY AGORA:

### 1. ✅ DATABASE_URL 
```
Você já configurou - OK!
```

### 2. ❌ SESSION_SECRET (OBRIGATÓRIO!!!)
```
SESSION_SECRET=gere-uma-chave-super-forte-aqui-123456789
```
**GERE UMA CHAVE FORTE:** Use este comando no terminal:
```bash
openssl rand -base64 32
```
Ou use algo como: `railway-radioplay-secret-2024-super-seguro-mude-isso`

### 3. ❌ FRONTEND_URL (OBRIGATÓRIO!!!)
```
FRONTEND_URL=https://radioplay-production.up.railway.app
```
**IMPORTANTE:** Coloque a URL EXATA do seu frontend no Railway (sem / no final)

### 4. ❌ NODE_ENV (OBRIGATÓRIO!!!)
```
NODE_ENV=production
```

## Como Configurar no Railway (Passo a Passo):

1. Abra seu projeto no [Railway Dashboard](https://railway.app/dashboard)
2. Clique no serviço do backend 
3. Vá na aba **"Variables"**
4. Adicione CADA variável acima usando o botão **"+ New Variable"**
5. Railway fará redeploy automático

## Por que não está funcionando:

- ✅ Database conectado (DATABASE_URL configurada)
- ❌ Sessões não funcionam sem SESSION_SECRET
- ❌ Cookies bloqueados sem FRONTEND_URL
- ❌ Configurações de produção não ativas sem NODE_ENV=production

## Teste Rápido Após Configurar:

No console do navegador, execute:
```javascript
// 1. Ver status da sessão
fetch('https://seu-backend.railway.app/api/debug/session', {
  credentials: 'include'
}).then(r => r.json()).then(console.log)
```

Deve retornar algo como:
```json
{
  "hasSession": true,
  "environment": {
    "nodeEnv": "production",
    "hasFrontendUrl": true,
    "hasSessionSecret": true
  }
}
```

## Se AINDA não funcionar:

### Adicione também (opcional):
```
COOKIE_DOMAIN=.railway.app
```
Só se frontend e backend estão em subdomínios diferentes.

### Verifique se:
1. Frontend e backend estão ambos em HTTPS
2. Você está testando em navegador normal (não modo incógnito)
3. Cookies de terceiros não estão bloqueados

## Estrutura Correta das URLs:

### Se estão no mesmo app:
- Frontend: https://radioplay.railway.app
- Backend: https://radioplay.railway.app/api

### Se estão separados:
- Frontend: https://radioplay-frontend.railway.app
- Backend: https://radioplay-backend.railway.app
- Configure COOKIE_DOMAIN=.railway.app

## RESUMO: Configure AGORA no Railway

```env
SESSION_SECRET=coloque-uma-chave-forte-aqui
FRONTEND_URL=https://sua-url-frontend.railway.app
NODE_ENV=production
```

Essas 3 variáveis + DATABASE_URL que você já tem = FUNCIONANDO! 🚀