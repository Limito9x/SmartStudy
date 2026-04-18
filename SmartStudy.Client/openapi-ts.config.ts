import { defineConfig } from "@hey-api/openapi-ts";
import { config } from "dotenv";

config(); // Load .env file

const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:5037";
const API_JSON_URL = `${API_BASE_URL.replace(/\/+$/, "")}/openapi/v1.json`;

export default defineConfig({
  input: API_JSON_URL,
  output: {
    path: "./src/services/api",
    clean: true,
  },
  plugins: [
    "@hey-api/client-axios",
    "@hey-api/sdk",
    "@hey-api/typescript",
    "@tanstack/react-query",
  ],
});
