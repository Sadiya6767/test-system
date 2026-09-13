const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Ensure DATABASE_URL is set for Prisma build
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'file:./dev.db';
}

console.log('--- Starting Production Build ---');
const dbUrl = process.env.DATABASE_URL;
console.log('Database URL configured:', dbUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://$1:****@'));

// Dynamically adjust prisma provider to match DATABASE_URL
const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
if (fs.existsSync(schemaPath)) {
  let schema = fs.readFileSync(schemaPath, 'utf8');
  const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');
  if (isPostgres) {
    console.log('Configuring Prisma schema for PostgreSQL database...');
    schema = schema.replace(/provider\s*=\s*"sqlite"/g, 'provider = "postgresql"');
  } else {
    console.log('Configuring Prisma schema for SQLite database...');
    schema = schema.replace(/provider\s*=\s*"postgresql"/g, 'provider = "sqlite"');
  }
  fs.writeFileSync(schemaPath, schema, 'utf8');
}

try {
  console.log('1. Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

  console.log('2. Pushing Prisma schema to database...');
  execSync('npx prisma db push', { stdio: 'inherit', env: process.env });

  console.log('3. Seeding admin user & assessment questions...');
  execSync('node prisma/seed.js', { stdio: 'inherit', env: process.env });

  console.log('--- Build completed successfully! ---');
} catch (error) {
  console.error('Build execution failed:', error.message);
  process.exit(1);
}