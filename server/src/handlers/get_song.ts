
import { db } from '../db';
import { songsTable } from '../db/schema';
import { type GetSongInput, type Song } from '../schema';
import { eq } from 'drizzle-orm';

export const getSong = async (input: GetSongInput): Promise<Song | null> => {
  try {
    // Query for the specific song by ID
    const result = await db.select()
      .from(songsTable)
      .where(eq(songsTable.id, input.id))
      .execute();

    // Return null if no song found
    if (result.length === 0) {
      return null;
    }

    // Return the first (and only) matching song
    return result[0];
  } catch (error) {
    console.error('Get song failed:', error);
    throw error;
  }
};
