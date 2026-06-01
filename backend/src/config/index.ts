import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

export const DATABASE_URL = requireEnv("DATABASE_URL");
export const JWT_SECRET = requireEnv("JWT_SECRET");
export const JWT_EXPIRES_IN = process.env["JWT_EXPIRES_IN"] ?? "1d";
export const BCRYPT_SALT_ROUNDS = parseInt(
  process.env["BCRYPT_SALT_ROUNDS"] ?? "10",
  10
);
export const PORT = parseInt(process.env["PORT"] ?? "3000", 10);
export const FRONTEND_URL =
  process.env["FRONTEND_URL"] ?? "http://localhost:5173";
export const NODE_ENV = process.env["NODE_ENV"] ?? "development";
