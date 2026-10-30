import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { apiRouter } from './backend/apiServer';

function spidyBackendPlugin(): Plugin {
  return {
    name: 'spidy-backend-plugin',
    configureServer(server) {
      // 1. Mount API Router for /api endpoints
      server.middlewares.use('/api', (req, res, next) => (apiRouter as any)(req, res, next));

      // 2. Admin clean URL rewrite for /admin, /admin/
      server.middlewares.use((req, res, next) => {
        if (req.url) {
          const cleanUrl = req.url.split('?')[0];
          if (cleanUrl === '/admin' || cleanUrl === '/admin/') {
            req.url = '/admin/index.html' + (req.url.includes('?') ? '?' + req.url.split('?')[1] : '');
          }
        }
        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), spidyBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          admin: path.resolve(__dirname, 'admin/index.html'),
        },
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
