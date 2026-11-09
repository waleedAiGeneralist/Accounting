// Prisma CLI config. DATABASE_URL is required for migrate/runtime.
// Generate uses a credential-free local placeholder when unset.
import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl =
  process.env.DATABASE_URL?.trim() ||
  "postgresql://127.0.0.1:5432/prisma_generate_placeholder";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  engine: "classic",
  datasource: {
    url: databaseUrl,
  },
});
