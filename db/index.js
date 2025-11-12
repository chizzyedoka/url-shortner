import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error if connection takes longer than 10 seconds
});

// Handle pool errors
pool.on('error', (err) => {
    console.error('Unexpected error on idle database client', err);
    process.exit(-1);
});

// Create drizzle instance with the pool
export const db = drizzle(pool);

// Function to test database connection
export const connectDB = async () => {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        await client.query('SELECT NOW()');
        client.release();
        return true;
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        throw error;
    }
};

// Function to close database connection gracefully
export const disconnectDB = async () => {
    try {
        await pool.end();
        console.log('Database connection closed');
    } catch (error) {
        console.error('Error closing database connection:', error.message);
        throw error;
    }
};

export default db;