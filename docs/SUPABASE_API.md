# 🔐 API de Autenticação com Supabase

Esta documentação descreve os endpoints de autenticação usando o Supabase.

## 📋 Base URL

```
http://localhost:3000/api/supabase-auth
```

## 🔑 Autenticação

Todos os endpoints que requerem autenticação devem incluir o token JWT no header:

```
Authorization: Bearer <token>
```

## 📝 Endpoints

### 1. Registrar Usuário

**POST** `/register`

Registra um novo usuário no sistema.

#### Request Body

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "birthDate": "1990-01-01",
  "institution": "Universidade XYZ"
}
```

#### Response (201)

```json
{
  "success": true,
  "message": "Usuário registrado com sucesso",
  "data": {
    "user": {
      "id": "uuid-do-usuario",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "birth_date": "1990-01-01",
      "institution": "Universidade XYZ"
    },
    "token": "jwt-token-aqui",
    "refreshToken": "refresh-token-aqui"
  }
}
```

#### Response (400)

```json
{
  "success": false,
  "message": "Email, senha e nome são obrigatórios"
}
```

### 2. Login

**POST** `/login`

Autentica um usuário existente.

#### Request Body

```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "user": {
      "id": "uuid-do-usuario",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "birth_date": "1990-01-01",
      "institution": "Universidade XYZ"
    },
    "token": "jwt-token-aqui",
    "refreshToken": "refresh-token-aqui"
  }
}
```

#### Response (401)

```json
{
  "success": false,
  "message": "Email ou senha incorretos"
}
```

### 3. Validar Token

**GET** `/validate-token`

Valida se um token JWT é válido.

#### Headers

```
Authorization: Bearer <token>
```

#### Response (200)

```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "user": {
      "id": "uuid-do-usuario",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "birth_date": "1990-01-01",
      "institution": "Universidade XYZ"
    }
  }
}
```

#### Response (401)

```json
{
  "success": false,
  "message": "Token inválido"
}
```

### 4. Renovar Token

**POST** `/refresh-token`

Renova um token JWT usando o refresh token.

#### Request Body

```json
{
  "refreshToken": "refresh-token-aqui"
}
```

#### Response (200)

```json
{
  "success": true,
  "message": "Token renovado com sucesso",
  "data": {
    "user": {
      "id": "uuid-do-usuario",
      "email": "usuario@exemplo.com"
    },
    "token": "novo-jwt-token",
    "refreshToken": "novo-refresh-token"
  }
}
```

### 5. Logout

**POST** `/logout`

Faz logout do usuário (invalida o token).

#### Headers

```
Authorization: Bearer <token>
```

#### Response (200)

```json
{
  "success": true,
  "message": "Logout realizado com sucesso"
}
```

### 6. Obter Perfil

**GET** `/profile`

Obtém o perfil completo do usuário autenticado.

#### Headers

```
Authorization: Bearer <token>
```

#### Response (200)

```json
{
  "success": true,
  "message": "Perfil obtido com sucesso",
  "data": {
    "profile": {
      "id": "uuid-do-usuario",
      "email": "usuario@exemplo.com",
      "name": "Nome do Usuário",
      "birth_date": "1990-01-01",
      "institution": "Universidade XYZ",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

## 🔄 Comparação com API Original

| Funcionalidade | API Original | API Supabase |
|----------------|--------------|--------------|
| Registro | `/api/auth/register` | `/api/supabase-auth/register` |
| Login | `/api/auth/login` | `/api/supabase-auth/login` |
| Validação | Middleware JWT | `/api/supabase-auth/validate-token` |
| Refresh Token | Não implementado | `/api/supabase-auth/refresh-token` |
| Logout | Não implementado | `/api/supabase-auth/logout` |
| Perfil | Não implementado | `/api/supabase-auth/profile` |

## 🧪 Testes

### Usando cURL

#### Registrar usuário
```bash
curl -X POST http://localhost:3000/api/supabase-auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "123456",
    "name": "Usuário Teste"
  }'
```

#### Fazer login
```bash
curl -X POST http://localhost:3000/api/supabase-auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "123456"
  }'
```

#### Validar token
```bash
curl -X GET http://localhost:3000/api/supabase-auth/validate-token \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

### Usando JavaScript

```javascript
// Registrar usuário
const registerResponse = await fetch('http://localhost:3000/api/supabase-auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'teste@exemplo.com',
    password: '123456',
    name: 'Usuário Teste'
  })
});

const registerData = await registerResponse.json();
const token = registerData.data.token;

// Fazer login
const loginResponse = await fetch('http://localhost:3000/api/supabase-auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'teste@exemplo.com',
    password: '123456'
  })
});

// Obter perfil
const profileResponse = await fetch('http://localhost:3000/api/supabase-auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🚨 Códigos de Erro

| Código | Descrição |
|--------|-----------|
| 400 | Dados inválidos ou obrigatórios |
| 401 | Não autorizado (credenciais inválidas) |
| 404 | Recurso não encontrado |
| 500 | Erro interno do servidor |

## 🔒 Segurança

- Tokens JWT são usados para autenticação
- Refresh tokens para renovação automática
- Validação de entrada em todos os endpoints
- Sanitização de dados
- Rate limiting (configurável)
- Logs de auditoria

## 📊 Monitoramento

- Logs de autenticação
- Métricas de uso
- Alertas de segurança
- Auditoria de tokens 