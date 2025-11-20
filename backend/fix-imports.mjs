import { readdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function fixImportsInFile(filePath) {
  const content = await readFile(filePath, 'utf-8');
  
  // Fix relative imports to add .js extension
  const fixed = content.replace(
    /from ['"](\.\.[\/\\][^'"]+)['"]/g,
    (match, path) => {
      if (path.endsWith('.js')) return match;
      return `from '${path}.js'`;
    }
  );
  
  if (fixed !== content) {
    await writeFile(filePath, fixed, 'utf-8');
    console.log(`✓ Fixed: ${filePath}`);
    return true;
  }
  return false;
}

async function processDirectory(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let fixedCount = 0;
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      fixedCount += await processDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      if (await fixImportsInFile(fullPath)) {
        fixedCount++;
      }
    }
  }
  
  return fixedCount;
}

const distPath = './dist';
console.log('🔧 Fixing ESM imports in compiled files...');
const count = await processDirectory(distPath);
console.log(`\n✅ Fixed ${count} files`);
