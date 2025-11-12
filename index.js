import express from 'express';
import {authenticationMiddleware} from './middlewares/auth.middleware.js';
import { userRouter } from './routes/user.routes.js';
import { urlRouter } from './routes/url.routes.js';
import { errorHandler } from './middlewares/errors.middleware.js';
import { connectDB, disconnectDB, db } from './db/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req, res) => {
  return res.json({ message: 'Server is up and running....' });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await db.execute('SELECT 1');
    return res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return res.status(503).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

app.use('/api/users', userRouter);
app.use('/api/urls', urlRouter);

// Error handler must be last
app.use(errorHandler);

// Function to start the server
const startServer = async () => {
  try {
    // Test database connection before starting server
    await connectDB();
    
    const server = app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
    });

    // Graceful shutdown handlers
    const gracefulShutdown = async (signal) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);
      
      server.close(async () => {
        console.log('HTTP server closed');
        
        try {
          await disconnectDB();
          console.log('Graceful shutdown completed');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Listen for termination signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Please check your database connection and try again.');
    process.exit(1);
  }
};

// Start the server
startServer();