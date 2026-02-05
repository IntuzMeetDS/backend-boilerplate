import { join } from 'path';
import { copyFile } from 'fs/promises';
import chalk from 'chalk';
import { getTemplatesPath, copyDir, generateFromTemplate } from './utils.js';

export async function scaffoldStructure(context) {
  console.log(chalk.blue('📦 Scaffolding project structure...'));
  
  const { projectPath, options } = context;
  const templates = getTemplatesPath();
  
  // Always copy base structure
  await copyDir(join(templates, 'src/routes'), join(projectPath, 'src/routes'));
  await copyDir(join(templates, 'src/schemas'), join(projectPath, 'src/schemas'));
  await copyDir(join(templates, 'src/controllers'), join(projectPath, 'src/controllers'));
  await copyDir(join(templates, 'src/middlewares'), join(projectPath, 'src/middlewares'));
  await copyDir(join(templates, 'src/lib'), join(projectPath, 'src/lib'));
  await copyDir(join(templates, 'src/assets'), join(projectPath, 'src/assets'));
  
  // Always copy Sequelize database structure
  await copyDir(join(templates, 'src/db'), join(projectPath, 'src/db'));
  
  // Always copy services folder (for third-party integrations like Stripe, etc.)
  await copyDir(join(templates, 'src/services'), join(projectPath, 'src/services'));
  
  // Copy server files
  await copyFile(join(templates, 'src/server.ts'), join(projectPath, 'src/server.ts'));
  await copyFile(join(templates, 'src/start.ts'), join(projectPath, 'src/start.ts'));
  
  // Conditional: Generate Redis service if enabled
  if (options.redis) {
    await generateFromTemplate('src/services/redis.service.ts.ejs', context, 'src/services/redis.service.ts');
  }
  
  // Copy config files
  await copyFile(join(templates, '.gitignore'), join(projectPath, '.gitignore'));
  await copyFile(join(templates, '.sequelizerc'), join(projectPath, '.sequelizerc'));
  await copyFile(join(templates, 'tsconfig.json'), join(projectPath, 'tsconfig.json'));
  
  // Generate .env.example from template
  await generateFromTemplate('.env.example.ejs', context, '.env.example');
  
  // Copy documentation files
  await copyFile(join(templates, 'QUICKSTART.md'), join(projectPath, 'QUICKSTART.md'));
  await copyFile(join(templates, 'STRUCTURE.md'), join(projectPath, 'STRUCTURE.md'));
  
  // Generate package.json from EJS template
  await generateFromTemplate('package.json.ejs', context);
  
  // Generate README from EJS template
  await generateFromTemplate('README.md.ejs', context);
}
