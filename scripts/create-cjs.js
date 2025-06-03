import { readFileSync, writeFileSync } from 'fs'

const content = readFileSync('dist/module.js', 'utf8')

const cjsContent = content
  .replace(/import\s+{\s*([^}]+)\s*}\s+from\s+['"]([^'"]+)['"]/g, 'const { $1 } = require("$2")')
  .replace(/export default\s+/, 'module.exports = ')

writeFileSync('dist/module.cjs', cjsContent)
console.log('✅ CJS version created')
