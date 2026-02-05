import { execa } from 'execa';
import chalk from 'chalk';

export async function installDevDeps(context) {
  console.log(chalk.blue('📦 Installing dev dependencies...'));
  
  // Always install: TypeScript + Sequelize CLI
  const devDeps = [
    'typescript',
    'tsx',
    '@types/node',
    'pino-pretty',
    'sequelize-cli'
  ];
  
  await execa('npm', ['install', '-D', ...devDeps], {
    cwd: context.projectPath,
    stdio: 'inherit'
  });
}
