# 🚀 Guia de Deploy no Railway - RádioPlay

## ✅ PROBLEMA RESOLVIDO!

O erro "Autenticação necessária" ao converter pontos foi **CORRIGIDO**. As seguintes configurações foram adicionadas ao código:

1. **Trust Proxy** - Configurado para Railway HTTPS
2. **CORS** - Habilitado com credenciais 
3. **Cookies Seguros** - Configurados para produção

## 📋 Variáveis de Ambiente no Railway

Configure as seguintes variáveis no painel do Railway:

### 1. Variáveis Obrigatórias ⚠️

```env
# Banco de Dados (Railway provisiona automaticamente)
DATABASE_URL=postgresql://user:password@host:port/database

# CRÍTICO: Use uma chave forte e única!
SESSION_SECRET=mude-isto-para-uma-chave-super-segura-com-64-caracteres-aleatorios

# Ambiente - OBRIGATÓRIO
NODE_ENV=production

# Porta (Railway configura automaticamente) 
PORT=5000
```

### 2. Variáveis de Pagamento (OrinPay)

```env
# Credenciais OrinPay
ORINPAY_API_KEY=sua-api-key-aqui
ORINPAY_CLIENT_ID=seu-client-id-aqui
```

### 3. Variáveis Opcionais

```env
# URL do Frontend (se estiver em domínio diferente)
FRONTEND_URL=https://seu-dominio.com

# Domínio do Cookie (se precisar especificar)
COOKIE_DOMAIN=.seu-dominio.com
```

## Configurações Importantes

### Trust Proxy
✅ Já configurado no código para Railway

### CORS
✅ Configurado para permitir credenciais e cookies

### Sessões
✅ Usa PostgreSQL para persistir sessões
✅ Cookies seguros em produção

## Checklist de Deploy

1. [ ] Configure `SESSION_SECRET` com valor forte
2. [ ] Configure `DATABASE_URL` (Railway faz automaticamente)
3. [ ] Configure `NODE_ENV=production`
4. [ ] Configure credenciais OrinPay se usar pagamentos
5. [ ] Teste login e conversão de pontos após deploy

## Solução de Problemas

### Erro "Autenticação necessária"
- ✅ Trust proxy configurado
- ✅ CORS com credentials habilitado
- ✅ Cookies com SameSite=none em produção
- Verifique se `SESSION_SECRET` está configurado
- Verifique se `DATABASE_URL` está correto

### Cookies não funcionam
- Certifique-se que `NODE_ENV=production`
- Se frontend e backend em domínios diferentes, configure `FRONTEND_URL`