import { defineConfig } from 'vite'
import { resolve } from 'path'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(fileURLToPath(new URL('.', import.meta.url)), 'index.html'),
        play: resolve(fileURLToPath(new URL('.', import.meta.url)), 'play.html')
      }
    },
    copyPublicDir: true
  },
  publicDir: 'public'
}) 