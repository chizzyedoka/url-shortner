import {pgTable, uuid, text, timestamp, varchar} from 'drizzle-orm/pg-core';
import {usersTable} from './user.model.js';

export const urlsTable = pgTable('urls', {
    id: uuid().primaryKey().defaultRandom(),
    shortCode: varchar('short_code', {length: 20}).notNull().unique(),
    originalUrl: text('original_url').notNull(),

    userId: uuid('user_id').references(() => usersTable.id).notNull(),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').$onUpdate(()=> new Date())
});