// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import { Pool, PoolClient } from 'pg';

// PostgreSQL connection pool
let pool: Pool | null = null;

// Initialize PostgreSQL connection pool
function getPool(): Pool {
	if (!pool) {
		pool = new Pool({
			host: process.env.KLARA_POSTGRES_HOST || 'localhost',
			port: parseInt(process.env.KLARA_POSTGRES_PORT || '5432', 10),
			database: process.env.KLARA_POSTGRES_DATABASE || 'polkassembly',
			user: process.env.KLARA_POSTGRES_USER || 'postgres',
			password: process.env.KLARA_POSTGRES_PASSWORD || '',
			ssl:
				process.env.KLARA_POSTGRES_SSL === 'false'
					? false
					: {
							rejectUnauthorized: false
						},
			max: 20, // Maximum number of clients in the pool
			idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
			connectionTimeoutMillis: 10000 // Increased timeout for remote connections
		});
	}
	return pool;
}

// Get table name based on environment
function getTableName(): string {
	const env = process.env.KLARA_NODE_ENV || 'development';
	return env === 'production' ? 'klara_qa_prod' : 'klara_qa_dev';
}

// Check if table exists and create if it doesn't
export async function ensureTableExists(): Promise<void> {
	// Skip if PostgreSQL is disabled
	if (process.env.KLARA_DISABLE_POSTGRES === 'true') {
		console.log('PostgreSQL logging disabled via DISABLE_POSTGRES=true');
		return;
	}
	const pool = getPool();
	const tableName = getTableName();

	try {
		const client: PoolClient = await pool.connect();

		try {
			// Check if table exists
			const checkTableQuery = `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `;

			const result = await client.query(checkTableQuery, [tableName]);
			const tableExists = result.rows[0].exists;

			if (!tableExists) {
				console.log(`Creating table: ${tableName}`);

				// Create table with required columns
				const createTableQuery = `
          CREATE TABLE ${tableName} (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            query TEXT NOT NULL,
            response TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'success',
            user_id VARCHAR(255),
            conversation_id VARCHAR(255),
            response_time_ms INTEGER,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
          );
        `;

				await client.query(createTableQuery);

				// Create indexes for better performance
				const createIndexes = [
					`CREATE INDEX idx_${tableName}_timestamp ON ${tableName} (timestamp);`,
					`CREATE INDEX idx_${tableName}_user_id ON ${tableName} (user_id);`,
					`CREATE INDEX idx_${tableName}_conversation_id ON ${tableName} (conversation_id);`,
					`CREATE INDEX idx_${tableName}_status ON ${tableName} (status);`
				];

				await Promise.all(createIndexes.map((indexQuery) => client.query(indexQuery)));

				console.log(`Table ${tableName} created successfully with indexes`);
			} else {
				console.log(`Table ${tableName} already exists`);
			}
		} finally {
			client.release();
		}
	} catch (error) {
		console.error('Error ensuring table exists:', error);
		throw error;
	}
}

// Log query-response pair to PostgreSQL
export async function logQueryResponse(data: {
	query: string;
	response: string;
	status?: string;
	userId?: string;
	conversationId?: string;
	responseTimeMs?: number;
}): Promise<void> {
	// Skip if PostgreSQL is disabled
	if (process.env.KLARA_DISABLE_POSTGRES === 'true') {
		return;
	}
	const pool = getPool();
	const tableName = getTableName();

	try {
		const client: PoolClient = await pool.connect();

		try {
			const insertQuery = `
        INSERT INTO ${tableName} (
          query, 
          response, 
          status, 
          user_id, 
          conversation_id, 
          response_time_ms,
          timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, timestamp;
      `;

			const values = [data.query, data.response, data.status || 'success', data.userId || null, data.conversationId || null, data.responseTimeMs || null, new Date()];

			const result = await client.query(insertQuery, values);
			const insertedRow = result.rows[0];

			console.log(`Logged Q&A to ${tableName} - ID: ${insertedRow.id}, Timestamp: ${insertedRow.timestamp}`);
		} finally {
			client.release();
		}
	} catch (error) {
		console.error('Error logging query-response to PostgreSQL:', error);
		// Don't throw error to avoid breaking the chat flow
		// Just log the error and continue
	}
}

// Get recent query-response logs (for debugging/analytics)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRecentLogs(limit: number = 10): Promise<any[]> {
	const pool = getPool();
	const tableName = getTableName();

	try {
		const client: PoolClient = await pool.connect();

		try {
			const selectQuery = `
        SELECT 
          id,
          timestamp,
          query,
          response,
          status,
          user_id,
          conversation_id,
          response_time_ms,
          created_at
        FROM ${tableName}
        ORDER BY timestamp DESC
        LIMIT $1;
      `;

			const result = await client.query(selectQuery, [limit]);
			return result.rows;
		} finally {
			client.release();
		}
	} catch (error) {
		console.error('Error fetching recent logs:', error);
		return [];
	}
}

// Close the connection pool (useful for cleanup)
export async function closePool(): Promise<void> {
	if (pool) {
		await pool.end();
		pool = null;
		console.log('PostgreSQL connection pool closed');
	}
}

// Test database connection
export async function testConnection(): Promise<boolean> {
	try {
		const pool = getPool();
		const client = await pool.connect();

		try {
			const result = await client.query('SELECT NOW() as current_time');
			console.log('PostgreSQL connection successful:', result.rows[0].current_time);
			return true;
		} finally {
			client.release();
		}
	} catch (error) {
		console.error('PostgreSQL connection failed:', error);
		return false;
	}
}
