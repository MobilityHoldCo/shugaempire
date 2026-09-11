import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // output: "export" removed — Hostinger runs Next.js as a Node.js server,
  // which supports server-side API routes (needed for Supabase backend).
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

