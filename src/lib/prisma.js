import "server-only";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis;

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

/**
 * Garder l'instance prisma dans globalThis, car nextjs en dev recharge plusieurs fois 
 * les modules (hot reload), donc plein de co prisma
 */
if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}