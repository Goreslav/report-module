import { readFileSync, writeFileSync } from 'node:fs';

const content = readFileSync('dist/module.js', 'utf8');

const cjsContent = content
  .replace(/import \{ ([\w\s,]+) \} from ['"]([^'"]+)['"]/g, 'const { $1 } = require("$2")')
  .replace(/export default /g, 'module.exports = ');

writeFileSync('dist/module.cjs', cjsContent);
console.log('✅ CJS version created');
