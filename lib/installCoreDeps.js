import { execa } from 'execa';
import chalk from 'chalk';

export async function installCoreDeps(context) {
  console.log(chalk.blue('📦 Installing core dependencies (Fastify, Sequelize, PostgreSQL)...'));
  
  // Always install: Fastify + Sequelize + PostgreSQL
  const deps = ['fastify', 'dotenv', 'sequelize', 'pg', 'pg-hstore'];
  
  if (context.options.redis) {
    deps.push('ioredis');
  }
  
  await execa('npm', ['install', ...deps], {
    cwd: context.projectPath,
    stdio: 'inherit'
  });
}
