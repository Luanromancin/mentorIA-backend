# 🚀 Guia de Configuração do Supabase

Este guia te ajudará a configurar o Supabase para o seu backend Node.js.

## 📋 Pré-requisitos

- Conta no Supabase (gratuita): [https://supabase.com](https://supabase.com)
- Node.js instalado
- Conhecimento básico de SQL

## 🔧 Passo a Passo

### 1. Criar Projeto no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login ou crie uma conta
3. Clique em "New Project"
4. Preencha as informações:
   - **Name**: `backend-nodejs-ess` (ou o nome que preferir)
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha a região mais próxima
5. Clique em "Create new project"
6. Aguarde a criação (pode levar alguns minutos)

### 2. Obter Credenciais

1. No painel do projeto, vá para **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (ex: `https://abc123.supabase.co`)
   - **anon public** key
   - **service_role** key (mantenha segura!)

### 3. Configurar Variáveis de Ambiente

1. Copie o arquivo `env.supabase.example` para `.env`:
   ```bash
   cp env.supabase.example .env
   ```

2. Edite o arquivo `.env` com suas credenciais:
   ```env
   SUPABASE_URL=https://seu-projeto-id.supabase.co
   SUPABASE_ANON_KEY=sua-anon-key-aqui
   SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
   ```

### 4. Configurar Banco de Dados

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em "New query"
3. Copie e cole o conteúdo do arquivo `docs/supabase-schema.sql`
4. Clique em "Run" para executar o script

### 5. Configurar Autenticação

1. No painel do Supabase, vá para **Authentication** > **Settings**
2. Configure as opções de autenticação:
   - **Site URL**: `http://localhost:3000` (para desenvolvimento)
   - **Redirect URLs**: `http://localhost:3000/auth/callback`
   - **Enable email confirmations**: Desabilitado (para desenvolvimento)
   - **Enable email change confirmations**: Desabilitado (para desenvolvimento)

### 6. Testar a Configuração

1. Inicie o servidor:
   ```bash
   npm run dev
   ```

2. Teste o registro:
   ```bash
   curl -X POST http://localhost:3000/api/supabase-auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teste@exemplo.com",
       "password": "123456",
       "name": "Usuário Teste"
     }'
   ```

3. Teste o login:
   ```bash
   curl -X POST http://localhost:3000/api/supabase-auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "teste@exemplo.com",
       "password": "123456"
     }'
   ```

## 🔒 Segurança

### Variáveis de Ambiente

- **SUPABASE_URL**: URL pública do projeto
- **SUPABASE_ANON_KEY**: Chave pública (segura para frontend)
- **SUPABASE_SERVICE_ROLE_KEY**: Chave privada (use apenas no backend)

### Políticas de Segurança (RLS)

O script SQL já configura:
- Row Level Security (RLS) habilitado
- Políticas para usuários acessarem apenas seus dados
- Triggers para criar perfis automaticamente

## 📊 Monitoramento

### Logs
- Acesse **Logs** no painel do Supabase para ver requisições
- Configure alertas para erros de autenticação

### Métricas
- **Dashboard** > **Analytics** para métricas de uso
- **Database** > **Tables** para ver dados das tabelas

## 🚨 Troubleshooting

### Erro de Conexão
```
Error: Invalid API key
```
- Verifique se as credenciais estão corretas
- Confirme se o projeto está ativo

### Erro de Tabela
```
Error: relation "profiles" does not exist
```
- Execute o script SQL no Supabase
- Verifique se as tabelas foram criadas

### Erro de Autenticação
```
Error: Invalid login credentials
```
- Verifique se o usuário foi criado
- Confirme se o email está confirmado (se habilitado)

## 🔄 Migração do Sistema Atual

Se você já tem usuários no sistema atual:

1. **Exportar dados** do banco atual
2. **Criar script de migração** para inserir no Supabase
3. **Testar** com dados de desenvolvimento
4. **Executar migração** em produção

## 📚 Recursos Adicionais

- [Documentação do Supabase](https://supabase.com/docs)
- [Guia de Autenticação](https://supabase.com/docs/guides/auth)
- [API Reference](https://supabase.com/docs/reference/javascript)
- [Exemplos de Código](https://supabase.com/docs/guides/examples)

## 🎯 Próximos Passos

1. **Configurar email** para confirmações
2. **Implementar reset de senha**
3. **Adicionar autenticação social** (Google, GitHub, etc.)
4. **Configurar webhooks** para eventos
5. **Implementar cache** com Redis (opcional) 