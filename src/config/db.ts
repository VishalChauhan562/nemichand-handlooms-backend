import { Sequelize } from 'sequelize-typescript';
import dotenv from 'dotenv';
import pgtools from 'pgtools';

dotenv.config();

// Configuration for PostgreSQL connection
const config = {
  user: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
};

// Database name
const databaseName = process.env.DB_NAME || 'nemichand_handlooms';

// Function to create the database if it doesn't exist
const createDatabaseIfNotExists = async () => {
  try {
    await pgtools.createdb(config, databaseName);
    console.log(`Database "${databaseName}" created successfully!`);
  } catch (err: any) {
    if (err.name === 'duplicate_database') {
      console.log(`Database "${databaseName}" already exists.`);
    } else {
      console.error('Error creating database:', err);
      process.exit(1);
    }
  }
};

// Initialize Sequelize
export const sequelize = new Sequelize({
  database: databaseName,
  username: config.user,
  password: config.password,
  host: config.host,
  port: config.port,
  dialect: 'postgres',
  models: [__dirname + '/../models'], // Automatically load models
  logging: false,
});

// Function to initialize the database
export const initializeDatabase = async () => {
  await createDatabaseIfNotExists(); // Ensure the database exists

  try {
    await sequelize.authenticate(); // Test database connection
    console.log('Database connected successfully!');
    await sequelize.sync({ alter: true }); // Automatically sync tables
  } catch (error) {
    console.error('Error during database connection:', error);
    process.exit(1);
  }
};
