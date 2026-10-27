import app from './app.js';
import { connectDB } from './config/database.js';
import { config } from './config/env.js';
import { SeatService } from './services/seatService.js';

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(config.port, () => {
      console.log(`===============================================`);
      console.log(`🎬 CineReserve API Server Running`);
      console.log(`🚀 Port: ${config.port}`);
      console.log(`🌐 Mode: ${config.env}`);
      console.log(`🔗 Health Check: http://localhost:${config.port}/api/v1/health`);
      console.log(`===============================================`);
    });

    // Schedule periodic background release of expired seat holds every 60 seconds
    const holdCleanerInterval = setInterval(async () => {
      try {
        const releasedCount = await SeatService.releaseExpiredHolds();
        if (releasedCount > 0) {
          console.log(`[Seat Sweeper] Automatically released ${releasedCount} expired seat hold(s).`);
        }
      } catch (err) {
        console.error('[Seat Sweeper Error]', err.message);
      }
    }, 60000);

    const shutdown = async (signal) => {
      console.log(`\n[Shutdown] Received ${signal}. Closing server gracefully...`);
      clearInterval(holdCleanerInterval);
      if (server) {
        server.close(() => {
          console.log('[Shutdown] HTTP server closed.');
          process.exit(0);
        });
      }
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error(`[Startup Error] ${error.message}`);
    process.exit(1);
  }
};

startServer();
