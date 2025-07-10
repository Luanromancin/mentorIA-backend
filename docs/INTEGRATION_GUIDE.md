# Guia de Integração Frontend-Backend

## Resumo dos Endpoints Disponíveis

✅ **Endpoints Implementados:**

1. **POST** `/api/auth/register` - Cadastro de usuário
2. **POST** `/api/auth/login` - Login
3. **POST** `/api/auth/refresh` - Refresh token (protegido)
4. **POST** `/api/auth/logout` - Logout (protegido)
5. **GET** `/api/auth/me` - Dados do usuário logado (protegido)
6. **POST** `/api/auth/forgot-password` - Recuperação de senha
7. **POST** `/api/auth/reset-password` - Reset de senha

## Estrutura de Resposta

### Resposta de Sucesso (Login/Register)
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
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Resposta de Erro
```json
{
  "message": "Mensagem de erro específica"
}
```

## Autenticação

### Como o backend espera receber o token
O backend espera o token JWT no header `Authorization` com o formato:
```
Authorization: Bearer <seu-jwt-token>
```

### Exemplo de requisição autenticada
```javascript
const response = await fetch('http://localhost:3000/api/auth/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});
```

## Instruções para o Frontend

### 1. Configuração Inicial

Copie o arquivo `docs/frontend-integration-example.js` para seu projeto frontend e ajuste a URL base conforme necessário:

```javascript
const API_BASE_URL = 'http://localhost:3000/api'; // Ajuste conforme seu ambiente
```

### 2. Implementação Básica

#### Login
```javascript
// Usando a classe AuthService
const authService = new AuthService();

try {
  const result = await authService.login(email, password);
  console.log('Login realizado:', result);
  // Redirecionar para dashboard
} catch (error) {
  console.error('Erro no login:', error.message);
  // Mostrar erro para o usuário
}
```

#### Cadastro
```javascript
const userData = {
  email: 'usuario@exemplo.com',
  password: 'senha123',
  name: 'Nome do Usuário',
  birthDate: '1990-01-01',
  institution: 'Instituição'
};

try {
  const result = await authService.register(userData);
  console.log('Usuário cadastrado:', result);
  // Fazer login automaticamente
  await authService.login(userData.email, userData.password);
} catch (error) {
  console.error('Erro no cadastro:', error.message);
}
```

#### Verificar se está logado
```javascript
if (authService.isAuthenticated()) {
  const user = authService.getCurrentUser();
  console.log('Usuário logado:', user);
} else {
  // Redirecionar para login
}
```

#### Obter dados do usuário
```javascript
try {
  const profile = await authService.getProfile();
  console.log('Perfil:', profile);
} catch (error) {
  console.error('Erro ao obter perfil:', error.message);
}
```

#### Logout
```javascript
try {
  await authService.logout();
  // Redirecionar para página de login
} catch (error) {
  console.error('Erro no logout:', error.message);
}
```

### 3. Gerenciamento de Token

O sistema implementa refresh automático de token. Quando um token expira (401), o sistema automaticamente:

1. Tenta renovar o token
2. Reenvia a requisição original
3. Se o refresh falhar, faz logout automático

### 4. Proteção de Rotas

```javascript
// Exemplo de componente de rota protegida (React)
function ProtectedRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (authService.isAuthenticated()) {
        try {
          // Verificar se o token ainda é válido
          await authService.getProfile();
          setIsAuthenticated(true);
        } catch (error) {
          // Token inválido, fazer logout
          await authService.logout();
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  if (loading) {
    return <div>Carregando...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
}
```

### 5. Interceptor para Requisições

Use a classe `ApiClient` para requisições que precisam de autenticação:

```javascript
const apiClient = new ApiClient();

// Exemplo de requisição protegida
try {
  const data = await apiClient.request('/some-protected-endpoint', {
    method: 'GET',
  });
  console.log('Dados:', data);
} catch (error) {
  console.error('Erro:', error.message);
}
```

### 6. Recuperação de Senha

```javascript
// Solicitar recuperação
try {
  await authService.forgotPassword('usuario@exemplo.com');
  alert('Email de recuperação enviado!');
} catch (error) {
  console.error('Erro:', error.message);
}

// Resetar senha (quando receber o token por email)
try {
  await authService.resetPassword(token, 'nova-senha123');
  alert('Senha redefinida com sucesso!');
} catch (error) {
  console.error('Erro:', error.message);
}
```

## Estrutura de Dados

### Dados do Usuário
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  birthDate: Date;
  institution: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Dados de Login/Register
```typescript
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  birthDate: string; // formato: "YYYY-MM-DD"
  institution: string;
}
```

## Códigos de Status HTTP

- `200` - Sucesso
- `201` - Criado com sucesso
- `400` - Erro de validação/Bad Request
- `401` - Não autorizado (token inválido/expirado)
- `404` - Não encontrado
- `500` - Erro interno do servidor

## Configuração do Ambiente

### Variáveis de Ambiente (Backend)
```env
JWT_SECRET=sua-chave-secreta-aqui
JWT_EXPIRES_IN=1h
PORT=3000
```

### CORS
O backend está configurado para aceitar requisições de qualquer origem (`*`). Para produção, configure adequadamente:

```javascript
// No backend (src/app.ts)
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  })
);
```

## Testando a Integração

### 1. Teste de Cadastro
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123",
    "name": "Usuário Teste",
    "birthDate": "1990-01-01",
    "institution": "Instituição Teste"
  }'
```

### 2. Teste de Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@exemplo.com",
    "password": "senha123"
  }'
```

### 3. Teste de Endpoint Protegido
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## Próximos Passos

1. **Implemente o frontend** usando as funções fornecidas
2. **Configure o CORS** adequadamente para produção
3. **Implemente validação** no frontend
4. **Adicione tratamento de erros** mais robusto
5. **Implemente refresh automático** de token
6. **Configure variáveis de ambiente** para diferentes ambientes

## Suporte

Se encontrar problemas na integração:

1. Verifique se o backend está rodando na porta correta
2. Confirme se o CORS está configurado adequadamente
3. Verifique se o token está sendo enviado corretamente
4. Consulte os logs do backend para erros específicos
5. Use as ferramentas de desenvolvedor do navegador para debugar requisições 