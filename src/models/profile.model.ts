import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

interface ProfileAttributes {
  id: string;
  email: string;
  name: string;
  birth_date?: Date;
  institution?: string;
  created_at?: Date;
  updated_at?: Date;
}

interface ProfileCreationAttributes
  extends Omit<ProfileAttributes, 'id' | 'created_at' | 'updated_at'> {
  id: string; // Obrigatório pois é a chave primária
}

class Profile
  extends Model<ProfileAttributes, ProfileCreationAttributes>
  implements ProfileAttributes
{
  public id!: string;
  public email!: string;
  public name!: string;
  public birth_date?: Date;
  public institution?: string;
  public created_at?: Date;
  public updated_at?: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Profile.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      allowNull: false,
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    institution: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Profile',
    tableName: 'profiles',
    timestamps: false, // Usamos os campos created_at e updated_at manuais
    underscored: true,
  }
);

export default Profile;
