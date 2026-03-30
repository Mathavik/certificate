import dotenv from 'dotenv';
import type { Dialect } from 'sequelize';

dotenv.config();

const server = {
  port: Number(process.env.SERVER_PORT ?? process.env.API_PORT ?? 5000),
};

const db = {
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 3306),
  database: process.env.DB_NAME ?? 'certificate_db',
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  dialect: (process.env.DB_DIALECT ?? 'mysql') as Dialect,
};

export default { server, db };
