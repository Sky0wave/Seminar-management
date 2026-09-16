import type { NextConfig } from "next";

process.env.DATABASE_URL = process.env.DATABASE_URL || "file:./dev.db";
process.env.NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET || "default-secret-key-change-in-prod";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
