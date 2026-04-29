import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '../..');

export default defineConfig({
  plugins: [react()],
  define: {
    __AGENTOS_VERSION__: JSON.stringify(process.env.npm_package_version ?? '0.1.0')
  },
  resolve: {
    alias: {
      '@agentos/shared-types': path.resolve(repoRoot, 'packages/shared-types/src/index.ts'),
      '@agentos/policy-engine': path.resolve(repoRoot, 'packages/policy-engine/src/index.ts'),
      '@agentos/task-engine': path.resolve(repoRoot, 'packages/task-engine/src/index.ts')
    }
  },
  server: {
    port: 5173,
    strictPort: true
  }
});
