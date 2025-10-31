import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { useWallet } from "./WalletContext";
import { api } from "../api/apiMethods";
import { ApiResponse, Party, PartyContextType, Song } from "../api/types";

const PartyContext = createContext<PartyContextType | undefined>(undefined);

export const normalizeId = (id: string | number | undefined | null): string => {
  return id != null ? String(id) : "";
};

// Helper function to fix any references to "Blinding Lights" by "The Weeknd"
const updateSongReferences = (party: Party): Party => {
  if (!party || !party.songs) return party;
  
  const updatedSongs = party.songs.map(song => {
    if (song.title === "Blinding Lights" && song.artist === "The Weeknd") {
      return {
        ...song,
        title: "Lungu Boy",
        artist: "Asake"
      };
    }
    return song;
  });
  
  return {
    ...party,
    songs: updatedSongs
  };
};

export function PartyProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addFunds, deductFunds } = useWallet();
  const [currentParty, setCurrentParty] = useState<Party | null>(null);
  const [joinedParties, setJoinedParties] = useState<Party[]>([]);
  const [createdParties, setCreatedParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Track if we've already fetched data to prevent duplicate calls
  const hasFetchedDataRef = useRef(false);

  /**
   * Load party data from localStorage
   * This runs immediately without waiting for API calls
   */
  const loadLocalPartyData = useCallback(() => {
    if (!user) {
      setCurrentParty(null);
      setJoinedParties([]);
      setCreatedParties([]);
      return;
    }

    try {
      const storedCurrentParty = localStorage.getItem(`jam4me-current-party-${user.id}`);
      const storedJoinedParties = localStorage.getItem(`jam4me-joined-parties-${user.id}`);
      const storedCreatedParties = localStorage.getItem(`jam4me-created-parties-${user.id}`);
      
      if (storedCurrentParty) {
        let parsedParty = JSON.parse(storedCurrentParty);
        parsedParty.activeUntil = new Date(parsedParty.activeUntil);
        parsedParty.createdAt = new Date(parsedParty.createdAt);
        parsedParty.songs = parsedParty.songs.map((s: any) => ({
          ...s,
          requestedAt: new Date(s.requestedAt)
        }));
        
        parsedParty = updateSongReferences(parsedParty);
        setCurrentParty(parsedParty);
      }
      
      if (storedJoinedParties) {
        let parsedParties = JSON.parse(storedJoinedParties);
        let formattedParties = parsedParties.map((p: any) => ({
          ...p,
          activeUntil: new Date(p.activeUntil),
          createdAt: new Date(p.createdAt),
          songs: p.songs.map((s: any) => ({
            ...s,
            requestedAt: new Date(s.requestedAt)
          }))
        }));
        
        formattedParties = formattedParties.map(updateSongReferences);
        setJoinedParties(formattedParties);
      }

      if (storedCreatedParties && user.userType === "HUB_DJ") {
        let parsedParties = JSON.parse(storedCreatedParties);
        let formattedParties = parsedParties.map((p: any) => ({
          ...p,
          activeUntil: new Date(p.activeUntil),
          createdAt: new Date(p.createdAt),
          songs: p.songs.map((s: any) => ({
            ...s,
            requestedAt: new Date(s.requestedAt)
          }))
        }));
        
        formattedParties = formattedParties.map(updateSongReferences);
        setCreatedParties(formattedParties);
      }
    } catch (error) {
      console.error("Failed to load party data from localStorage:", error);
    }
  }, [user]);

  /**
   * Save party data to localStorage
   */
  const savePartyData = useCallback(() => {
    if (!user) return;

    try {
      if (currentParty) {
        localStorage.setItem(`jam4me-current-party-${user.id}`, JSON.stringify(currentParty));
      } else {
        localStorage.removeItem(`jam4me-current-party-${user.id}`);
      }
      
      localStorage.setItem(`jam4me-joined-parties-${user.id}`, JSON.stringify(joinedParties));
      
      if (user.userType === "HUB_DJ") {
        localStorage.setItem(`jam4me-created-parties-${user.id}`, JSON.stringify(createdParties));
      }
    } catch (error) {
      console.error("Failed to save party data to localStorage:", error);
    }
  }, [user, currentParty, joinedParties, createdParties]);

  /**
   * Fetch user's joined parties from API
   */
  const fetchJoinedParties = async (): Promise<Party[] | null> => {
    if (!user || !isAuthenticated) {
      console.warn("Cannot fetch joined parties: User not authenticated");
      return null;
    }

    try {
      // TODO: Replace with actual endpoint
      // const response = await api.get(`/user_wallet/joined_parties/${user.id}`);
      // return response.data.parties;
      return null;
    } catch (error: any) {
      console.error("Error fetching joined parties:", error);
      if (error.status !== 401) {
        toast.error("Failed to fetch joined parties");
      }
      return null;
    }
  };

  /**
   * Fetch DJ's created parties from API
   */
  const fetchCreatedParties = async (): Promise<Party[] | null> => {
    if (!user || !isAuthenticated || user.userType !== "HUB_DJ") {
      return null;
    }

    try {
      // TODO: Replace with actual endpoint
      // const response = await api.get(`/dj_wallet/my_parties/${user.id}`);
      // return response.data.parties;
      return null;
    } catch (error: any) {
      console.error("Error fetching created parties:", error);
      if (error.status !== 401) {
        toast.error("Failed to fetch created parties");
      }
      return null;
    }
  };

  /**
   * Refresh party data from API
   */
  const refreshPartyData = useCallback(async () => {
    if (!user || !isAuthenticated || authLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const [apiJoinedParties, apiCreatedParties] = await Promise.all([
        fetchJoinedParties(),
        fetchCreatedParties()
      ]);

      if (apiJoinedParties !== null) {
        setJoinedParties(apiJoinedParties);
      }

      if (apiCreatedParties !== null) {
        setCreatedParties(apiCreatedParties);
      }
    } catch (error) {
      console.error("Error refreshing party data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, authLoading]);

  /**
   * Initialize party state on mount and when auth state changes
   */
  useEffect(() => {
    hasFetchedDataRef.current = false;
    setIsInitialized(false);

    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      setCurrentParty(null);
      setJoinedParties([]);
      setCreatedParties([]);
      setIsInitialized(true);
      return;
    }

    // Load local data first (instant)
    loadLocalPartyData();

    // Then fetch fresh data from API (async)
    if (!hasFetchedDataRef.current) {
      hasFetchedDataRef.current = true;
      refreshPartyData().finally(() => {
        setIsInitialized(true);
      });
    } else {
      setIsInitialized(true);
    }
  }, [user, isAuthenticated, authLoading, loadLocalPartyData, refreshPartyData]);

  /**
   * Save party data to localStorage whenever it changes
   */
  useEffect(() => {
    if (isInitialized && user) {
      savePartyData();
    }
  }, [currentParty, joinedParties, createdParties, isInitialized, user, savePartyData]);

  /**
   * Helper function to find party by ID
   */
  const findPartyById = useCallback((partyId: string): Party | null => {
    if (currentParty && normalizeId(currentParty.id) === partyId) {
      return currentParty;
    }
    
    const createdParty = createdParties.find(p => normalizeId(p.id) === partyId);
    if (createdParty) return createdParty;
    
    const joinedParty = joinedParties.find(p => normalizeId(p.id) === partyId);
    if (joinedParty) return joinedParty;
    
    return null;
  }, [currentParty, createdParties, joinedParties]);

  /**
   * Helper function to update a party in all relevant state arrays
   */
  const updatePartyInState = useCallback((updatedParty: Party) => {
    if (currentParty && currentParty.id === updatedParty.id) {
      setCurrentParty(updatedParty);
    }
    
    if (createdParties.some(p => p.id === updatedParty.id)) {
      setCreatedParties(prev => prev.map(p => p.id === updatedParty.id ? updatedParty : p));
    }
    
    if (joinedParties.some(p => p.id === updatedParty.id)) {
      setJoinedParties(prev => prev.map(p => p.id === updatedParty.id ? updatedParty : p));
    }
  }, [currentParty, createdParties, joinedParties]);

  const joinParty = async (passcode: string): Promise<ApiResponse> => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to join a party");
      throw new Error("Not authenticated");
    }

    setIsLoading(true);
    try {
      console.log("Joining party:", { userId: user.id, passcode });
      
      const response = await api.post("/user_wallet/jo/_hub/", { 
        user_id: Number(user.id), 
        join_code: Number(passcode) 
      });

      console.log("Join party response:", response);

      if (response.status === 200 && response.data.data) {
        const party = updateSongReferences(response.data.data);
        setCurrentParty(party);
        
        if (!joinedParties.some(p => p.id === party.id)) {
          setJoinedParties(prev => [...prev, party]);
        }

        toast.success(`Joined party: ${party.name}`);
      }
      
      return response;
    } catch (error: any) {
      console.error("Join party error:", error);
      toast.error(error.message || "Failed to join party");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveParty = () => {
    if (!isAuthenticated) {
      toast.error("Please login to leave a party");
      return;
    }

    setCurrentParty(null);
    toast.success("Left the party");
  };

  const createParty = async (partyData: Omit<Party, "id" | "djId" | "songs" | "passcode" | "createdAt">): Promise<Party> => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can create parties");
      throw new Error("Only DJs can create parties");
    }
    
    console.log("🎉 Creating party...");
    console.log("User:", user);
    console.log("Token exists:", !!localStorage.getItem("authToken"));
    
    setIsLoading(true);
    try {
      const payload = {
        dj_id: user.id,
        party_name: partyData.name,
        hub_status: partyData.isActive,
        base_price: partyData.minRequestPrice,
        date_to_end: partyData.endDate,
        time_to_end: partyData.activeUntil,
        venue_name: partyData.location
      };

      console.log("📦 Create party payload:", payload);
      console.log("🔑 Token being sent:", localStorage.getItem("authToken")?.substring(0, 20) + "...");
      
      const response = await api.post("/dj_wallet/crt_hub/", payload);

      console.log("✅ Create hub response:", response);
      
      const newParty: Party = {
        ...partyData,
        id: response.data.hub_id,
        djId: user.id,
        dj: user.djName || user.username,
        songs: [],
        createdAt: new Date(),
        earnings: 0,
        passcode: response.data.passcode,
      };
      
      setCreatedParties(prev => [newParty, ...prev]);
      setCurrentParty(newParty);
      
      toast.success(`Party created: ${newParty.name}`);
      
      return newParty;
    } catch (error: any) {
      console.error("❌ Create party error:", error);
      console.error("Error status:", error.status);
      console.error("Error message:", error.message);
      console.error("Error data:", error.originalError);
      
      // Check if token is missing
      if (error.status === 401) {
        const token = localStorage.getItem("authToken");
        console.error("Token in localStorage:", token ? `${token.substring(0, 20)}... (${token.length} chars)` : "NULL");
        
        // Check if token expired
        const expiry = localStorage.getItem("jam4me-token-expiry");
        if (expiry) {
          const isExpired = Date.now() > parseInt(expiry, 10);
          console.error("Token expired:", isExpired);
          console.error("Token expiry date:", new Date(parseInt(expiry, 10)).toLocaleString());
        }
      }
      
      toast.error(error.message || "Failed to create party");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestSong = async (songTitle: string, artist: string, price: number, albumArt?: string) => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to request songs");
      throw new Error("Not authenticated");
    }

    if (!currentParty) {
      toast.error("Not joined to any party");
      throw new Error("Not joined to any party");
    }
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      await deductFunds(price);
      
      const newSong: Song = {
        id: `song-${Date.now()}`,
        title: songTitle,
        artist,
        price,
        requestedBy: user.username,
        status: "pending",
        requestedAt: new Date(),
        albumArt,
      };
      
      const updatedParty = {
        ...currentParty,
        songs: [newSong, ...currentParty.songs],
      };
      
      updatePartyInState(updatedParty);
      toast.success(`Requested: ${songTitle} by ${artist}`);
    } catch (error: any) {
      console.error("Request song error:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const approveSong = async (songId: string, partyId?: string) => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can approve songs");
      throw new Error("Only DJs can approve songs");
    }
    
    const targetPartyId = partyId || (currentParty?.id || "");
    const party = findPartyById(targetPartyId);
    
    if (!party) {
      toast.error("Party not found");
      throw new Error("Party not found");
    }
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const song = party.songs.find(s => s.id === songId);
      if (!song || song.status !== "pending") {
        throw new Error("Song not found or already processed");
      }
      
      const updatedSongs = party.songs.map(s => 
        s.id === songId ? { ...s, status: "pending" as const } : s
      );
      
      const updatedParty = {
        ...party,
        songs: updatedSongs,
      };
      
      updatePartyInState(updatedParty);
      toast.success(`Approved: ${song.title}`);
    } catch (error: any) {
      console.error("Approve song error:", error);
      toast.error(error.message || "Failed to approve song");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const declineSong = async (songId: string, partyId?: string) => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can decline songs");
      throw new Error("Only DJs can decline songs");
    }
    
    const targetPartyId = partyId || (currentParty?.id || "");
    const party = findPartyById(targetPartyId);
    
    if (!party) {
      toast.error("Party not found");
      throw new Error("Party not found");
    }
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const song = party.songs.find(s => s.id === songId);
      if (!song || song.status !== "pending") {
        throw new Error("Song not found or already processed");
      }
      
      await addFunds(song.price);
      
      const updatedSongs = party.songs.map(s => 
        s.id === songId ? { ...s, status: "declined" as const } : s
      );
      
      const updatedParty = {
        ...party,
        songs: updatedSongs,
      };
      
      updatePartyInState(updatedParty);
      toast.success(`Declined: ${song.title}. User refunded ₦${song.price.toLocaleString()}`);
    } catch (error: any) {
      console.error("Decline song error:", error);
      toast.error(error.message || "Failed to decline song");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const playSong = async (songId: string, partyId?: string) => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can play songs");
      throw new Error("Only DJs can play songs");
    }
    
    const targetPartyId = partyId || (currentParty?.id || "");
    const party = findPartyById(targetPartyId);
    
    if (!party) {
      toast.error("Party not found");
      throw new Error("Party not found");
    }
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const song = party.songs.find(s => s.id === songId);
      if (!song) {
        throw new Error("Song not found");
      }
      
      const updatedSongs = party.songs.map(s => {
        if (s.status === "playing") return { ...s, status: "played" as const };
        if (s.id === songId) return { ...s, status: "playing" as const };
        return s;
      });
      
      let newEarnings = party.earnings || 0;
      if (song.status === "pending") {
        newEarnings += song.price;
        await addFunds(song.price);
      }
      
      const updatedParty = {
        ...party,
        songs: updatedSongs,
        earnings: newEarnings
      };
      
      updatePartyInState(updatedParty);
      toast.success(`Now playing: ${song.title} by ${song.artist}`);
    } catch (error: any) {
      console.error("Play song error:", error);
      toast.error(error.message || "Failed to play song");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markSongAsPlayed = async (songId: string, partyId?: string) => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can mark songs as played");
      throw new Error("Only DJs can mark songs as played");
    }
    
    const targetPartyId = partyId || (currentParty?.id || "");
    const party = findPartyById(targetPartyId);
    
    if (!party) {
      toast.error("Party not found");
      throw new Error("Party not found");
    }
    
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const song = party.songs.find(s => s.id === songId);
      if (!song || song.status !== "playing") {
        throw new Error("Song not found or not currently playing");
      }
      
      const updatedSongs = party.songs.map(s => 
        s.id === songId ? { ...s, status: "played" as const } : s
      );
      
      const updatedParty = {
        ...party,
        songs: updatedSongs,
      };
      
      updatePartyInState(updatedParty);
      toast.success(`Marked as played: ${song.title}`);
    } catch (error: any) {
      console.error("Mark song as played error:", error);
      toast.error(error.message || "Failed to mark song as played");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const closeParty = async (partyId: string): Promise<ApiResponse> => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can close parties");
      throw new Error("Only DJs can close parties");
    }

    const partyIdStr = normalizeId(partyId);
    const partyToClose = findPartyById(partyIdStr);
    
    if (!partyToClose) {
      toast.error("Party not found");
      throw new Error("Party not found");
    }
    
    const hasPendingOrPlayingSongs = partyToClose.songs.some(
      s => s.status === "pending" || s.status === "playing"
    );
    
    if (hasPendingOrPlayingSongs) {
      toast.error("Cannot close party with pending or playing songs");
      throw new Error("Cannot close party with pending or playing songs");
    }
    
    setIsLoading(true);
    try {
      const response = await api.delete(`/dj_wallet/delete_hub/${user.id}`);
      console.log("Delete party response:", response);
    
      if (response.status === 200) {
        toast.success(`Party "${partyToClose.name}" closed successfully`);
        
        const updatedParty = {
          ...partyToClose,
          isActive: false,
        };

        if (currentParty && normalizeId(currentParty.id) === partyIdStr) {
          setCurrentParty(null);
        }
        
        if (!createdParties.some(p => normalizeId(p.id) === partyIdStr)) {
          setCreatedParties(prev => [...prev, updatedParty]);
        } else {
          setCreatedParties(prev => prev.map(p => 
            normalizeId(p.id) === partyIdStr ? updatedParty : p
          ));
        }
        
        setJoinedParties(prev => prev.filter(p => normalizeId(p.id) !== partyIdStr));
      }
      
      return response;
    } catch (error: any) {
      console.error("Close party error:", error);
      toast.error(error.message || "Failed to close party");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpiredParties = () => {
    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    if (currentParty && currentParty.activeUntil && now > currentParty.activeUntil) {
      const expiredParty = { ...currentParty, isActive: false };
      
      if (!createdParties.some(p => p.id === currentParty.id)) {
        setCreatedParties(prev => [...prev, expiredParty]);
      } else {
        setCreatedParties(prev => prev.map(p => 
          p.id === currentParty.id ? expiredParty : p
        ));
      }
      
      setCurrentParty(null);
      toast.info("Current party has expired");
    }
  };

  const getPartyQrCode = (partyId: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=jam4me-party-${partyId}`;
  };

  const hasPendingSongs = (partyId: string) => {
    const party = findPartyById(partyId);
    if (!party) return false;
    
    return party.songs.some(s => s.status === "pending" || s.status === "playing");
  };

  return (
    <PartyContext.Provider
      value={{
        currentParty,
        joinedParties,
        createdParties,
        joinParty,
        leaveParty,
        createParty,
        requestSong,
        approveSong,
        declineSong,
        playSong,
        markSongAsPlayed,
        closeParty,
        isLoading,
        getPartyQrCode,
        hasPendingSongs,
        setCurrentParty,
        setCreatedParties,
        handleExpiredParties,
        refreshPartyData,
      }}
    >
      {children}
    </PartyContext.Provider>
  );
}

export function useParty() {
  const context = useContext(PartyContext);
  if (context === undefined) {
    throw new Error("useParty must be used within a PartyProvider");
  }
  return context;
}