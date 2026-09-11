const { execSync } = require('child_process');

// Ensure DATABASE_URL is set for Prisma build
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

console.log('--- Starting Production Build ---');
console.log('Database URL configured:', process.env.DATABASE_URL);

try {
  console.log('1. Pushing Prisma schema to SQLite database...');
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit', env: process.env });

  console.log('2. Seeding admin user & 10 assessment questions...');
  execSync('node prisma/seed.js', { stdio: 'inherit', env: process.env });

  console.log('--- Build completed successfully! ---');
} catch (error) {
  console.error('Build execution failed:', error.message);
  process.exit(1);
}