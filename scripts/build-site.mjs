import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const origin = 'https://www.arisgomez.com';
const output = 'dist';
const languages = [
  ['en', 'English'], ['fr', 'Français'], ['de', 'Deutsch'], ['it', 'Italiano'],
  ['pt', 'Português'], ['gl', 'Galego'], ['ca', 'Català'], ['eu', 'Euskara'],
  ['ar', 'العربية'], ['zh-CN', '简体中文'], ['ja', '日本語']
];

function menu(file) {
  const url = new URL(file === 'index.html' ? '/' : file, origin);
  const links = languages.map(([code, label]) => {
    const query = new URLSearchParams({ sl: 'es', tl: code, u: url.href });
    return `<a lang="${code}" hreflang="${code}" href="https://translate.google.com/translate?${query.toString().replaceAll('&', '&amp;')}">${label}</a>`;
  });
  const all = new URLSearchParams({ sl: 'es', tl: 'en', op: 'websites', url: url.href });
  return `<details class="ag-idioma" translate="no"><summary aria-label="Elegir idioma / Choose language">Idioma / Language</summary><div class="ag-opciones"><span lang="es">Español · Original</span>${links.join('')}<a class="ag-todos" href="https://translate.google.com/?${all.toString().replaceAll('&', '&amp;')}">Todos los idiomas · Google Translate ↗</a></div></details>`;
}

async function build(directory = '.') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['dist','scripts','node_modules','vercel.json'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    const target = path.join(output, file);
    if (entry.isDirectory()) {
      await mkdir(target, { recursive: true });
      await build(file);
    } else if (/\.html$/i.test(file)) {
      const html = await readFile(file, 'utf8');
      const selector = menu(file);
      const anchor = /<\/nav>/i.test(html) ? /<\/nav>/i : /<body\b[^>]*>/i;
      const page = html.replace(/<\/head>/i, '<link rel="stylesheet" href="/idiomas.css"></head>')
        .replace(anchor, match => match + selector);
      if (!page.includes(selector)) throw new Error(`Falta el selector en ${file}`);
      await writeFile(target, page);
    } else {
      await cp(file, target);
    }
  }
}
await mkdir(output, { recursive: true });
await build();
