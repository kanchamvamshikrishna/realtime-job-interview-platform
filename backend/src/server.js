import http from 'http';
import app from './app.js';
import { connectDB } from './config/db.js';
import { initSocket } from './sockets/index.js';
import { env } from './config/env.js';

const start = async () => {
  await connectDB();

  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
    console.log(`API docs available at http://localhost:${env.port}/api-docs`);
  });
};

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
