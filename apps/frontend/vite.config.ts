/// <reference types='vitest' />
import { nxCopyAssetsPlugin } from "@nx/vite/plugins/nx-copy-assets.plugin"
import { nxViteTsPaths } from "@nx/vite/plugins/nx-tsconfig-paths.plugin"
import react from "@vitejs/plugin-react-swc"
import path from "path"
import { defineConfig } from "vite"

export default defineConfig({
  root: __dirname,
  cacheDir: "../../node_modules/.vite/apps/frontend",

  server: {
    port: 4200,
    host: "localhost",
  },

  preview: {
    port: 4300,
    host: "localhost",
  },

  plugins: [react(), nxViteTsPaths(), nxCopyAssetsPlugin(["*.md"])],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../../dist/apps/frontend",
    emptyOutDir: true,
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
})
