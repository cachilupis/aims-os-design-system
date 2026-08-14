import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Vercel serves from the domain root; GitHub Pages serves from /aims-os-design-system/.
  // `npm run deploy` sets GH_PAGES=true so only that build gets the subpath base.
  base: process.env.GH_PAGES ? "/aims-os-design-system/" : "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
