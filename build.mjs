// 小镇鲜市 · build
//   src/*.js  →  game.js      (joined in file-name order; readable, for debugging)
//             →  game.min.js  (minified with esbuild; this is what index.html loads)
// Run:  npm install   (once)   then   npm run build
// Without esbuild installed it still works: game.min.js is then just an unminified copy.
import fs from 'node:fs';
const dir = new URL('./src/', import.meta.url);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.js')).sort();
const code = files.map(f => fs.readFileSync(new URL(f, dir), 'utf8')).join('');
fs.writeFileSync(new URL('./game.js', import.meta.url), code);
let out = code, how = 'copied (esbuild not installed)';
try {
  const esbuild = await import('esbuild');
  out = (await esbuild.transform(code, { minify: true, target: 'es2017', legalComments: 'none', charset: 'utf8' })).code;
  how = 'minified';
} catch (e) { if (e && e.code !== 'ERR_MODULE_NOT_FOUND') throw e; }
fs.writeFileSync(new URL('./game.min.js', import.meta.url), out);
console.log(`game.js ${(code.length / 1024).toFixed(0)} KB from ${files.length} files → game.min.js ${(out.length / 1024).toFixed(0)} KB (${how})`);
