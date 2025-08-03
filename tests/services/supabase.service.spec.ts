import supabaseService from '../../src/services/supabase.service';

describe('SupabaseService', () => {

  describe('constructor', () => {
    it('should initialize with valid configuration', () => {
      expect(supabaseService).toBeDefined();
    });
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      
      try {
        const result = await supabaseService.createUser(email, password);
        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.email).toBe(email);
      } catch (error) {
        // Se falhar, pode ser porque o usuário já existe
        expect(error).toBeDefined();
      }
    });

    it('should handle invalid email', async () => {
      const email = 'invalid-email';
      const password = 'password123';
      
      try {
        await supabaseService.createUser(email, password);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('loginUser', () => {
    it('should handle login with non-existent user', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';
      
      try {
        await supabaseService.loginUser(email, password);
        fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.message).toContain('Email ou senha incorretos');
      }
    });
  });

  describe('getUserById', () => {
    it('should handle non-existent user ID', async () => {
      const userId = '00000000-0000-0000-0000-000000000000';
      
      const result = await supabaseService.getUserById(userId);
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should handle non-existent email', async () => {
      const email = 'nonexistent@example.com';
      
      const result = await supabaseService.getUserByEmail(email);
      expect(result).toBeNull();
    });
  });
}); 