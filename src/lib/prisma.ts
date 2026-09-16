import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl || databaseUrl.startsWith('file:')) {
  // If running in production (Vercel Serverless), copy SQLite db to /tmp so it is fully writable
  if (process.env.NODE_ENV === 'production') {
    const tmpDbPath = '/tmp/dev.db';
    const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    try {
      if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
        fs.copyFileSync(bundledDbPath, tmpDbPath);
      }
    } catch (e) {
      console.error('Error copying sqlite db to /tmp:', e);
    }
    databaseUrl = `file:${tmpDbPath}`;
    process.env.DATABASE_URL = databaseUrl;
  } else {
    databaseUrl = process.env.DATABASE_URL || 'file:./dev.db';
  }
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
