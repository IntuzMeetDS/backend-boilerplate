import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readdir, stat, mkdir, copyFile, readFile, writeFile } from 'fs/promises';
import ejs from 'ejs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function getTemplatesPath() {
  return join(__dirname, '..', 'templates');
}

export async function copyDir(src, dest) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      // Skip .ejs files (they should be processed with generateFromTemplate)
      if (!entry.name.endsWith('.ejs')) {
        await copyFile(srcPath, destPath);
      }
    }
  }
}

export async function generateFromTemplate(templateName, context, outputName) {
  const templatesPath = getTemplatesPath();
  const templatePath = join(templatesPath, templateName);
  const outputPath = join(context.projectPath, outputName || templateName.replace('.ejs', ''));

  const templateContent = await readFile(templatePath, 'utf-8');
  const rendered = ejs.render(templateContent, {
    projectName: context.projectName,
    description: context.description,
    author: context.author,
    database: context.options.database,
    redis: context.options.redis
  });

  await writeFile(outputPath, rendered);
}

export async function pathExists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}
