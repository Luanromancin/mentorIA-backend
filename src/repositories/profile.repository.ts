import Profile from '../models/profile.model';

export interface ProfileData {
  id: string;
  email: string;
  name: string;
  birth_date?: Date;
  institution?: string;
}

export interface CreateProfileData {
  id: string;
  email: string;
  name: string;
  birth_date?: Date;
  institution?: string;
}

export interface UpdateProfileData {
  name?: string;
  birth_date?: Date;
  institution?: string;
}

class ProfileRepository {
  /**
   * Cria um novo perfil
   */
  async createProfile(data: CreateProfileData): Promise<Profile> {
    try {
      const profile = await Profile.create(data);
      return profile;
    } catch (error) {
      throw new Error(`Erro ao criar perfil: ${error}`);
    }
  }

  /**
   * Busca perfil por email
   */
  async findByEmail(email: string): Promise<Profile | null> {
    try {
      const profile = await Profile.findOne({
        where: { email },
      });
      return profile;
    } catch (error) {
      throw new Error(`Erro ao buscar perfil por email: ${error}`);
    }
  }

  /**
   * Busca perfil por ID
   */
  async findById(id: string): Promise<Profile | null> {
    try {
      const profile = await Profile.findByPk(id);
      return profile;
    } catch (error) {
      throw new Error(`Erro ao buscar perfil por ID: ${error}`);
    }
  }

  /**
   * Atualiza um perfil
   */
  async updateProfile(
    id: string,
    data: UpdateProfileData
  ): Promise<Profile | null> {
    try {
      const profile = await Profile.findByPk(id);
      if (!profile) {
        return null;
      }

      await profile.update(data);
      return profile;
    } catch (error) {
      throw new Error(`Erro ao atualizar perfil: ${error}`);
    }
  }

  /**
   * Deleta um perfil
   */
  async deleteProfile(id: string): Promise<boolean> {
    try {
      const deleted = await Profile.destroy({
        where: { id },
      });
      return deleted > 0;
    } catch (error) {
      throw new Error(`Erro ao deletar perfil: ${error}`);
    }
  }

  /**
   * Lista todos os perfis
   */
  async findAll(): Promise<Profile[]> {
    try {
      const profiles = await Profile.findAll({
        order: [['created_at', 'DESC']],
      });
      return profiles;
    } catch (error) {
      throw new Error(`Erro ao listar perfis: ${error}`);
    }
  }

  /**
   * Verifica se um email já existe
   */
  async emailExists(email: string): Promise<boolean> {
    try {
      const count = await Profile.count({
        where: { email },
      });
      return count > 0;
    } catch (error) {
      throw new Error(`Erro ao verificar email: ${error}`);
    }
  }
}

export default new ProfileRepository();
