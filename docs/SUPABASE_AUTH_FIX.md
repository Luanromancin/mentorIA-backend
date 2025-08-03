# Correção do Erro de Autenticação Supabase

## Problema Identificado

O erro `AuthApiError: User not allowed` com código `not_admin` ocorre porque o sistema está tentando usar a API administrativa do Supabase (`auth.admin.getUserById`) com a chave anônima (`SUPABASE_ANON_KEY`) em vez da chave de serviço (`SUPABASE_SERVICE_ROLE_KEY`).

### Erro Completo
```
❌ Erro ao buscar usuário: AuthApiError: User not allowed
status: 403
code: 'not_admin'
```

## Solução Implementada

### 1. Modificação do SupabaseService

O `SupabaseService` foi modificado para:
- Criar um cliente admin separado usando `SUPABASE_SERVICE_ROLE_KEY`
- Usar o cliente admin para operações administrativas
- Implementar fallback para quando a chave de serviço não estiver disponível

### 2. Configuração Necessária

Para resolver o problema, você precisa configurar a `SUPABASE_SERVICE_ROLE_KEY` no seu arquivo `.env`:

```bash
# Copie o arquivo de exemplo
cp env.supabase.example .env

# Edite o arquivo .env e adicione:
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

### 3. Como Obter a Service Role Key

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Settings** > **API**
4. Copie a **service_role key** (não a anon key)

### 4. Verificação

Após configurar a chave, você verá no log:
```
🔧 SUPABASE_SERVICE_ROLE_KEY: ✅ Definida
✅ Cliente admin inicializado com chave de serviço
```

## Fluxo Corrigido

1. **Login bem-sucedido**: Usuário faz login no Supabase Auth
2. **Busca de dados**: Sistema usa cliente admin para buscar dados do usuário
3. **Criação de perfil**: Se necessário, cria perfil no banco local
4. **Retorno**: Retorna dados do usuário e token JWT

## Fallback Implementado

Se a `SUPABASE_SERVICE_ROLE_KEY` não estiver configurada, o sistema:
- Não consegue buscar dados detalhados do usuário no Supabase
- Cria um perfil básico no banco local com dados mínimos
- O login ainda funciona, mas com dados limitados
- Recomenda-se configurar a chave de serviço para funcionalidade completa

## Segurança

- A `SUPABASE_SERVICE_ROLE_KEY` é privada e deve ser mantida segura
- Nunca exponha essa chave no frontend
- Use apenas no backend para operações administrativas

## Teste da Correção

Após configurar a chave de serviço, teste o login novamente. O erro `not_admin` deve desaparecer e o login deve funcionar corretamente. 