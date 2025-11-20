import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
export const connectDatabase = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems';
        await mongoose.connect(mongoUri);
        logger.info('✅ MongoDB connected successfully');
    }
    catch (error) {
        logger.error('❌ MongoDB connection failed', error);
        process.exit(1);
    }
};
export const disconnectDatabase = async () => {
    try {
        await mongoose.disconnect();
        logger.info('✅ MongoDB disconnected');
    }
    catch (error) {
        logger.error('❌ MongoDB disconnection failed', error);
    }
};
//# sourceMappingURL=database.js.map