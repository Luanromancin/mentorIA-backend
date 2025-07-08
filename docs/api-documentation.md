# Documentação da API de Autenticação

## Base URL
```
http://localhost:3000/api
```

## Endpoints Disponíveis

### 1. Cadastro de Usuário
**POST** `/auth/register`

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "birthDate": "1990-01-01",
  "institution": "Instituição"
}
```

**Resposta de Sucesso (201):**
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "institution": "Instituição",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-aqui"
}
```

**Resposta de Erro (400):**
```json
{
  "message": "Email já está em uso"
}
```

### 2. Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "usuario@exemplo.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "user": {
    "id": "uuid-do-usuario",
    "email": "usuario@exemplo.com",
    "name": "Nome do Usuário",
    "birthDate": "1990-01-01T00:00:00.000Z",
    "institution": "Instituição",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "token": "jwt-token-aqui"
}
```

**Resposta de Erro (401):**
```json
{
  "message": "Credenciais inválidas"
}
```

### 3. Refresh Token
**POST** `/auth/refresh`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "token": "novo-jwt-token-aqui"
}
```

**Resposta de Erro (401):**
```json
{
  "message": "Token inválido"
}
```

### 4. Logout
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Logout realizado com sucesso"
}
```

### 5. Dados do Usuário Logado
**GET** `/auth/me`

**Headers:**
```
Authorization: Bearer <token>
```

**Resposta de Sucesso (200):**
```json
{
  "id": "uuid-do-usuario",
  "email": "usuario@exemplo.com",
  "name": "Nome do Usuário",
  "birthDate": "1990-01-01T00:00:00.000Z",
  "institution": "Instituição",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Resposta de Erro (401):**
```json
{
  "message": "Token inválido"
}
```

### 6. Recuperação de Senha
**POST** `/auth/forgot-password`

**Body:**
```json
{
  "email": "usuario@exemplo.com"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Se o email existir, você receberá instruções para redefinir sua senha"
}
```

### 7. Reset de Senha
**POST** `/auth/reset-password`

**Body:**
```json
{
  "token": "token-de-reset",
  "newPassword": "nova-senha123"
}
```

**Resposta de Sucesso (200):**
```json
{
  "message": "Senha redefinida com sucesso"
}
```

**Resposta de Erro (400):**
```json
{
  "message": "Token inválido ou expirado"
}
```

## Autenticação

### Como enviar o token
Para endpoints que requerem autenticação, inclua o token JWT no header `Authorization`:

```
Authorization: Bearer <seu-jwt-token>
```

### Estrutura do Token JWT
O token JWT contém as seguintes informações:
- `id`: ID do usuário
- `email`: Email do usuário
- `exp`: Data de expiração (1 hora por padrão)

### Códigos de Status HTTP
- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Erro de validação/Bad Request
- `401`: Não autorizado
- `404`: Não encontrado
- `500`: Erro interno do servidor

## Exemplos de Uso

### Exemplo de Login com JavaScript/Fetch
```javascript
const login = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    
    if (response.ok) {
      // Salvar token no localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};
```

### Exemplo de Requisição Autenticada
```javascript
const getProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      return data;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    throw error;
  }
};
```

### Exemplo de Refresh Token
```javascript
const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/auth/refresh', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (response.ok) {
      // Atualizar token no localStorage
      localStorage.setItem('token', data.token);
      return data.token;
    } else {
      throw new Error(data.message);
    }
  } catch (error) {
    console.error('Erro ao renovar token:', error);
    throw error;
  }
};
``` 