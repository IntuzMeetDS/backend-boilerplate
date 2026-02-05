import { execa } from 'execa';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

export async function setupQualityGates(context) {
  const { projectPath } = context;
  
  console.log(chalk.blue('📦 Setting up ESLint and Prettier...'));
  
  // Install ESLint and Prettier
  await execa('npm', ['install', '-D', 
    'eslint',
    '@typescript-eslint/parser',
    '@typescript-eslint/eslint-plugin',
    'prettier',
    'eslint-config-prettier',
    'eslint-plugin-prettier'
  ], {
    cwd: projectPath,
    stdio: 'inherit'
  });
  
  // Create .eslintrc.json
  const eslintConfig = {
    parser: '@typescript-eslint/parser',
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier'
    ],
    plugins: ['@typescript-eslint', 'prettier'],
    parserOptions: {
      ecmaVersion: 2022,
      sourceType: 'module'
    },
    env: {
      node: true,
      es2022: true
    },
    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  };
  
  await writeFile(
    join(projectPath, '.eslintrc.json'),
    JSON.stringify(eslintConfig, null, 2)
  );
  
  // Create .prettierrc
  const prettierConfig = {
    semi: true,
    trailingComma: 'es5',
    singleQuote: true,
    printWidth: 100,
    tabWidth: 2,
    useTabs: false
  };
  
  await writeFile(
    join(projectPath, '.prettierrc'),
    JSON.stringify(prettierConfig, null, 2)
  );
  
  // Create .prettierignore
  const prettierIgnore = `node_modules
dist
build
coverage
*.log
.env
.env.*
`;
  
  await writeFile(
    join(projectPath, '.prettierignore'),
    prettierIgnore
  );
  
  console.log(chalk.blue('📦 Setting up Husky git hooks...'));
  
  // Install and setup Husky
  await execa('npm', ['install', '-D', 'husky', 'lint-staged'], {
    cwd: projectPath,
    stdio: 'inherit'
  });
  
  await execa('npx', ['husky', 'init'], {
    cwd: projectPath,
    stdio: 'inherit'
  });
  
  // Create pre-commit hook
  const preCommitHook = `#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
`;
  
  await writeFile(
    join(projectPath, '.husky/pre-commit'),
    preCommitHook
  );
  
  // Add lint-staged configuration to package.json
  // This will be handled by updating the generated package.json
}
