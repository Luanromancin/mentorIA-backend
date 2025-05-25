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

interface JwtPayload {
  id: string;
  email: string;
}

export class AuthService {
  async register(data: RegisterData): Promise<AuthResponse> {
    const existingUser = await User.findOne({ where: { email: data.email } });
    if (existingUser) {
      throw new HttpError(400, 'Email já está em uso');
    }

    const user = await User.create({
      email: data.email,
      password: data.password,
      name: data.name,
      birthDate: data.birthDate,
      institution: data.institution,
    });

    const token = this.generateToken(user);
    return { user, token };
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const user = await User.findOne({ where: { email: data.email } });
    console.log('Usuário encontrado:', user);
    if (!user) {
      throw new HttpError(401, 'Credenciais inválidas');
    }

    console.log('Senha recebida:', data.password);
    console.log('Senha no banco:', user.password);
    const isValidPassword = await bcrypt.compare(data.password, user.password);
    console.log('Resultado comparação:', isValidPassword);
    if (!isValidPassword) {
      throw new HttpError(401, 'Credenciais inválidas');
    }

    const token = this.generateToken(user);
    return { user, token };
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
      // @ts-ignore - Ignorando erro de tipagem do JWT
      return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });
    } catch (error) {
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
    } catch (error) {
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
} 