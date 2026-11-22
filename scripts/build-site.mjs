import { cp, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

const output = 'dist';

async function build(directory = '.') {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || ['dist', 'scripts', 'node_modules', 'vercel.json'].includes(entry.name)) continue;
    const file = path.join(directory, entry.name);
    const target = path.join(output, file);
    if (entry.isDirectory()) {
      await mkdir(target, { recursive: true });
      await build(file);
    } else {
      // Copy each page unchanged, without injecting a language selector.
      await cp(file, target);
    }
  }
}

await mkdir(output, { recursive: true });
await build();
