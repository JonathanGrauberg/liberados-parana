import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// En la compu se usa .env.local (no se sube a GitHub); en Vercel, sus variables de entorno.
config({ path: ".env.local" });
config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DATABASE_URL") },
});
