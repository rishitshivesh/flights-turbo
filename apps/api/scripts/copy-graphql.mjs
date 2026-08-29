import { cp, mkdir } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { readdir } from 'node:fs/promises';

const srcRoot = join(process.cwd(), 'src');
const distRoot = join(process.cwd(), 'dist');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);

    if (entry.isDirectory()) {
      await walk(fullPath);
      continue;
    }

    if (!entry.name.endsWith('.graphql')) continue;

    const target = join(distRoot, relative(srcRoot, fullPath));
    await mkdir(dirname(target), { recursive: true });
    await cp(fullPath, target);
  }
}

await walk(srcRoot);
