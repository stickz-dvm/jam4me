import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { MusicArtService } from "../services/MusicArtService";

interface Song {
  id: string;
  title?: string;
  artist?: string;
  albumArt?: string;
  duration: number;
}

interface MusicPlayerProps {
  song?: Song;
  isPlaying: boolean;
  onPlayPause?: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function MusicPlayer({ song, isPlaying }: MusicPlayerProps) {
  const [albumArt, setAlbumArt] = useState<string>("");
  const [currentSong, setCurrentSong] = useState<{
    title: string;
    artist: string;
  }>({
    title: "Lungu Boy",
    artist: "Asake"
  });
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  
  // Update the album art and song info whenever the song prop changes
  useEffect(() => {
    // Reset image failure state when song changes
    setImageFailed(false);
    
    if (!song || !song.id) {
      // Default to Lungu Boy by Asake if no song is provided
      setCurrentSong({ title: "Lungu Boy", artist: "Asake" });
      const albumArtUrl = "https://media.pitchfork.com/photos/66b10a3eee21ef0a8b842d3e/2:3/w_2000,h_3000,c_limit/Asake-Lungu-Boy.jpg";
      setAlbumArt(albumArtUrl);
      return;
    }
    
    // Use the provided song info
    const title = song.title || "Unknown";
    const artist = song.artist || "Unknown";
    
    setCurrentSong({ title, artist });
    
    // If song has its own albumArt property, use that first
    if (song.albumArt) {
      setAlbumArt(song.albumArt);
    } 
    // Otherwise, use the MusicArtService to get appropriate artwork based on the song title
    else {
      console.log(`Fetching album art for "${title}" by "${artist}"`);
      
      // Use specific album art for known songs
      if (title.toLowerCase() === "lungu boy" && artist.toLowerCase() === "asake") {
        setAlbumArt("https://media.pitchfork.com/photos/66b10a3eee21ef0a8b842d3e/2:3/w_2000,h_3000,c_limit/Asake-Lungu-Boy.jpg");
      } 
      else if (title.toLowerCase() === "made in lagos" && artist.toLowerCase() === "wizkid") {
        setAlbumArt("https://upload.wikimedia.org/wikipedia/en/c/c2/Wizkid_-_Made_in_Lagos.png");
      }
      else {
        const fetchedArt = MusicArtService.getAlbumArtwork(title, artist);
        setAlbumArt(fetchedArt);
      }
    }
  }, [song]);
  
  // Handle image load failures
  const handleImageError = () => {
    console.log("Image loading failed, trying alternative sources");
    setImageFailed(true);
    
    const title = currentSong.title || "Unknown";
    const artist = currentSong.artist || "Unknown";
    
    // Try to get a different image from our service
    if (!imageFailed) {
      console.log("First failure, trying album art service");
      
      // Use specific album art for known songs if the first attempt failed
      if (title.toLowerCase() === "lungu boy" && artist.toLowerCase() === "asake") {
        setAlbumArt("https://media.pitchfork.com/photos/66b10a3eee21ef0a8b842d3e/2:3/w_2000,h_3000,c_limit/Asake-Lungu-Boy.jpg");
      }
      else if (title.toLowerCase() === "made in lagos" && artist.toLowerCase() === "wizkid") {
        setAlbumArt("https://upload.wikimedia.org/wikipedia/en/c/c2/Wizkid_-_Made_in_Lagos.png");
      }
      else {
        const backupArt = MusicArtService.getAlbumArtwork(title, artist);
        setAlbumArt(backupArt);
      }
    }
    // If that still fails, use a generic album art
    else {
      console.log("Second failure, using generic art");
      const genericArt = MusicArtService.getGenericAlbumArt(
        title.toLowerCase() === "made in lagos" ? "lagos" : 
        title.toLowerCase() === "yoga" ? "yoga" : 
        title.toLowerCase() === "lungu boy" ? "lungu boy" : 
        "afrobeats");
      setAlbumArt(genericArt);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-xl bg-card p-4 md:p-6">
      <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent opacity-10 blur-3xl"></div>
      <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-primary opacity-10 blur-3xl"></div>
      
      <div className="relative z-10 flex flex-col items-center md:flex-row md:items-start md:gap-8">
        {/* Album Art with Animation */}
        <motion.div 
          className="mb-4 md:mb-0"
          animate={isPlaying ? {
            y: [0, -5, 0],
            scale: [1, 1.02, 1],
          } : {}}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: "easeInOut"
          }}
        >
          {/* Album artwork */}
          <div 
            className="now-playing-poster flex h-48 w-48 items-center justify-center overflow-hidden md:h-64 md:w-64"
            style={{
              boxShadow: "0 0 30px rgba(255, 214, 10, 0.3)"
            }}
          >
            <img
              src={albumArt}
              alt={`${currentSong.title} by ${currentSong.artist}`}
              className="h-full w-full object-cover rounded-lg"
              onError={handleImageError}
            />
          </div>
        </motion.div>
        
        {/* Song Info */}
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-left">
          <motion.h3 
            className="text-xl font-bold md:text-2xl"
            animate={isPlaying ? { 
              color: ["#f5f5f7", "#ffd60a", "#f5f5f7"] 
            } : {}}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: "easeInOut"
            }}
          >
            {currentSong.title}
          </motion.h3>
          
          <p className="mt-1 text-muted-foreground">{currentSong.artist}</p>
          
          {/* Visualizer */}
          <div className="mt-6 h-16 w-full rounded-lg bg-background/30 p-2">
            <div className="flex h-full items-end space-x-1">
              {[...Array(40)].map((_, i) => {
                const height = isPlaying 
                  ? Math.sin(i * 0.2) * 0.5 + 0.5 
                  : 0.1;
                
                return (
                  <motion.div
                    key={i}
                    className="w-1 bg-accent"
                    style={{ height: "10%" }}
                    animate={isPlaying ? { 
                      height: `${height * 100}%`,
                      backgroundColor: i % 4 === 0 ? "#ffd60a" : "#3b82f6"
                    } : {}}
                    transition={{
                      repeat: Infinity,
                      duration: 1.5,
                      delay: i * 0.02,
                      ease: "easeInOut"
                    }}
                  />
                );
              })}
            </div>
          </div>
          
          {/* "Now Playing" indicator */}
          <div className="mt-6 flex items-center rounded-full bg-muted/30 px-4 py-2">
            <div className="mr-2 h-2 w-2 rounded-full bg-accent animate-pulse"></div>
            <span className="text-sm">Now Playing</span>
          </div>
        </div>
      </div>
    </div>
  );
}