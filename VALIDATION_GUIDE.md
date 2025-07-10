# Guia de Validação de Autenticação - Pré Pull Request

Este guia fornece instruções completas para validar todas as funcionalidades de autenticação antes de criar um pull request.

## 🚀 Pré-requisitos

1. **Servidor rodando**: Certifique-se de que o servidor está rodando na porta 3000
2. **Banco de dados**: Verifique se o Supabase está configurado e acessível
3. **Variáveis de ambiente**: Confirme que o `.env` está configurado corretamente

## 📋 Checklist de Validação

### 1. Validação Rápida (Recomendado primeiro)

Execute o teste básico para verificar as funcionalidades principais:

```bash
npm run test:auth-basic
```

**O que testa:**
- ✅ Registro de usuário
- ✅ Login de usuário
- ✅ Obtenção de perfil
- ✅ Tratamento de erros básico

### 2. Validação Completa

Execute o teste completo para validação abrangente:

```bash
npm run test:auth-complete
```

**O que testa:**
- 📝 **Registro**: Dados válidos, email duplicado, dados inválidos, campos faltando
- 🔐 **Login**: Credenciais válidas, senha incorreta, email inexistente, dados inválidos
- 👤 **Perfil**: Token válido, token inválido, sem token, token malformado
- 🎫 **Validação de Token**: Token válido, token expirado
- ⚡ **Performance**: Múltiplos registros simultâneos, múltiplos logins simultâneos
- 🔒 **Segurança**: Proteção contra SQL Injection, XSS, validação de senha fraca

### 3. Testes Automatizados

Execute os testes unitários e de integração:

```bash
npm test
```

**O que testa:**
- Testes unitários dos serviços
- Testes de integração dos controllers
- Cobertura de código

### 4. Validação Manual (Opcional)

Se quiser testar manualmente, use o Postman ou curl:

#### Registro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Usuário Teste",
    "email": "teste@example.com",
    "password": "senha123456"
  }'
```

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123456"
  }'
```

#### Perfil (com token)
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🎯 Critérios de Aprovação

### ✅ Funcionalidades Principais
- [ ] Registro de usuário funciona corretamente
- [ ] Login de usuário funciona corretamente
- [ ] Obtenção de perfil funciona corretamente
- [ ] Tokens JWT são gerados e validados corretamente

### ✅ Tratamento de Erros
- [ ] Erros de validação retornam status 400
- [ ] Credenciais inválidas retornam status 401
- [ ] Tokens inválidos retornam status 401
- [ ] Mensagens de erro são claras e informativas

### ✅ Segurança
- [ ] Senhas não são retornadas nas respostas
- [ ] Tokens são validados corretamente
- [ ] Proteção contra ataques básicos (SQL Injection, XSS)
- [ ] Validação de dados de entrada

### ✅ Performance
- [ ] Registros simultâneos funcionam
- [ ] Logins simultâneos funcionam
- [ ] Tempo de resposta adequado (< 2 segundos)

### ✅ Testes
- [ ] Todos os testes automatizados passam
- [ ] Cobertura de código adequada (> 50%)
- [ ] Testes de integração funcionam

## 🚨 Problemas Comuns e Soluções

### Erro: "Cannot connect to database"
- Verifique se o Supabase está acessível
- Confirme as variáveis de ambiente no `.env`
- Teste a conexão com `npm run test:supabase`

### Erro: "Email já está em uso"
- Este é um comportamento esperado
- O teste cria usuários com timestamps únicos
- Se persistir, limpe dados de teste no Supabase

### Erro: "Token inválido"
- Verifique se o JWT_SECRET está configurado
- Confirme se o token não expirou
- Teste com um novo login

### Erro: "Validation failed"
- Verifique se todos os campos obrigatórios estão presentes
- Confirme se o email está em formato válido
- Verifique se a senha tem pelo menos 6 caracteres

## 📊 Interpretação dos Resultados

### Teste Básico
- **4/4 passaram**: ✅ Pronto para PR
- **3/4 passaram**: ⚠️ Revise o teste que falhou
- **< 3/4 passaram**: ❌ Problemas críticos, não faça PR

### Teste Completo
- **6/6 categorias passaram**: ✅ Excelente, pronto para PR
- **5/6 categorias passaram**: ⚠️ Revise a categoria que falhou
- **< 5/6 categorias passaram**: ❌ Problemas significativos, não faça PR

## 🔄 Fluxo Recomendado

1. **Inicie o servidor**: `npm start`
2. **Execute teste básico**: `npm run test:auth-basic`
3. **Se básico passar**: Execute teste completo `npm run test:auth-complete`
4. **Se completo passar**: Execute testes automatizados `npm test`
5. **Se tudo passar**: ✅ Pronto para criar o PR!

## 📝 Notas para o PR

Ao criar o pull request, inclua:

1. **Resumo das mudanças**: O que foi implementado/modificado
2. **Resultados dos testes**: Screenshot ou output dos testes
3. **Funcionalidades testadas**: Lista das funcionalidades validadas
4. **Problemas conhecidos**: Se houver algum
5. **Instruções de teste**: Como testar as mudanças

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs do servidor
2. Confirme a configuração do Supabase
3. Teste a conexão com o banco
4. Verifique as variáveis de ambiente
5. Execute `npm run test:supabase` para validar conexão

---

**Lembre-se**: A validação completa garante que seu código está pronto para produção! 🚀 