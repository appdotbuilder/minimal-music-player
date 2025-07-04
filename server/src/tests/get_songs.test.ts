
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { songsTable } from '../db/schema';
import { getSongs } from '../handlers/get_songs';

describe('getSongs', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no songs exist', async () => {
    const result = await getSongs();
    expect(result).toEqual([]);
  });

  it('should return all songs', async () => {
    // Create test songs
    await db.insert(songsTable)
      .values([
        {
          name: 'Test Song 1',
          audioUrl: 'https://example.com/song1.mp3'
        },
        {
          name: 'Test Song 2',
          audioUrl: 'https://example.com/song2.mp3'
        }
      ])
      .execute();

    const result = await getSongs();

    expect(result).toHaveLength(2);
    expect(result[0].name).toBeDefined();
    expect(result[0].audioUrl).toBeDefined();
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[1].name).toBeDefined();
    expect(result[1].audioUrl).toBeDefined();
    expect(result[1].id).toBeDefined();
    expect(result[1].created_at).toBeInstanceOf(Date);
  });

  it('should return songs ordered by creation date descending', async () => {
    // Create first song
    await db.insert(songsTable)
      .values({
        name: 'Older Song',
        audioUrl: 'https://example.com/older.mp3'
      })
      .execute();

    // Wait a bit to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 10));

    // Create second song
    await db.insert(songsTable)
      .values({
        name: 'Newer Song',
        audioUrl: 'https://example.com/newer.mp3'
      })
      .execute();

    const result = await getSongs();

    expect(result).toHaveLength(2);
    expect(result[0].name).toEqual('Newer Song');
    expect(result[1].name).toEqual('Older Song');
    expect(result[0].created_at >= result[1].created_at).toBe(true);
  });

  it('should return songs with all required fields', async () => {
    await db.insert(songsTable)
      .values({
        name: 'Complete Song',
        audioUrl: 'https://example.com/complete.mp3'
      })
      .execute();

    const result = await getSongs();

    expect(result).toHaveLength(1);
    const song = result[0];
    expect(typeof song.id).toBe('number');
    expect(typeof song.name).toBe('string');
    expect(typeof song.audioUrl).toBe('string');
    expect(song.created_at).toBeInstanceOf(Date);
    expect(song.name).toEqual('Complete Song');
    expect(song.audioUrl).toEqual('https://example.com/complete.mp3');
  });
});
