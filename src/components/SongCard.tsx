import { motion } from "framer-motion";
import { Music, User, Clock, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { MusicArtService } from "../services/MusicArtService";

interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt?: string;
  price: number;
  status: "playing" | "queued" | "played";
  requestedBy: string;
  timestamp?: string;
}

interface SongCardProps {
  song: Song;
  currentlyPlaying: boolean;
}

export function SongCard({ song, currentlyPlaying }: SongCardProps) {
  // State for album art
  const [albumArt, setAlbumArt] = useState<string>(song.albumArt || "");
  const [artFailed, setArtFailed] = useState<boolean>(false);

  // Get album art on component mount or when song changes
  useEffect(() => {
    setArtFailed(false);
    if (!song.albumArt) {
      // If song doesn't have album art, get it from service
      const art = MusicArtService.getAlbumArtwork(song.title, song.artist);
      setAlbumArt(art);
    } else {
      setAlbumArt(song.albumArt);
    }
  }, [song.id, song.title, song.artist, song.albumArt]);

  // Handle image errors
  const handleImageError = () => {
    if (!artFailed) {
      setArtFailed(true);
      // Try to get a backup image from our service
      const backupArt = MusicArtService.getAlbumArtwork(song.title, song.artist);
      setAlbumArt(backupArt);
    }
  };

  // Status indicator based on song status
  const renderStatusIndicator = () => {
    switch (song.status) {
      case "playing":
        return (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-accent px-2 py-1">
            <div className="h-2 w-2 animate-pulse rounded-full bg-accent-foreground"></div>
            <span className="text-xs font-medium text-accent-foreground">Playing</span>
          </div>
        );
      case "queued":
        return (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-primary/70 px-2 py-1">
            <Clock className="h-3 w-3 text-primary-foreground" />
            <span className="text-xs font-medium text-primary-foreground">In Queue</span>
          </div>
        );
      case "played":
        return (
          <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-muted/70 px-2 py-1">
            <CheckCircle className="h-3 w-3 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Played</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`relative overflow-hidden rounded-xl ${currentlyPlaying ? "border-2 border-accent" : "border border-border"
        } transition-all duration-300`}
    >
      {renderStatusIndicator()}

      <div className="aspect-square overflow-hidden">
        {albumArt ? (
          <img
            src={albumArt}
            alt={`${song.title} album art`}
            className={`h-full w-full object-cover transition-all duration-500 ${currentlyPlaying ? "now-playing-poster scale-105" : "music-poster"
              }`}
            onError={handleImageError}
          />
        ) : (
          <div className={`flex h-full w-full items-center justify-center bg-muted ${currentlyPlaying ? "now-playing-poster" : ""
            }`}>
            <Music className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 font-semibold">{song.title}</h3>
        <p className="line-clamp-1 text-sm text-muted-foreground">{song.artist}</p>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[80px]">{song.requestedBy}</span>
          </div>
          <div className="flex-1 flex justify-end">
            <div className={`price-badge text-xs px-2 py-1 rounded-lg font-bold shadow-lg ${song.price >= 2000
              ? "bg-gradient-to-r from-amber-400 to-yellow-600 text-[#001C3D] scale-110"
              : "bg-accent text-accent-foreground"
              }`}>
              ₦{song.price.toLocaleString()}
            </div>
          </div>
        </div>

        {song.price >= 3000 && (
          <div className="absolute top-2 left-2 z-20">
            <div className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-lg border border-white/20 uppercase tracking-tighter animate-pulse">
              <Zap className="h-2 w-2 fill-white" />
              Priority
            </div>
          </div>
        )}

        {currentlyPlaying && (
          <div className="mt-3 flex justify-center">
            <div className="music-wave">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="wave-bar"></div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}