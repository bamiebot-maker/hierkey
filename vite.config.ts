import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const getVendorChunk = (id: string): string | undefined => {
  const normalizedId = id.replace(/\\/g, "/");

  if (!normalizedId.includes("/node_modules/")) return undefined;
  if (normalizedId.includes("/node_modules/ethers/")) return "vendor-ethers";
  if (
    normalizedId.includes("/node_modules/@near-wallet-selector/") ||
    normalizedId.includes("/node_modules/near-api-js/") ||
    normalizedId.includes("/node_modules/@near-js/")
  ) {
    return "vendor-near";
  }
  if (
    normalizedId.includes("/node_modules/@react-aria/") ||
    normalizedId.includes("/node_modules/@react-stately/") ||
    normalizedId.includes("/node_modules/@react-types/") ||
    normalizedId.includes("/node_modules/@internationalized/")
  ) {
    return "vendor-aria";
  }
  if (normalizedId.includes("/node_modules/framer-motion/")) {
    return "vendor-motion";
  }
  if (
    normalizedId.includes("/node_modules/@heroui/") ||
    normalizedId.includes("/node_modules/tailwind-variants/")
  ) {
    return "vendor-heroui";
  }
  if (
    normalizedId.includes("/node_modules/react/") ||
    normalizedId.includes("/node_modules/react-dom/") ||
    normalizedId.includes("/node_modules/react-router-dom/")
  ) {
    return "vendor-react";
  }

  return undefined;
};

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    global: "globalThis",
  },
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      "/api/near-rpc": {
        target: "https://rpc.testnet.near.org",
        changeOrigin: true,
        secure: false,
        rewrite: () => "",
      },
    },
  },
  build: {
    outDir: "dist",
    sourcemap: false,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      input: {
        main: 'index.html',
        'service-worker': 'src/sw.ts',
      },
      output: {
        manualChunks: getVendorChunk,
        entryFileNames: (chunkInfo) =>
          chunkInfo.name === 'service-worker' ? 'sw.js' : 'assets/[name]-[hash].js',
      },
    },
  },
});
