# Configuração do Banco de Dados

## Problema Atual
O aplicativo está com erros 401 porque não consegue conectar ao banco de dados. As sessões são armazenadas no PostgreSQL e sem conexão, a autenticação não funciona.

## Opção 1: Configurar Supabase (Recomendado para produção)

### 1. Obter a Connection String do Supabase

1. Acesse seu projeto no [Supabase Dashboard](https://app.supabase.com)
2. Vá para **Settings** → **Database**
3. Em **Connection string**, copie a **URI** (use a versão "Pooling" para melhor performance)
4. A URL deve parecer com:
   ```
   postgresql://postgres.[seu-projeto]:[senha]@aws-0-[região].pooler.supabase.com:5432/postgres
   ```

### 2. Configurar no Replit

1. No Replit, clique em **Secrets** (ícone 🔒) no painel lateral
2. Adicione uma nova secret:
   - **Key:** `DATABASE_URL`
   - **Value:** Cole a connection string do Supabase

### 3. Reiniciar o Aplicativo

O aplicativo deve reiniciar automaticamente após adicionar a secret.

## Opção 2: Usar Banco Local (Desenvolvimento)

Se você não tem um banco Supabase, pode usar um banco PostgreSQL local:

### Banco de Teste Temporário
Para testes rápidos, adicione esta secret:
```
DATABASE_URL=postgresql://test:test123@ep-quiet-wave-123456.us-east-2.aws.neon.tech/neondb
```
⚠️ **ATENÇÃO**: Esta é uma URL de exemplo. Use apenas para testes!

## Verificar a Conexão

Após configurar, teste se está funcionando:

1. Reinicie o aplicativo
2. Tente fazer login
3. Verifique os logs - não devem mais aparecer erros de "DATABASE_URL not found"

## Troubleshooting

### Erro: "DATABASE_URL not found in environment variables"
- A variável não está configurada nas Secrets
- Verifique se o nome está correto: `DATABASE_URL` (tudo maiúsculo)

### Erro: "password authentication failed"
- A senha na connection string está incorreta
- Verifique se copiou a URL completa do Supabase

### Erro: "connection refused" ou timeout
- O banco pode estar pausado (Supabase pausa após 1 semana de inatividade no plano free)
- Acesse o dashboard do Supabase para reativar
- Verifique se o IP do Replit não está bloqueado (improvável)

### Sessions não funcionam mesmo com banco conectado
- Limpe os cookies do navegador
- Tente em uma aba anônima
- Verifique se a tabela `user_sessions` foi criada

## Estrutura das Tabelas

O aplicativo criará automaticamente as seguintes tabelas:
- `users` - Dados dos usuários
- `user_sessions` - Sessões de autenticação
- `radio_stations` - Estações de rádio
- `listening_sessions` - Sessões de escuta
- `transactions` - Transações financeiras
- `push_tokens` - Tokens para notificações push
- E outras...

## Railway Deployment

Se você está fazendo deploy no Railway:

1. Configure a DATABASE_URL no Railway também:
   - Vá para o serviço no Railway
   - Variables → Add Variable
   - `DATABASE_URL` = sua connection string

2. Configure também:
   - `SESSION_SECRET` = uma chave secreta forte
   - `NODE_ENV` = production
   - `FRONTEND_URL` = URL do seu frontend

## Contato

Se precisar de ajuda:
1. Verifique os logs completos do erro
2. Confirme que a DATABASE_URL está nas Secrets
3. Teste a connection string em um cliente PostgreSQL