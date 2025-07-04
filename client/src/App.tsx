
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { trpc } from '@/utils/trpc';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, Square, Volume2 } from 'lucide-react';
import type { Song } from '../../server/src/schema';

// Predefined songs for the music player
const predefinedSongs: Song[] = [
  {
    id: 1,
    name: "Classical Symphony No. 1",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    created_at: new Date('2024-01-01')
  },
  {
    id: 2,
    name: "Jazz Blues Melody",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    created_at: new Date('2024-01-02')
  },
  {
    id: 3,
    name: "Rock Guitar Anthem",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    created_at: new Date('2024-01-03')
  },
  {
    id: 4,
    name: "Electronic Dance Beat",
    audioUrl: "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
    created_at: new Date('2024-01-04')
  }
];

function App() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadSongs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await trpc.getSongs.query({});
      setSongs(result);
      setUsingFallbackData(false);
    } catch (error) {
      console.error('Failed to load songs from server:', error);
      console.log('Using predefined songs as fallback');
      setSongs(predefinedSongs);
      setUsingFallbackData(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSongs();
  }, [loadSongs]);

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('loadedmetadata', () => {
        setDuration(audioRef.current?.duration || 0);
      });
      
      audioRef.current.addEventListener('timeupdate', () => {
        setCurrentTime(audioRef.current?.currentTime || 0);
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentTime(0);
      });
      
      audioRef.current.addEventListener('error', () => {
        setError('Error loading audio file - using demo audio URLs');
        setIsPlaying(false);
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, []);

  const selectSong = (song: Song) => {
    setCurrentSong(song);
    setError(null);
    if (audioRef.current) {
      audioRef.current.src = song.audioUrl;
      audioRef.current.load();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  };

  const playPause = () => {
    if (!audioRef.current || !currentSong) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch(() => {
        setError('Failed to play audio - demo URLs may not be accessible');
      });
      setIsPlaying(true);
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading songs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Volume2 className="h-8 w-8" />
          Music Player
        </h1>
        <p className="text-gray-600">Select a song and enjoy your music</p>
        {usingFallbackData && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
            📝 Note: Using predefined songs (server not available)
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Song List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Songs</CardTitle>
              <CardDescription>
                Click on a song to select it for playback
              </CardDescription>
            </CardHeader>
            <CardContent>
              {songs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No songs available
                </p>
              ) : (
                <div className="space-y-2">
                  {songs.map((song: Song) => (
                    <div
                      key={song.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        currentSong?.id === song.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => selectSong(song)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{song.name}</h3>
                          <p className="text-sm text-gray-500">
                            Added: {song.created_at.toLocaleDateString()}
                          </p>
                        </div>
                        {currentSong?.id === song.id && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-blue-600">Selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Music Player Controls */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Now Playing</CardTitle>
            </CardHeader>
            <CardContent>
              {currentSong ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg">{currentSong.name}</h3>
                    <p className="text-sm text-gray-500">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </p>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: duration > 0 ? `${(currentTime / duration) * 100}%` : '0%',
                      }}
                    ></div>
                  </div>

                  <Separator />

                  {/* Controls */}
                  <div className="flex justify-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={playPause}
                      disabled={!currentSong}
                    >
                      {isPlaying ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={stop}
                      disabled={!currentSong}
                    >
                      <Square className="h-4 w-4" />
                    </Button>
                  </div>

                  {error && (
                    <div className="text-amber-600 text-sm p-2 bg-amber-50 rounded border border-amber-200">
                      ⚠️ {error}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Volume2 className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    Select a song to start playing
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default App;
