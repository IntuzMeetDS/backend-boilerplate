import { input } from '@inquirer/prompts';
import chalk from 'chalk';

const PROJECT_NAME_REGEX = /^[a-z][a-z0-9-_]*$/;

export async function promptProjectName(context) {
  let isValid = false;
  let projectName = '';

  while (!isValid) {
    projectName = await input({
      message: 'Project name:',
      default: 'my-backend-api',
      validate: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Project name is required';
        }

        const trimmed = value.trim();

        if (trimmed.length < 3) {
          return 'Project name must be at least 3 characters';
        }

        if (trimmed.length > 50) {
          return 'Project name must be less than 50 characters';
        }

        if (!PROJECT_NAME_REGEX.test(trimmed)) {
          return 'Project name must start with a letter and contain only lowercase letters, numbers, hyphens, and underscores';
        }

        return true;
      }
    });

    projectName = projectName.trim();
    isValid = true;
  }

  context.projectName = projectName;
  context.projectPath = process.cwd() + '/' + projectName;

  // Prompt for description
  const description = await input({
    message: 'Project description:',
    default: 'A production-ready backend API'
  });
  context.description = description.trim();

  // Prompt for author
  const author = await input({
    message: 'Author name:',
    default: ''
  });
  context.author = author.trim();
}
