import 'dotenv/config';
import app from './app';
import prisma from './lib/prisma';

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

async function main() {
  // Test DB connection
  await prisma.$connect();
  console.log('✅ Connected to PostgreSQL (Neon)');

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📖 API:          http://localhost:${PORT}/api`);
    console.log(`❤️  Health:      http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment:  ${process.env.NODE_ENV ?? 'development'}`);
  });
}

main().catch(async (err) => {
  console.error('❌ Failed to start server:', err);
  await prisma.$disconnect();
  process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('\n🛑 Server stopped.');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
