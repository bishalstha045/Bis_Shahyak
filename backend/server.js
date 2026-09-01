import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { ragService } from './src/services/rag.service.js';

async function bootstrap() {
  console.log('====================================================');
  console.log('🏛️  BIS Sahayak V2 — Node.js Express Backend Service');
  console.log('====================================================');

  // Connect to Database
  await connectDB();

  // Test RAG Engine Connection
  const ragStatus = await ragService.checkHealth();
  console.log(`🧠 RAG Engine Status: ${ragStatus.status === 'healthy' ? 'Connected & Healthy (Port 8000)' : 'Running Standalone Mode'}`);

  const server = app.listen(env.PORT, () => {
    console.log(`🚀 Server running on port ${env.PORT}`);
    console.log(`🔗 API Base: http://localhost:${env.PORT}/api`);
    console.log(`🩺 Health Check: http://localhost:${env.PORT}/health`);
    console.log('====================================================\n');
  });

  // Graceful termination
  const shutdown = () => {
    console.log('\nStopping BIS Sahayak backend server...');
    server.close(() => {
      console.log('Server gracefully stopped.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

bootstrap().catch(err => {
  console.error("Failed to start backend server:", err);
  process.exit(1);
});
