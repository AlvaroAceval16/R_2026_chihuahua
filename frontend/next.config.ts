import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Permite que el dev server atienda recursos (HMR) desde la red local
  // (celular que escanea el chip NFC). Ajustar si cambia la IP DHCP de la PC.
  allowedDevOrigins: ["192.168.99.154", "192.168.56.1"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
