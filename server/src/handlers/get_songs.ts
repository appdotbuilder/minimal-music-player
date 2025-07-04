
import { db } from '../db';
import { songsTable } from '../db/schema';
import { type Song } from '../schema';
import { desc } from 'drizzle-orm';

export const getSongs = async (): Promise<Song[]> => {
  try {
    // Query all songs ordered by creation date (newest first)
    const results = await db.select()
      .from(songsTable)
      .orderBy(desc(songsTable.created_at))
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    throw error;
  }
};
