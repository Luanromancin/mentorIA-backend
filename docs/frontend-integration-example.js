// Exemplo de integração com a API de autenticação
// Este arquivo contém funções prontas para usar no frontend

const API_BASE_URL = 'http://localhost:3000/api';

// Classe para gerenciar autenticação
class AuthService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Função auxiliar para fazer requisições
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = localStorage.getItem('token');

    const defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Adiciona token de autenticação se existir
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  // Cadastro de usuário
  async register(userData) {
    return this.makeRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Login
  async login(email, password) {
    const data = await this.makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Salvar dados no localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));

    return data;
  }

  // Logout
  async logout() {
    try {
      await this.makeRequest('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erro no logout:', error);
    } finally {
      // Limpar dados do localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Obter dados do usuário logado
  async getProfile() {
    return this.makeRequest('/auth/me', {
      method: 'GET',
    });
  }

  // Refresh token
  async refreshToken() {
    const data = await this.makeRequest('/auth/refresh', {
      method: 'POST',
    });

    // Atualizar token no localStorage
    localStorage.setItem('token', data.token);

    return data.token;
  }

  // Recuperação de senha
  async forgotPassword(email) {
    return this.makeRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Reset de senha
  async resetPassword(token, newPassword) {
    return this.makeRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // Verificar se o usuário está logado
  isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Obter usuário atual do localStorage
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  // Obter token atual
  getToken() {
    return localStorage.getItem('token');
  }
}

// Instância global do serviço de autenticação
const authService = new AuthService();

// Exemplos de uso:

// 1. Cadastro
async function handleRegister() {
  try {
    const userData = {
      email: 'usuario@exemplo.com',
      password: 'senha123',
      name: 'Nome do Usuário',
      birthDate: '1990-01-01',
      institution: 'Instituição'
    };

    const result = await authService.register(userData);
    console.log('Usuário cadastrado:', result);
    
    // Fazer login automaticamente após cadastro
    await authService.login(userData.email, userData.password);
    
  } catch (error) {
    console.error('Erro no cadastro:', error.message);
  }
}

// 2. Login
async function handleLogin() {
  try {
    const result = await authService.login('usuario@exemplo.com', 'senha123');
    console.log('Login realizado:', result);
    
    // Redirecionar para página principal
    // window.location.href = '/dashboard';
    
  } catch (error) {
    console.error('Erro no login:', error.message);
  }
}

// 3. Logout
async function handleLogout() {
  try {
    await authService.logout();
    console.log('Logout realizado');
    
    // Redirecionar para página de login
    // window.location.href = '/login';
    
  } catch (error) {
    console.error('Erro no logout:', error.message);
  }
}

// 4. Obter perfil
async function handleGetProfile() {
  try {
    const profile = await authService.getProfile();
    console.log('Perfil do usuário:', profile);
    
  } catch (error) {
    console.error('Erro ao obter perfil:', error.message);
    
    // Se o token expirou, tentar refresh
    if (error.message.includes('Token inválido')) {
      try {
        await authService.refreshToken();
        const profile = await authService.getProfile();
        console.log('Perfil do usuário (após refresh):', profile);
      } catch (refreshError) {
        console.error('Erro no refresh token:', refreshError.message);
        // Redirecionar para login
        // window.location.href = '/login';
      }
    }
  }
}

// 5. Recuperação de senha
async function handleForgotPassword() {
  try {
    await authService.forgotPassword('usuario@exemplo.com');
    console.log('Email de recuperação enviado');
    
  } catch (error) {
    console.error('Erro na recuperação de senha:', error.message);
  }
}

// 6. Reset de senha
async function handleResetPassword() {
  try {
    const token = 'token-recebido-por-email';
    const newPassword = 'nova-senha123';
    
    await authService.resetPassword(token, newPassword);
    console.log('Senha redefinida com sucesso');
    
  } catch (error) {
    console.error('Erro no reset de senha:', error.message);
  }
}

// 7. Verificar autenticação
function checkAuth() {
  if (authService.isAuthenticated()) {
    const user = authService.getCurrentUser();
    console.log('Usuário logado:', user);
    return true;
  } else {
    console.log('Usuário não está logado');
    return false;
  }
}

// 8. Interceptor para requisições autenticadas
class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const token = authService.getToken();
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (response.status === 401) {
        // Token expirado, tentar refresh
        try {
          await authService.refreshToken();
          // Reenviar requisição com novo token
          const newToken = authService.getToken();
          config.headers['Authorization'] = `Bearer ${newToken}`;
          
          const retryResponse = await fetch(`${this.baseURL}${endpoint}`, config);
          const data = await retryResponse.json();
          
          if (!retryResponse.ok) {
            throw new Error(data.message);
          }
          
          return data;
        } catch (refreshError) {
          // Refresh falhou, fazer logout
          await authService.logout();
          throw new Error('Sessão expirada. Faça login novamente.');
        }
      }

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      return data;
    } catch (error) {
      console.error('Erro na requisição:', error);
      throw error;
    }
  }

  // Exemplo de método para buscar dados protegidos
  async getProtectedData() {
    return this.request('/some-protected-endpoint', {
      method: 'GET',
    });
  }
}

// Instância global do cliente API
const apiClient = new ApiClient();

// Exportar para uso em outros arquivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { authService, apiClient };
} else {
  // Para uso no browser
  window.authService = authService;
  window.apiClient = apiClient;
} 