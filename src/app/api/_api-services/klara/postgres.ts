// Copyright 2019-2025 @polkassembly/polkassembly authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { pgTable, serial, text, timestamp, integer, varchar, index } from 'drizzle-orm/pg-core';
import { desc, sql } from 'drizzle-orm';
import { Pool } from 'pg';
import { KLARA_QA_TABLE, KLARA_FEEDBACK_TABLE, KLARA_POSTGRES_DATABASE } from '@/_shared/_constants/klaraConstants';

// Define the Klara QA schema
const klaraQaDevColumns = {
	id: serial('id').primaryKey(),
	timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
	query: text('query').notNull(),
	response: text('response').notNull(),
	status: varchar('status', { length: 50 }).default('success'),
	userId: varchar('user_id', { length: 255 }),
	conversationId: varchar('conversation_id', { length: 255 }),
	responseTimeMs: integer('response_time_ms'),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
};

// Define the Klara Feedback schema
const klaraFeedbackDevColumns = {
	id: serial('id').primaryKey(),
	firstName: varchar('first_name', { length: 100 }).notNull(),
	lastName: varchar('last_name', { length: 100 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	company: varchar('company', { length: 255 }),
	feedbackText: text('feedback_text'),
	userId: varchar('user_id', { length: 100 }),
	conversationId: varchar('conversation_id', { length: 100 }),
	messageId: varchar('message_id', { length: 100 }),
	rating: integer('rating'),
	feedbackType: varchar('feedback_type', { length: 50 }).default('form_submission'),
	queryText: text('query_text'),
	responseText: text('response_text'),
	timestamp: timestamp('timestamp', { withTimezone: true }).defaultNow(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow()
};

const klaraQaDev = pgTable('klara_qa_dev', klaraQaDevColumns, (table) => [
	index('idx_klara_qa_dev_timestamp').on(table.timestamp),
	index('idx_klara_qa_dev_user_id').on(table.userId),
	index('idx_klara_qa_dev_conversation_id').on(table.conversationId),
	index('idx_klara_qa_dev_status').on(table.status)
]);

const klaraQaProd = pgTable('klara_qa_prod', klaraQaDevColumns, (table) => [
	index('idx_klara_qa_prod_timestamp').on(table.timestamp),
	index('idx_klara_qa_prod_user_id').on(table.userId),
	index('idx_klara_qa_prod_conversation_id').on(table.conversationId),
	index('idx_klara_qa_prod_status').on(table.status)
]);

// Define feedback tables
const klaraFeedbackDev = pgTable('klara_feedback_dev', klaraFeedbackDevColumns, (table) => [
	index('idx_klara_feedback_dev_timestamp').on(table.timestamp),
	index('idx_klara_feedback_dev_email').on(table.email),
	index('idx_klara_feedback_dev_user_id').on(table.userId),
	index('idx_klara_feedback_dev_conversation_id').on(table.conversationId),
	index('idx_klara_feedback_dev_rating').on(table.rating)
]);

const klaraFeedbackProd = pgTable('klara_feedback_prod', klaraFeedbackDevColumns, (table) => [
	index('idx_klara_feedback_prod_timestamp').on(table.timestamp),
	index('idx_klara_feedback_prod_email').on(table.email),
	index('idx_klara_feedback_prod_user_id').on(table.userId),
	index('idx_klara_feedback_prod_conversation_id').on(table.conversationId),
	index('idx_klara_feedback_prod_rating').on(table.rating)
]);

let pool: Pool | null = null;
let db: NodePgDatabase | null = null;

function getPool(): Pool {
	if (!pool) {
		pool = new Pool({
			host: process.env.KLARA_POSTGRES_HOST || 'localhost',
			port: Number.parseInt(process.env.KLARA_POSTGRES_PORT || '5432', 10),
			database: KLARA_POSTGRES_DATABASE || 'polkassembly',
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

function getDb(): NodePgDatabase {
	if (!db) {
		db = drizzle(getPool());
	}
	return db;
}

// Get table name based on environment
function getTableName(): string {
	return KLARA_QA_TABLE || 'klara_qa_prod';
}

// Get the appropriate table based on environment
function getTable() {
	const tableName = KLARA_QA_TABLE || 'klara_qa_prod';
	return tableName === 'klara_qa_prod' ? klaraQaProd : klaraQaDev;
}

// Get feedback table name based on environment
function getFeedbackTableName(): string {
	return KLARA_FEEDBACK_TABLE || 'klara_feedback_prod';
}

// Get the appropriate feedback table based on environment
function getFeedbackTable() {
	const tableName = KLARA_FEEDBACK_TABLE || 'klara_feedback_prod';
	return tableName === 'klara_feedback_prod' ? klaraFeedbackProd : klaraFeedbackDev;
}

// Check if table exists and create if it doesn't
export async function ensureTableExists(): Promise<void> {
	try {
		const tableName = getTableName();
		const table = getTable();

		// Try to query the table to check if it exists
		// This is a simple existence check using Drizzle
		try {
			await getDb().select().from(table).limit(1);
			console.log(`Table ${tableName} already exists`);
		} catch {
			// If the table doesn't exist, we'll get an error
			console.log(`Table ${tableName} does not exist. Please run migrations or create the table manually.`);
			console.log('The expected schema is defined in the Drizzle table definition.');
		}
	} catch (error) {
		console.error('Error checking table existence:', error);
		// Don't throw error for table creation to avoid breaking the app
		// Just log the error and continue
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
	try {
		const table = getTable();

		const result = await getDb()
			.insert(table)
			.values({
				query: data.query,
				response: data.response,
				status: data.status || 'success',
				userId: data.userId || null,
				conversationId: data.conversationId || null,
				responseTimeMs: data.responseTimeMs || null
			})
			.returning({
				id: table.id,
				timestamp: table.timestamp
			});

		const insertedRow = result[0];
		const tableName = getTableName();

		console.log(`Logged Q&A to ${tableName} - ID: ${insertedRow.id}, Timestamp: ${insertedRow.timestamp}`);
	} catch (error) {
		console.error('Error logging query-response to PostgreSQL:', error);
		// Don't throw error to avoid breaking the chat flow
		// Just log the error and continue
	}
}

// Get recent query-response logs (for debugging/analytics)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getRecentLogs(limit: number = 10): Promise<any[]> {
	try {
		const table = getTable();

		return await getDb()
			.select({
				id: table.id,
				timestamp: table.timestamp,
				query: table.query,
				response: table.response,
				status: table.status,
				userId: table.userId,
				conversationId: table.conversationId,
				responseTimeMs: table.responseTimeMs,
				createdAt: table.createdAt
			})
			.from(table)
			.orderBy(desc(table.timestamp))
			.limit(limit);
	} catch (error) {
		console.error('Error fetching recent logs:', error);
		return [];
	}
}

// Check if feedback table exists and create if it doesn't
export async function ensureFeedbackTableExists(): Promise<void> {
	try {
		const tableName = getFeedbackTableName();
		const table = getFeedbackTable();

		// Try to query the table to check if it exists
		try {
			await getDb().select().from(table).limit(1);
			console.log(`Feedback table ${tableName} already exists`);
		} catch {
			console.log(`Feedback table ${tableName} does not exist. Please run migrations or create the table manually.`);
			console.log('The expected schema is defined in the Drizzle table definition.');
		}
	} catch (error) {
		console.error('Error checking feedback table existence:', error);
		// Don't throw error for table creation to avoid breaking the app
	}
}

// Save feedback data to PostgreSQL
export async function saveFeedback(data: {
	firstName: string;
	lastName: string;
	email: string;
	company?: string;
	feedbackText?: string;
	userId?: string;
	conversationId?: string;
	messageId?: string;
	rating?: number;
	feedbackType?: string;
	queryText?: string;
	responseText?: string;
}): Promise<void> {
	try {
		const table = getFeedbackTable();

		const result = await getDb()
			.insert(table)
			.values({
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				company: data.company || null,
				feedbackText: data.feedbackText || null,
				userId: data.userId || null,
				conversationId: data.conversationId || null,
				messageId: data.messageId || null,
				rating: data.rating || null,
				feedbackType: data.feedbackType || 'form_submission',
				queryText: data.queryText || null,
				responseText: data.responseText || null,
				timestamp: new Date()
			})
			.returning({
				id: table.id,
				timestamp: table.timestamp
			});

		const insertedRow = result[0];
		const tableName = getFeedbackTableName();

		console.log(`Feedback saved to ${tableName} - ID: ${insertedRow.id}, Timestamp: ${insertedRow.timestamp}`);
	} catch (error) {
		console.error('Error saving feedback to PostgreSQL:', error);
		// Throw error for feedback form to handle
		throw error;
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
		// Test connection using Drizzle with a simple query
		const result = await getDb().execute(sql`SELECT NOW() as current_time`);
		console.log('PostgreSQL connection successful:', result.rows[0]?.current_time);
		return true;
	} catch (error) {
		console.error('PostgreSQL connection failed:', error);
		return false;
	}
}
