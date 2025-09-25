import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    host: true,
    allowedHosts: ['.ngrok-free.dev', '.loca.lt', 'pilketossmarid-production.up.railway.app']
  }
})
