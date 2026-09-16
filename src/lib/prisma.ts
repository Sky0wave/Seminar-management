import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

import os from 'os';

let databaseUrl = process.env.DATABASE_URL;

const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

if (isServerless && (!databaseUrl || databaseUrl.startsWith('file:'))) {
  // If running in serverless environment (e.g. Vercel), copy SQLite db to writable tmp directory
  const tmpDbPath = path.join(os.tmpdir(), 'dev.db');
  const bundledDbPath = path.join(process.cwd(), 'prisma', 'dev.db');

  try {
    if (!fs.existsSync(tmpDbPath) && fs.existsSync(bundledDbPath)) {
      fs.copyFileSync(bundledDbPath, tmpDbPath);
    }
  } catch (e) {
    console.error('Error copying sqlite db to tmp:', e);
  }
  databaseUrl = `file:${tmpDbPath}`;
  process.env.DATABASE_URL = databaseUrl;
} else if (!databaseUrl) {
  databaseUrl = 'file:./dev.db';
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
