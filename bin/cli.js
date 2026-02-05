#!/usr/bin/env node

const MIN_NODE_MAJOR = 20;

// Check Node.js version
const currentNodeVersion = process.versions.node;
const major = parseInt(currentNodeVersion.split('.')[0], 10);

if (major < MIN_NODE_MAJOR) {
  console.error(
    `\x1b[31mError: Node.js ${MIN_NODE_MAJOR} or higher is required.\x1b[0m\n` +
    `You are currently running Node.js ${currentNodeVersion}.\n` +
    `Please upgrade your Node.js version.`
  );
  process.exit(1);
}

// Check if user provided project name as argument (not recommended, but handle it)
const args = process.argv.slice(2);
if (args.length > 0) {
  console.log('\x1b[33m⚠️  Note: Project name should be provided through the interactive prompt.\x1b[0m');
  console.log('\x1b[33m   Run without arguments: npx create-backend-boilerplate\x1b[0m\n');
}

// Import and run main function
import('../lib/index.js')
  .then(({ main }) => main())
  .catch((error) => {
    console.error('\x1b[31mError:\x1b[0m', error.message);
    process.exit(1);
  });
