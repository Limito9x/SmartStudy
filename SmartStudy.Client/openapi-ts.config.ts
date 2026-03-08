import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
  input: "http://localhost:5037/openapi/v1.json",
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
