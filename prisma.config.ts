import path from "node:path";
import { defineConfig } from "prisma/config";
import "dotenv/config";

export default defineConfig({
  // path to your schema
  schema: path.join("prisma", "schema.prisma"),

  // migrations config
  migrations: {
    path: path.join("prisma", "migrations"),
  },

  // Provide the database url via env helper
  datasource: {
    // wraps process.env loading and is used by prisma CLI
    url: process.env.DATABASE_URL!,
  },

  // optional: seed command if you want (example)
  // migrations: { seed: 'tsx prisma/seed.ts' }
});
