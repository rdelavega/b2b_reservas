import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite servir recursos del dev server a las pruebas E2E (localhost/127.0.0.1).
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
