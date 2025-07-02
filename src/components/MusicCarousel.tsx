import { useState, useEffect } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { MusicPlayer } from "./MusicPlayer";
import { MusicArtService } from "../services/MusicArtService";
import { Play, SkipForward } from "lucide-react";

// Sample songs for the demo carousel
const DEMO_SONGS = [
  {
    id: "song-0",
    title: "Yoga",
    artist: "Asake",
    duration: 210000, // 3:30 minutes
  },
  {
    id: "song-1",
    title: "Essence",
    artist: "Wizkid",
    duration: 240000, // 4 minutes
  },
  {
    id: "song-2",
    title: "Last Last",
    artist: "Burna Boy",
    duration: 180000, // 3 minutes
  },
  {
    id: "song-3",
    title: "Rush",
    artist: "Ayra Starr",
    duration: 160000, // 2:40 minutes
  },
  {
    id: "song-4", 
    title: "Calm Down",
    artist: "Rema",
    duration: 210000, // 3:30 minutes
  },
  {
    id: "song-5",
    title: "Peru",
    artist: "Fireboy DML",
    duration: 190000, // 3:10 minutes
  }
];

export function MusicCarousel() {
  const [currentSongIndex, setCurrentSongIndex] = useState(0); // Start with Yoga by Asake
  const [isPlaying, setIsPlaying] = useState(true);
  const [songsWithArt, setSongsWithArt] = useState(DEMO_SONGS.map(song => ({ ...song, albumArt: "" })));
  
  // Get current song from the demo list
  const currentSong = songsWithArt[currentSongIndex];
  
  // Move to next song in the carousel
  const nextSong = () => {
    setCurrentSongIndex((prev) => (prev + 1) % DEMO_SONGS.length);
    setIsPlaying(true);
  };
  
  // Toggle play/pause
  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };
  
  // Load album artwork for all songs on component mount
  useEffect(() => {
    const songsWithArtwork = DEMO_SONGS.map(song => {
      // Get album artwork for each song
      const albumArt = MusicArtService.getAlbumArtwork(song.title, song.artist);
      return { ...song, albumArt };
    });
    
    setSongsWithArt(songsWithArtwork);
  }, []);
  
  return (
    <div className="my-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Nigerian Music Showcase</h2>
        <p className="text-muted-foreground">
          Demonstrating dynamic music posters that change with each song
        </p>
      </div>
      
      <Card className="bg-card/70 backdrop-blur-md border-accent/10">
        <CardContent className="p-6">
          {/* Music player with current song */}
          <MusicPlayer
            song={currentSong}
            isPlaying={isPlaying}
          />
          
          {/* Controls */}
          <div className="flex justify-center gap-4 mt-6">
            <Button 
              variant="outline" 
              size="lg"
              className="px-8"
              onClick={togglePlay}
            >
              <Play className="mr-2 h-4 w-4" />
              {isPlaying ? "Pause" : "Play"}
            </Button>
            
            <Button 
              variant="default" 
              size="lg"
              className="bg-accent text-accent-foreground px-8"
              onClick={nextSong}
            >
              <SkipForward className="mr-2 h-4 w-4" />
              Next Song
            </Button>
          </div>
          
          {/* Queue preview */}
          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Up Next</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {songsWithArt.map((song, index) => {
                // Skip current song in the queue
                if (index === currentSongIndex) return null;
                
                return (
                  <div 
                    key={song.id}
                    className="cursor-pointer hover:scale-105 transition-transform"
                    onClick={() => {
                      setCurrentSongIndex(index);
                      setIsPlaying(true);
                    }}
                  >
                    <div className="aspect-square overflow-hidden rounded-lg mb-2 bg-muted/30">
                      {song.albumArt ? (
                        <img 
                          src={song.albumArt} 
                          alt={`${song.title} by ${song.artist}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center w-full h-full">
                          <span className="text-sm text-muted-foreground">Loading...</span>
                        </div>
                      )}
                    </div>
                    <p className="font-medium truncate">{song.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{song.artist}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}