import 'reflect-metadata';
import { DataSource } from 'typeorm';
import Customer from '../modules/customers/entities/Customer';
import User from '../modules/users/entities/User';
import Order from '../modules/Order/entities/OrderEntity';
import Cars from '../modules/cars/entities/Cars';

import dotenv from 'dotenv';
dotenv.config();

import path from 'path';

const port = parseInt(process.env.DB_PORT || '3306', 10);

const isProduction = process.env.NODE_ENV === 'production';

const migrationsPath = isProduction
  ? path.join(__dirname, 'migration/*.js')  // Produção
  : path.join(__dirname, 'migration/*.ts'); // Desenvolvimento

const AppDataSource = new DataSource({
  type: 'mariadb',
  host: process.env.DB_HOST,
  port: port,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: false,
  logging: false,
  entities: [Customer, User, Order, Cars],
  migrations: [migrationsPath],
  subscribers: [],
});

export default AppDataSource;
