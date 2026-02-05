import chalk from 'chalk';
import { promptProjectName } from './promptProjectName.js';
import { promptOptionalFeatures } from './promptOptionalFeatures.js';
import { initProject } from './initProject.js';
import { installCoreDeps } from './installCoreDeps.js';
import { installDevDeps } from './installDevDeps.js';
import { scaffoldStructure } from './scaffoldStructure.js';
import { setupQualityGates } from './setupQualityGates.js';

export async function main() {
  console.log(chalk.bold.cyan('\n🚀 Create Backend Boilerplate\n'));
  
  const context = {
    projectName: '',
    projectPath: '',
    author: '',
    description: '',
    options: {
      database: 'sequelize', // Fixed: Always Sequelize
      redis: false
    }
  };
  
  try {
    // 1. Prompt for project details (name, author, description)
    await promptProjectName(context);
    
    // 2. Prompt for optional features (Redis only)
    await promptOptionalFeatures(context);
    
    // 3. Create project directory + git init
    await initProject(context);
    
    // 4. Scaffold structure from templates
    await scaffoldStructure(context);
    
    // 5. Install core dependencies (Fastify, Sequelize, pg)
    await installCoreDeps(context);
    
    // 6. Install dev dependencies (TypeScript, tsx, etc.)
    await installDevDeps(context);
    
    // 7. Setup quality gates (ESLint, Prettier, Husky)
    await setupQualityGates(context);
    
    // 8. Success message
    console.log(chalk.bold.green('\n✅ Done! Your backend boilerplate is ready.\n'));
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.white(`  cd ${context.projectName}`));
    console.log(chalk.white('  cp .env.example .env'));
    console.log(chalk.white('  # Configure your database in .env'));
    console.log(chalk.white('  npm run dev\n'));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}
