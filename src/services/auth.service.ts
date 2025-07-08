import User from '../models/user.model';
import PasswordResetToken from '../models/password-reset-token.model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import env from '../env';
import { HttpError } from '../utils/http-error';

interface RegisterData {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  institution: string;
}

interface LoginData {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface RefreshTokenResponse {
  token: string;
}

interface JwtPayload {
  id: number;
  email: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      console.log('Iniciando registro com dados:', {
        ...data,
        password: '***',
        birthDate: data.birthDate,
      });

      // Validação explícita do password
      if (!data.password || data.password.length < 6) {
        throw new HttpError(400, 'Senha deve ter pelo menos 6 caracteres');
      }

      const existingUser = await User.findOne({ where: { email: data.email } });
      if (existingUser) {
        throw new HttpError(400, 'Email já está em uso');
      }

      // Criando usuário com os campos corretos
      const user = await User.create({
        email: data.email,
        password: data.password, // O setter virtual irá processar isso
        name: data.name,
        birth_date: new Date(data.birthDate),
        institution: data.institution,
      }).catch((error) => {
        console.error('Erro ao criar usuário:', error);
        throw error;
      });

      console.log('Usuário criado com sucesso:', {
        id: user.id,
        email: user.email,
        birth_date: user.birth_date,
      });

      const { password_hash: _, ...userWithoutPassword } = user.toJSON();
      const token = this.generateToken(user);
      return { user: userWithoutPassword, token };
    } catch (error) {
      console.error('Erro detalhado no registro:', error);
      if (error instanceof HttpError) {
        throw error;
      }
      if (error.name === 'SequelizeValidationError') {
        throw new HttpError(400, 'Dados inválidos: ' + error.message);
      }
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw new HttpError(400, 'Email já está em uso');
      }
      throw new HttpError(500, 'Erro ao registrar usuário: ' + error.message);
    }
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user) {
      throw new HttpError(401, 'Email ou senha incorretos');
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      user.password_hash
    );
    if (!isValidPassword) {
      throw new HttpError(401, 'Email ou senha incorretos');
    }

    const { password_hash: _, ...userWithoutPassword } = user.toJSON();
    const token = this.generateToken(user);
    return { user: userWithoutPassword, token };
  }

  private generateToken(user: User): string {
    if (!env.JWT_SECRET) {
      throw new HttpError(500, 'JWT_SECRET não configurado');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
    };

    try {
      // @ts-expect-error - Ignorando erro de tipagem do JWT
      return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: env.JWT_EXPIRES_IN,
      });
    } catch {
      throw new HttpError(500, 'Erro ao gerar token');
    }
  }

  async validateToken(token: string): Promise<User> {
    if (!env.JWT_SECRET) {
      throw new HttpError(500, 'JWT_SECRET não configurado');
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new HttpError(401, 'Usuário não encontrado');
      }
      return user;
    } catch {
      throw new HttpError(401, 'Token inválido');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Por segurança, não revelamos se o email existe ou não
      return;
    }

    // Remove tokens antigos
    await PasswordResetToken.destroy({ where: { userId: user.id } });

    // Cria novo token
    const token = await PasswordResetToken.create({
      userId: user.id,
      token: Math.random().toString(36).substring(2),
      expiresAt: new Date(Date.now() + 3600000), // 1 hora
    });

    // TODO: Implementar envio de email com o token
    console.log(`Token de reset para ${email}: ${token.token}`);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const resetToken = await PasswordResetToken.findOne({
      where: { token },
    });

    if (!resetToken || resetToken.expiresAt < new Date()) {
      throw new HttpError(400, 'Token inválido ou expirado');
    }

    const user = await User.findByPk(resetToken.userId);
    if (user) {
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      await user.update({ password: hashedPassword });
    }
    await resetToken.destroy();
  }

  async refreshToken(userId: number): Promise<RefreshTokenResponse> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new HttpError(401, 'Usuário não encontrado');
    }

    const token = this.generateToken(user);
    return { token };
  }

  async getUserProfile(userId: number): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado');
    }
    return user;
  }
}
