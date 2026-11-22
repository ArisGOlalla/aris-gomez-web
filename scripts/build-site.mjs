import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const output = 'dist';

// Hide the Blog tab only in navigation; preserve blog.html and its articles.
function withoutBlogNavigation(html) {
  return html.replace(/<nav\b[^>]*>[\s\S]*?<\/nav>/gi, (nav) =>
    nav
      .replace(/<li\b[^>]*>\s*<a\b[^>]*href\s*=\s*["'](?:\.\/|\/)?blog\.html(?:[?#][^"']*)?["'][^>]*>[\s\S]*?<\/a>\s*<\/li>/gi, '')
      .replace(/<a\b[^>]*href\s*=\s*["'](?:\.\/|\/)?blog\.html(?:[?#][^"']*)?["'][^>]*>[\s\S]*?<\/a>/gi, '')
  );
}

async function build(directory = '.') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['dist', 'scripts', 'node_modules', 'vercel.json'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    const target = path.join(output, file);
    if (entry.isDirectory()) {
      await mkdir(target, { recursive: true });
      await build(file);
    } else if (/\.html$/i.test(entry.name)) {
      const html = await readFile(file, 'utf8');
      await writeFile(target, withoutBlogNavigation(html));
    } else {
      await cp(file, target);
    }
  }
}

await mkdir(output, { recursive: true });
await build();
