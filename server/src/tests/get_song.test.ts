
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { songsTable } from '../db/schema';
import { type GetSongInput } from '../schema';
import { getSong } from '../handlers/get_song';

describe('getSong', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return a song by ID', async () => {
    // Create a test song
    const [createdSong] = await db.insert(songsTable)
      .values({
        name: 'Test Song',
        audioUrl: 'https://example.com/audio/test.mp3'
      })
      .returning()
      .execute();

    const input: GetSongInput = {
      id: createdSong.id
    };

    const result = await getSong(input);

    // Verify the song was returned correctly
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(createdSong.id);
    expect(result!.name).toEqual('Test Song');
    expect(result!.audioUrl).toEqual('https://example.com/audio/test.mp3');
    expect(result!.created_at).toBeInstanceOf(Date);
  });

  it('should return null for non-existent song', async () => {
    const input: GetSongInput = {
      id: 999 // Non-existent ID
    };

    const result = await getSong(input);

    expect(result).toBeNull();
  });

  it('should handle database query correctly', async () => {
    // Create multiple test songs
    await db.insert(songsTable)
      .values([
        {
          name: 'Song One',
          audioUrl: 'https://example.com/audio/song1.mp3'
        },
        {
          name: 'Song Two',
          audioUrl: 'https://example.com/audio/song2.mp3'
        }
      ])
      .execute();

    // Get all songs to find their IDs
    const allSongs = await db.select()
      .from(songsTable)
      .execute();

    // Test getting the first song
    const firstSongId = allSongs[0].id;
    const input: GetSongInput = {
      id: firstSongId
    };

    const result = await getSong(input);

    // Verify we got the correct song
    expect(result).not.toBeNull();
    expect(result!.id).toEqual(firstSongId);
    expect(result!.name).toEqual('Song One');
    expect(result!.audioUrl).toEqual('https://example.com/audio/song1.mp3');
    expect(result!.created_at).toBeInstanceOf(Date);
  });
});
