
import { z } from 'zod';

// Song schema
export const songSchema = z.object({
  id: z.number(),
  name: z.string(),
  audioUrl: z.string().url(),
  created_at: z.coerce.date()
});

export type Song = z.infer<typeof songSchema>;

// Input schema for getting songs (no input needed for listing)
export const getSongsInputSchema = z.object({});

export type GetSongsInput = z.infer<typeof getSongsInputSchema>;

// Input schema for getting a single song by ID
export const getSongInputSchema = z.object({
  id: z.number().int().positive()
});

export type GetSongInput = z.infer<typeof getSongInputSchema>;
