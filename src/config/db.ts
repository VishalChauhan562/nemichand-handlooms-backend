import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

dotenv.config();

// Ensure DATABASE_URL is available in the environment
if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL is not set in the .env file.");
  process.exit(1);
}

const modelRoutes = fs
  .readdirSync(path.join(__dirname, "/../models")) // Read files in the models directory
  .filter((file) => file !== "index.ts") // Exclude index.ts
  .map((file) => path.join(__dirname, "/../models", file));

// Initialize Sequelize using the DATABASE_URL
export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: "postgres",
  models: modelRoutes, // Automatically load models
  logging: false,
  dialectOptions: {
    ssl: {
      require: true, // Required for Neon
      rejectUnauthorized: false, // Accept self-signed certificates
    },
  },
});

// Function to initialize the database
export const initializeDatabase = async () => {
  try {
    await sequelize.authenticate(); // Test database connection
    console.log("Database connected successfully!");
    await sequelize.sync({ alter: true }); // Automatically sync tables
  } catch (error) {
    console.error("Error during database connection:", error);
    process.exit(1);
  }
};
