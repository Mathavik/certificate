import { Sequelize } from 'sequelize';
import config from '../config/config';

const sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
  host: config.db.host,
  port: config.db.port,
  dialect: config.db.dialect,
  logging: false,
  dialectOptions: {
    connectTimeout: 10000,
  },
});

export const connectDB = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('MySQL connected successfully.');
  } catch (error) {
    console.error('Unable to connect to MySQL:', error);
    process.exit(1);
  }
};

export default sequelize;
