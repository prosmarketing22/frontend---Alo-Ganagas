// Renombra dist-cliente/index-cliente.html -> dist-cliente/index.html
// Capacitor exige que el archivo principal se llame index.html dentro de webDir.
import { renameSync, existsSync, unlinkSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist-cliente');
const src = resolve(distDir, 'index-cliente.html');
const dst = resolve(distDir, 'index.html');

if (!existsSync(src)) {
  console.error('[rename-index-cliente] No existe', src);
  process.exit(1);
}

if (existsSync(dst)) unlinkSync(dst);
renameSync(src, dst);
console.log('[rename-index-cliente] OK ->', dst);
