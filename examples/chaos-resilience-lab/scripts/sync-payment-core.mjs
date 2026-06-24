import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'lib/payment.js');
const dest = path.join(root, 'public/payment-core.js');

fs.copyFileSync(src, dest);
console.log('Synced lib/payment.js → public/payment-core.js');
