import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MusicCarousel } from "../MusicCarousel";
import { MusicArtService } from "../../services/MusicArtService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { RefreshCw, Music2, Play } from "lucide-react";

export function MusicPosterDemo() {
  const [randomSongs, setRandomSongs] = useState<Array<{
    title: string;
    artist: string;
    albumArt: string;
    id: string;
  }>>([]);
  
  // Generate random songs for the demo
  const generateRandomSongs = () => {
    const songs = Array.from({ length: 8 }).map((_, i) => {
      const song = MusicArtService.getRandomNigerianSong();
      return {
        ...song,
        id: `random-song-${i}-${Date.now()}`
      };
    });
    
    setRandomSongs(songs);
  };
  
  // Initial song generation
  useEffect(() => {
    generateRandomSongs();
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-6 md:py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold gradient-text mb-4">Music Poster Demo</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Experience dynamic music posters with the JAM4ME DJ system
        </p>
        
        {/* Main demo carousel */}
        <MusicCarousel />
        
        {/* More music posters showcase */}
        <div className="my-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold">Nigerian Music Posters</h2>
            <Button variant="outline" onClick={generateRandomSongs}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Collection
            </Button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {randomSongs.map((song) => (
              <Card key={song.id} className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50">
                <div className="aspect-square overflow-hidden relative group">
                  <img 
                    src={song.albumArt} 
                    alt={`${song.title} by ${song.artist}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full">
                      <Play className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="font-medium truncate">{song.title}</p>
                  <p className="text-sm text-muted-foreground">{song.artist}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        
        {/* About the feature */}
        <Card className="my-12 bg-card/70 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Music2 className="mr-2 h-5 w-5 text-accent" />
              About Dynamic Music Posters
            </CardTitle>
            <CardDescription>
              How JAM4ME enhances your party experience with visual features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              JAM4ME dynamically fetches high-quality album artwork to create an immersive and visually 
              appealing experience for both DJs and party-goers. Our system includes:
            </p>
            
            <ul className="space-y-2 list-disc pl-5 mb-4">
              <li>Real-time music poster updates when songs change</li>
              <li>Integration with Nigerian music library featuring top artists</li>
              <li>High-resolution album artwork for visual appeal</li>
              <li>Automatic fallbacks to ensure consistent visual display</li>
            </ul>
            
            <p>
              As a DJ, your "Now Playing" section will automatically update with appropriate album 
              artwork, creating a professional and engaging atmosphere for your events.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}