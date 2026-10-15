import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve, relative, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Script } from 'node:vm';

// Generated output only; index.html and its modules remain the source of truth.
const root = fileURLToPath(new URL('..', import.meta.url));
const output = resolve(process.argv[2] || resolve(root, 'dist/Forbidden-Deck-preview.html'));
if(output === resolve(root, 'index.html')) throw new Error('The generated preview must not replace index.html.');
const images = new Map();
const styles = new Map();
const scripts = new Map();
const mime = { '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

function sourcePath(path) {
  const file = resolve(root, path);
  if(relative(root, file).startsWith('..')) throw new Error(`Asset outside checkout: ${path}`);
  return file;
}

async function image(path) {
  const normalized = relative(root, sourcePath(path));
  if(!images.has(normalized)) {
    const type = mime[extname(normalized)];
    if(!type) throw new Error(`Unsupported image type: ${path}`);
    images.set(normalized, `data:${type};base64,${(await readFile(sourcePath(path))).toString('base64')}`);
  }
  return images.get(normalized);
}

async function replaceAsync(text, expression, replace) {
  const matches = [...text.matchAll(expression)];
  for(const match of matches.reverse()) {
    const replacement = await replace(match);
    text = text.slice(0, match.index) + replacement + text.slice(match.index + match[0].length);
  }
  return text;
}

async function css(path) {
  if(styles.has(path)) return styles.get(path);
  let source = await readFile(sourcePath(path), 'utf8');
  source = await replaceAsync(source, /url\(\s*['"]?([^'"\s)]+)['"]?\s*\)/g, async ([, url]) => {
    if(url.startsWith('data:')) return `url("${url}")`;
    return `url("${await image(relative(root, resolve(dirname(sourcePath(path)), url)))}")`;
  });
  styles.set(path, source);
  return source;
}

async function js(path) {
  if(scripts.has(path)) return scripts.get(path);
  let source = await readFile(sourcePath(path), 'utf8');
  // Modules append their styles dynamically. Convert those links to inline styles.
  source = await replaceAsync(source, /(\w+)\.href\s*=\s*(['"])(css\/[^'"]+\.css)\2/g, async ([, name, , file]) => {
    return `${name}.textContent=${JSON.stringify(await css(file))}`;
  });
  source = source.replace(/document\.createElement\((['"])link\1\)/g, "document.createElement('style')");
  // Preserve lazy module initialization without requesting a sibling JS file.
  source = await replaceAsync(source, /(\w+)\.src\s*=\s*(['"])(js\/[^'"]+\.js)\2/g, async ([, name, , file]) => {
    return `${name}.textContent=${JSON.stringify(await js(file))}`;
  });
  source = source.replace(/document\.body\.appendChild\((\w+Module)\);/g, (statement) =>
    `document.addEventListener('DOMContentLoaded',()=>{${statement}},{once:true});`);
  source = await replaceAsync(source, /src="(assets\/[^"\n]+)"/g, async ([, path]) => {
    if(path.includes('${')) {
      // A speaker portrait is selected in the dialogue's template literal.
      for(const portrait of ['assets/portraits/kael.webp', 'assets/portraits/lyra.webp']) await image(portrait);
      return 'src="${globalThis.ForbiddenDeckPreviewAssets[`' + path + '`]}"';
    }
    return `src="${await image(path)}"`;
  });
  new Script(source, { filename: path });
  scripts.set(path, source);
  return source;
}

function scriptTag(source) {
  return `<script>${source.replace(/<\/script/gi, '<\\/script')}</script>`;
}

let html = await readFile(resolve(root, 'index.html'), 'utf8');
html = await replaceAsync(html, /<link rel="stylesheet" href="([^"]+)">/g,
  async ([, path]) => `<style>${await css(path)}</style>`);
html = await replaceAsync(html, /src="(assets\/[^"\n]+)"/g,
  async ([, path]) => `src="${await image(path)}"`);
html = await replaceAsync(html, /<script src="([^"]+)"><\/script>/g,
  async ([, path]) => scriptTag(await js(path)));

const bootstrap = `
globalThis.ForbiddenDeckPreviewAssets=Object.freeze(${JSON.stringify(Object.fromEntries(images))});
try {
  const probe='forbidden_deck_preview_probe_'+Date.now()+'_'+performance.now();
  localStorage.setItem(probe,'1'); localStorage.removeItem(probe);
} catch {
  const data=new Map();
  const memory={getItem:key=>data.get(String(key))??null,setItem:(key,value)=>data.set(String(key),String(value)),removeItem:key=>data.delete(String(key)),clear:()=>data.clear(),key:index=>[...data.keys()][index]??null,get length(){return data.size}};
  Object.defineProperty(window,'localStorage',{value:memory,configurable:true});
  document.addEventListener('DOMContentLoaded',()=>{
    const note=document.createElement('p');note.id='previewStorageNotice';
    note.style.cssText='font-size:12px;line-height:1.5;color:#e7c58f';
    note.textContent='W tym podglądzie zapis działa do odświeżenia. Pobierz plik HTML i otwórz go w przeglądarce, aby zachowywać postęp.';
    document.querySelector('#startScreen .start-foot')?.before(note);
  },{once:true});
}
`;
html = html.replace('</head>', scriptTag(bootstrap) + '\n</head>');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, html);
console.log(`Built ${output} (${Buffer.byteLength(html)} bytes; ${images.size} images, ${styles.size} stylesheets, ${scripts.size} modules embedded).`);
