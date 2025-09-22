# Correção de Sessões no Railway

## Problema
O erro `POST /api/listening/start 401 error: Autenticação necessária` indica que as sessões não estão sendo mantidas entre requisições.

## Solução - Variáveis de Ambiente no Railway

Configure as seguintes variáveis de ambiente no seu projeto Railway:

### 1. SESSION_SECRET (OBRIGATÓRIO)
```
SESSION_SECRET=uma-chave-secreta-muito-forte-mude-isso-em-producao
```
⚠️ **IMPORTANTE**: Use uma chave forte e única. Você pode gerar uma usando:
```bash
openssl rand -base64 32
```

### 2. FRONTEND_URL (OBRIGATÓRIO)
```
FRONTEND_URL=https://seu-frontend-url.railway.app
```
Substitua com a URL real do seu frontend no Railway.

### 3. COOKIE_DOMAIN (Opcional - use se frontend e backend estão em subdomínios diferentes)
```
COOKIE_DOMAIN=.railway.app
```
Use apenas se seu frontend e backend estão em subdomínios diferentes (ex: frontend.railway.app e backend.railway.app)

### 4. NODE_ENV
```
NODE_ENV=production
```
Certifique-se de que está definido como "production".

### 5. DATABASE_URL
Já deve estar configurado automaticamente pelo Railway quando você adiciona o PostgreSQL.

## Como Configurar no Railway

1. Acesse seu projeto no Railway Dashboard
2. Clique no serviço do backend
3. Vá para a aba "Variables"
4. Adicione cada variável acima
5. O Railway fará o redeploy automaticamente

## Verificação de Configuração

### Backend (server/index.ts) já está configurado corretamente com:
- ✅ `trust proxy` configurado para 1
- ✅ `sameSite: 'none'` para cookies em produção
- ✅ `secure: true` para cookies HTTPS em produção
- ✅ `credentials: true` no CORS
- ✅ Session store usando PostgreSQL

### Frontend (client/src/lib/api.ts) já está configurado com:
- ✅ `credentials: 'include'` em todas as requisições

## Troubleshooting

### Se ainda não funcionar após configurar as variáveis:

1. **Verifique os domínios**:
   - O frontend e backend devem estar acessíveis via HTTPS
   - Se estão em domínios completamente diferentes, pode ser necessário ajustar CORS

2. **Verifique o Console do Navegador**:
   - Procure por erros relacionados a cookies bloqueados
   - Verifique se os cookies estão sendo enviados nas requisições (aba Network)

3. **Teste a sessão**:
   ```javascript
   // No console do navegador:
   // 1. Faça login
   await fetch('https://seu-backend.railway.app/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     credentials: 'include',
     body: JSON.stringify({ 
       email: 'seu-email@example.com', 
       password: 'sua-senha' 
     })
   })
   
   // 2. Verifique se a sessão está ativa
   await fetch('https://seu-backend.railway.app/api/auth/me', {
     credentials: 'include'
   }).then(r => r.json())
   ```

4. **Cookies de Terceiros**:
   - Alguns navegadores bloqueiam cookies de terceiros por padrão
   - Considere usar o mesmo domínio/subdomínio para frontend e backend

## Configuração Recomendada para Railway

Para evitar problemas com cookies de terceiros, considere:

1. **Usar Custom Domain** (mesma raiz):
   - Frontend: `app.seudominio.com`
   - Backend: `api.seudominio.com`
   - Configure `COOKIE_DOMAIN=.seudominio.com`

2. **Ou usar Monorepo com proxy**:
   - Deploy tudo no mesmo serviço
   - Use o Vite para fazer proxy das requisições /api

## Logs para Debug

Se precisar debugar mais, adicione estes logs temporários no backend:

```javascript
// Em server/routes.ts, antes do requireAuth
app.use((req, res, next) => {
  console.log('Session Debug:', {
    path: req.path,
    sessionId: req.sessionID,
    userId: req.session?.userId,
    cookies: req.headers.cookie,
    origin: req.headers.origin
  });
  next();
});
```

## Contato

Se o problema persistir após essas configurações, verifique:
- Os logs detalhados do Railway
- O status da tabela `user_sessions` no banco de dados
- Se há algum firewall ou proxy adicional bloqueando cookies