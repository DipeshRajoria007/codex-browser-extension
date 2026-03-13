import { build } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { cpSync, existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

async function runBuild() {
  console.log('[1/4] Building HTML pages (sidepanel, popup, options)...');
  await build({ root, configFile: resolve(root, 'vite.config.ts') });

  console.log('[2/4] Building content script...');
  await build({ root, configFile: resolve(root, 'vite.config.content.ts') });

  console.log('[3/4] Building service worker...');
  await build({ root, configFile: resolve(root, 'vite.config.background.ts') });

  console.log('[4/4] Copying public assets...');
  const publicDir = resolve(root, 'public');
  const distDir = resolve(root, 'dist');
  if (existsSync(publicDir)) {
    cpSync(publicDir, distDir, { recursive: true });
  }

  console.log('Build complete! Load dist/ in chrome://extensions');
}

runBuild().catch((err) => {
  console.error('Build failed:', err);
  process.exit(1);
});
