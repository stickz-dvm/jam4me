import { motion, AnimatePresence } from "framer-motion";
import { SpotifyTrack } from "../api/types";
import { Music, Loader2 } from "lucide-react";

interface SpotifySearchProps {
  results: SpotifyTrack[];
  onSelect: (track: SpotifyTrack) => void;
  isLoading?: boolean;
}

export function SpotifySearch({ results, onSelect, isLoading = false }: SpotifySearchProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="flex items-center justify-center rounded-lg border border-border p-6"
      >
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
          <p className="mt-2 text-muted-foreground">Searching Nigerian beats...</p>
        </div>
      </motion.div>
    );
  }

  // Return null if there are no results and search hasn't been performed
  if (!results || results.length === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="max-h-[300px] overflow-y-auto rounded-lg border border-border"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-card/80 p-2 backdrop-blur-sm">
          <div className="flex items-center">
            <Music className="mr-2 h-4 w-4 text-accent" />
            <span className="text-sm">Top Nigerian Hits</span>
          </div>
          <span className="text-xs text-muted-foreground">{results.length} results</span>
        </div>

        {results.map((track) => (
          <motion.div
            key={track.id}
            whileHover={{ backgroundColor: "rgba(255, 214, 10, 0.1)" }}
            className="flex cursor-pointer items-center gap-3 border-b border-border p-3 last:border-b-0"
            onClick={() => onSelect(track)}
          >
            {track.album.images && track.album.images[0]?.url ? (
              <img
                src={track.album.images[0].url}
                alt={track.album.name}
                className="music-poster h-12 w-12 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-muted">
                <Music className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 overflow-hidden">
              <p className="truncate font-medium">{track.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {track.artists && track.artists.length > 0 
                  ? track.artists.map((artist: { name: string }) => artist.name).join(", ")
                  : "Unknown Artist"}
              </p>
            </div>
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-accent"
              >
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}