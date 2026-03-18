import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(() => {
  return {
    plugins: [svelte(), tailwindcss()],
    resolve: {
      alias: {
        '@root': path.resolve('./'),
        '@src': path.resolve('./src'),
        '@components': path.resolve('./src/components'),
        '@panels': path.resolve('./src/panels'),
        '@services': path.resolve('./src/services'),
        '@stores': path.resolve('./src/stores')
      }
    },
    base: '/app/', // Must match the path in workbench/nginx.conf and workbench/config.js
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      allowedHosts: true,
      watch: {
        usePolling: true
      },
      proxy: {
        '/api': {
          target: `http://localhost:3000`,
          changeOrigin: true
        }
      }
    }
  }
})
