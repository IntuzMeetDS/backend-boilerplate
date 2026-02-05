import { mkdir } from 'fs/promises';
import { execa } from 'execa';
import chalk from 'chalk';
import { pathExists } from './utils.js';

export async function initProject(context) {
  const { projectPath, projectName } = context;

  // Check if directory already exists
  if (await pathExists(projectPath)) {
    throw new Error(`Directory "${projectName}" already exists. Please choose a different name.`);
  }

  console.log(chalk.blue('📦 Creating project directory...'));
  await mkdir(projectPath, { recursive: true });

  console.log(chalk.blue('📦 Initializing git repository...'));
  await execa('git', ['init'], { cwd: projectPath });
}
