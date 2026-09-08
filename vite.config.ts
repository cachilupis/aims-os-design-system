import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Vercel serves from the domain root; GitHub Pages serves from /aims-os-design-system/.
  // `npm run deploy` sets GH_PAGES=true so only that build gets the subpath base.
  base: process.env.GH_PAGES ? "/aims-os-design-system/" : "/",
  plugins: [react()],
  // Honour PORT so several dev servers can run at once (one per Claude Code
  // chat, one per worktree). Unset → Vite's own default, so running
  // `npm run dev` by hand behaves exactly as before.
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
