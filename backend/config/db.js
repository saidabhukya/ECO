const mongoose = require('mongoose');

let mongod = null;

const connectDB = async () => {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri || uri === 'auto' || uri === 'memory') {
      try {
        const { MongoMemoryServer } = require('mongodb-memory-server');
        console.log('[Database] Initializing embedded MongoDB engine...');
        mongod = await MongoMemoryServer.create({
          instance: {
            dbName: 'eco_track'
          }
        });
        uri = mongod.getUri();
        console.log('[Database] Embedded MongoDB initialized at:', uri);
      } catch (err) {
        console.warn('[Database] mongodb-memory-server direct init note:', err.message);
        uri = 'mongodb://127.0.0.1:27017/eco_track';
      }
    }

    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log(`[Database] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // If external URI failed and we haven't tried memory server yet, attempt fallback
    if (!mongod) {
      try {
        console.log('[Database] Attempting fallback to embedded MongoDB engine...');
        const { MongoMemoryServer } = require('mongodb-memory-server');
        mongod = await MongoMemoryServer.create();
        const memUri = mongod.getUri();
        const conn = await mongoose.connect(memUri);
        console.log(`[Database] Embedded MongoDB connected fallback: ${memUri}`);
        return conn;
      } catch (fallbackErr) {
        console.error(`[Database Critical Error] Failed to initialize embedded MongoDB: ${fallbackErr.message}`);
        process.exit(1);
      }
    } else {
      process.exit(1);
    }
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongod) {
      await mongod.stop();
    }
  } catch (err) {
    console.error('[Database Disconnect Error]', err);
  }
};

module.exports = { connectDB, disconnectDB };
