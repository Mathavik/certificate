import { DataTypes, Model } from 'sequelize';
import sequelize from './index';

class CertificateRecord extends Model {
  declare id: number;
  declare name: string;
  declare college: string;
  declare generatedDate: Date;
}

CertificateRecord.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    college: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    generatedDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'CertificateRecords',
    timestamps: true,
  }
);

export default CertificateRecord;
