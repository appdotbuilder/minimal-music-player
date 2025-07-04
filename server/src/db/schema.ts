
import { serial, text, pgTable, timestamp } from 'drizzle-orm/pg-core';

export const songsTable = pgTable('songs', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  audioUrl: text('audio_url').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// TypeScript type for the table schema
export type Song = typeof songsTable.$inferSelect; // For SELECT operations
export type NewSong = typeof songsTable.$inferInsert; // For INSERT operations

// Important: Export all tables and relations for proper query building
export const tables = { songs: songsTable };
