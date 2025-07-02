import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { spotifyService, SpotifyTrack } from "../services/SpotifyService";
import { toast } from "sonner";

type SpotifyContextType = {
  isConnected: boolean;
  isSearching: boolean;
  searchResults: SpotifyTrack[];
  searchQuery: string;
  selectedTrack: SpotifyTrack | null;
  connectToSpotify: () => Promise<void>;
  searchTracks: (query: string) => Promise<SpotifyTrack[]>;
  selectTrack: (track: SpotifyTrack) => void;
  clearSearch: () => void;
};

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  // Check if Spotify is already connected on load
  useEffect(() => {
    if (spotifyService.isAuthenticated()) {
      setIsConnected(true);
    }
  }, []);

  // Connect to Spotify
  const connectToSpotify = async () => {
    try {
      const success = await spotifyService.authenticate();
      setIsConnected(success);
      if (success) {
        toast.success("Connected to Spotify");
      }
    } catch (error) {
      toast.error("Failed to connect to Spotify");
      console.error("Spotify connection error:", error);
    }
  };

  // Search for tracks
  const searchTracks = async (query: string): Promise<SpotifyTrack[]> => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    
    try {
      setIsSearching(true);
      const results = await spotifyService.searchTracks(query);
      const validResults = results || [];
      setSearchResults(validResults);
      return validResults;
    } catch (error) {
      toast.error("Failed to search tracks");
      console.error("Spotify search error:", error);
      return [];
    } finally {
      setIsSearching(false);
    }
  };

  // Select a track
  const selectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedTrack(null);
  };

  return (
    <SpotifyContext.Provider
      value={{
        isConnected,
        isSearching,
        searchResults,
        searchQuery,
        selectedTrack,
        connectToSpotify,
        searchTracks,
        selectTrack,
        clearSearch,
      }}
    >
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error("useSpotify must be used within a SpotifyProvider");
  }
  return context;
}