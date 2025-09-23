import React, { createContext, useContext, useState, useEffect, ReactNode, Dispatch, SetStateAction } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { useWallet } from "./WalletContext";
import { api } from "../api/apiMethods";
import { normalizeId } from "../components/pages/DjPartyManagementPage";

export type Song = {
  id: string;
  title: string;
  artist: string;
  price: number;
  requestedBy: string;
  status: "pending" | "playing" | "played" | "declined";
  requestedAt: Date;
  albumArt?: string;
};

export type Party = {
  id: string;
  name: string;
  passcode: string;
  location: string;
  dj: string;
  djId: string; // ID of the DJ who created the party
  songs: Song[];
  activeUntil: Date;
  minRequestPrice: number;
  isActive: boolean;
  qrCode?: string; // URL to QR code image
  createdAt: Date;
  earnings?: number; // Total earnings for the party
};

export type PartyContextType = {
  currentParty: Party | null;
  joinedParties: Party[];
  createdParties: Party[]; // For DJs - parties they created
  joinParty: (passcode: string) => Promise<Party>;
  leaveParty: () => void;
  createParty: (partyData: Omit<Party, "id" | "djId" | "songs" | "isActive" | "createdAt">) => Promise<Party>;
  requestSong: (songTitle: string, artist: string, price: number, albumArt?: string) => Promise<void>;
  approveSong: (songId: string, partyId?: string) => Promise<void>;
  declineSong: (songId: string, partyId?: string) => Promise<void>;
  playSong: (songId: string, partyId?: string) => Promise<void>;
  markSongAsPlayed: (songId: string, partyId?: string) => Promise<void>;
  closeParty: (partyId: string) => Promise<void>;
  isLoading: boolean;
  getPartyQrCode: (partyId: string) => string;
  hasPendingSongs: (partyId: string) => boolean;
  setCurrentParty: Dispatch<SetStateAction<Party | null>>;
  setCreatedParties: Dispatch<SetStateAction<Party[]>>;
  handleExpiredParties: () => void;
};

const PartyContext = createContext<PartyContextType | undefined>(undefined);

// Mock data for available parties
const AVAILABLE_PARTIES: Party[] = [
  {
    id: "party-1",
    name: "Friday Night Fever",
    passcode: "123456",
    location: "Club Zoom",
    dj: "DJ Spinmaster",
    djId: "dj-123",
    minRequestPrice: 700,
    songs: [
      {
        id: "song-1",
        title: "Lungu Boy",
        artist: "Asake",
        price: 500,
        requestedBy: "User 1",
        status: "playing",
        requestedAt: new Date(Date.now() - 5 * 60 * 1000)
      },
      {
        id: "song-2",
        title: "Made in Lagos",
        artist: "Wizkid",
        price: 700,
        requestedBy: "User 2",
        status: "pending",
        albumArt: "https://upload.wikimedia.org/wikipedia/en/c/c2/Wizkid_-_Made_in_Lagos.png",
        requestedAt: new Date(Date.now() - 2 * 60 * 1000)
      }
    ],
    activeUntil: new Date(Date.now() + 5 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    earnings: 1200
  },
  {
    id: "party-2",
    name: "Beach Vibes",
    passcode: "654321",
    location: "Sandy Shores Resort",
    dj: "DJ WaveMaker",
    djId: "dj-456",
    minRequestPrice: 500,
    songs: [],
    activeUntil: new Date(Date.now() + 8 * 60 * 60 * 1000),
    isActive: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    earnings: 0
  }
];

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
  const { user } = useAuth();
  const { addFunds, deductFunds } = useWallet();
  const [currentParty, setCurrentParty] = useState<Party | null>(null);
  const [joinedParties, setJoinedParties] = useState<Party[]>([]);
  const [createdParties, setCreatedParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Load joined parties from local storage
      const storedCurrentParty = localStorage.getItem(`jam4me-current-party-${user.id}`);
      const storedJoinedParties = localStorage.getItem(`jam4me-joined-parties-${user.id}`);
      const storedCreatedParties = localStorage.getItem(`jam4me-created-parties-${user.id}`);
      
      if (storedCurrentParty) {
        try {
          let parsedParty = JSON.parse(storedCurrentParty);
          // Convert string dates back to Date objects
          parsedParty.activeUntil = new Date(parsedParty.activeUntil);
          parsedParty.createdAt = new Date(parsedParty.createdAt);
          parsedParty.songs = parsedParty.songs.map((s: any) => ({
            ...s,
            requestedAt: new Date(s.requestedAt)
          }));
          
          // Update any references to "Blinding Lights" by "The Weeknd"
          parsedParty = updateSongReferences(parsedParty);
          
          setCurrentParty(parsedParty);
        } catch (e) {
          console.error("Failed to parse current party", e);
        }
      }
      
      if (storedJoinedParties) {
        try {
          let parsedParties = JSON.parse(storedJoinedParties);
          // Convert string dates back to Date objects
          let formattedParties = parsedParties.map((p: any) => ({
            ...p,
            activeUntil: new Date(p.activeUntil),
            createdAt: new Date(p.createdAt),
            songs: p.songs.map((s: any) => ({
              ...s,
              requestedAt: new Date(s.requestedAt)
            }))
          }));
          
          // Update any references to "Blinding Lights" by "The Weeknd"
          formattedParties = formattedParties.map(updateSongReferences);
          
          setJoinedParties(formattedParties);
        } catch (e) {
          console.error("Failed to parse joined parties", e);
        }
      }

      if (storedCreatedParties && user.userType === "HUB_DJ") {
        try {
          let parsedParties = JSON.parse(storedCreatedParties);
          // Convert string dates back to Date objects
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
        } catch (e) {
          console.error("Failed to parse created parties", e);
        }
      } else if (user.userType === "HUB_DJ") {
        // If DJ is logging in for the first time, assign some mock created parties
        const djParties = AVAILABLE_PARTIES.filter(p => p.djId === user.id);
        if (djParties.length > 0) {
          setCreatedParties(djParties);
        }
      }
    } else {
      // Reset when logged out
      setCurrentParty(null);
      setJoinedParties([]);
      setCreatedParties([]);
    }
  }, [user]);

  const savePartyData = () => {
    if (user) {
      if (currentParty) {
        localStorage.setItem(`jam4me-current-party-${user.id}`, JSON.stringify(currentParty));
      } else {
        localStorage.removeItem(`jam4me-current-party-${user.id}`);
      }
      localStorage.setItem(`jam4me-joined-parties-${user.id}`, JSON.stringify(joinedParties));
      
      if (user.userType === "HUB_DJ") {
        localStorage.setItem(`jam4me-created-parties-${user.id}`, JSON.stringify(createdParties));
      }
    }
  };

  useEffect(() => {
    savePartyData();
  }, [currentParty, joinedParties, createdParties, user]);

  // Helper function to find party by ID
  const findPartyById = (partyId: string): Party | null => {
    // First check if it's the current party
    if (currentParty && normalizeId(currentParty.id) === partyId) {
      return currentParty;
    }
    
    // Then check created parties
    const createdParty = createdParties.find(p => normalizeId(p.id) === partyId);
    if (createdParty) {
      return createdParty;
    }
    
    // Finally check joined parties
    const joinedParty = joinedParties.find(p => normalizeId(p.id) === partyId);
    if (joinedParty) {
      return joinedParty;
    }
    
    return null;
  };

  // Helper function to update a party in all relevant state arrays
  const updatePartyInState = (updatedParty: Party) => {
    // Update current party if needed
    if (currentParty && currentParty.id === updatedParty.id) {
      setCurrentParty(updatedParty);
    }
    
    // Update in createdParties if needed
    if (createdParties.some(p => p.id === updatedParty.id)) {
      setCreatedParties(prev => prev.map(p => p.id === updatedParty.id ? updatedParty : p));
    }
    
    // Update in joinedParties if needed
    if (joinedParties.some(p => p.id === updatedParty.id)) {
      setJoinedParties(prev => prev.map(p => p.id === updatedParty.id ? updatedParty : p));
    }
  };
  
  const joinParty = async (passcode: string): Promise<Party> => {
    setIsLoading(true);
    try {
      console.log("party key: ", passcode)
      const response = await api.post("/user_wallet/jo/_hub/", { pk: Number(passcode) });

      console.log("join party response: ", response)
      
      // Check both available parties and DJ created parties
      const allParties = [...AVAILABLE_PARTIES, ...createdParties];
      const party = allParties.find(p => p.passcode === passcode && p.isActive);
      
      if (!party) {
        throw new Error("Invalid party passcode or party is not active");
      }
      
      // Update any references to "Blinding Lights" by "The Weeknd"
      const updatedParty = updateSongReferences(party);
      
      setCurrentParty(updatedParty);
      
      // Add to joined parties if not already there
      if (!joinedParties.some(p => p.id === updatedParty.id)) {
        setJoinedParties(prev => [...prev, updatedParty]);
      }
      
      return updatedParty;
    } finally {
      setIsLoading(false);
    }
  };

  const leaveParty = () => {
    setCurrentParty(null);
  };

  const createParty = async (partyData: Omit<Party, "id" | "djId" | "songs" | "isActive" | "createdAt">): Promise<Party> => {
    if (!user || user.userType !== "HUB_DJ") {
      throw new Error("Only DJs can create parties");
    }
    
    setIsLoading(true);
    try {
      const payload = {
        dj_id: user.id,
        party_name: partyData.name,
        base_price: partyData.minRequestPrice
      }

      console.log("create party payload: ", payload);
      
      const response = await api.post("/dj_wallet/crt_hub/", payload);
      
      const newParty: Party = {
        ...partyData,
        id: response.data.hub_id,
        djId: user.id,
        dj: user.djName || user.username,
        songs: [],
        isActive: true,
        createdAt: new Date(),
        earnings: 0
      };
      
      setCreatedParties(prev => [newParty, ...prev]);
      setCurrentParty(newParty);
      
      return newParty;
    } finally {
      setIsLoading(false);
    }
  };

  const requestSong = async (songTitle: string, artist: string, price: number, albumArt?: string) => {
    if (!currentParty || !user) {
      throw new Error("Not joined to any party");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Deduct funds from user's wallet
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
      
      // Use the helper function to update state
      updatePartyInState(updatedParty);
      
    } finally {
      setIsLoading(false);
    }
  };

  const approveSong = async (songId: string, partyId?: string) => {
    if (!user || user.userType !== "HUB_DJ") {
      throw new Error("Only DJs can approve songs");
    }
    
    // Determine which party to modify
    const targetPartyId = partyId || (currentParty?.id || "");
    const party = findPartyById(targetPartyId);
    
    if (!party) {
      throw new Error("Party not found");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
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
      
      // Use helper function to update state
      updatePartyInState(updatedParty);
      
      toast.success(`Approved song request: ${song.title}`);
    } finally {
      setIsLoading(false);
    }
  };

  const declineSong = async (songId: string, partyId?: string) => {
    if (!user || user.userType !== "HUB_DJ") {
      throw new Error("Only DJs can decline songs");
    }
    
    // Determine which party to modify
    const targetPartyId = partyId || (currentParty?.id || "");
    const party = findPartyById(targetPartyId);
    
    if (!party) {
      throw new Error("Party not found");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const song = party.songs.find(s => s.id === songId);
      if (!song || song.status !== "pending") {
        throw new Error("Song not found or already processed");
      }
      
      // Refund the user
      await addFunds(song.price);
      
      const updatedSongs = party.songs.map(s => 
        s.id === songId ? { ...s, status: "declined" as const } : s
      );
      
      const updatedParty = {
        ...party,
        songs: updatedSongs,
      };
      
      // Use helper function to update state
      updatePartyInState(updatedParty);
      
      toast.success(`Declined song request: ${song.title}. User refunded ₦${song.price.toLocaleString()}`);
    } finally {
      setIsLoading(false);
    }
  };

  const playSong = async (songId: string, partyId?: string) => {
    if (!user || user.userType !== "HUB_DJ") {
      throw new Error("Only DJs can play songs");
    }
    
    // Determine which party to modify
    const targetPartyId = partyId || (currentParty?.id || "");
    const party = findPartyById(targetPartyId);
    
    if (!party) {
      throw new Error("Party not found");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const song = party.songs.find(s => s.id === songId);
      if (!song) {
        throw new Error("Song not found");
      }
      
      // Mark current playing song as played
      const updatedSongs = party.songs.map(s => {
        if (s.status === "playing") return { ...s, status: "played" as const };
        if (s.id === songId) return { ...s, status: "playing" as const };
        return s;
      });
      
      // Calculate earnings if the song was pending
      let newEarnings = party.earnings || 0;
      if (song.status === "pending") {
        newEarnings += song.price;
        
        // Add the song price to the DJ's wallet
        await addFunds(song.price);
      }
      
      const updatedParty = {
        ...party,
        songs: updatedSongs,
        earnings: newEarnings
      };
      
      // Use helper function to update state
      updatePartyInState(updatedParty);
      
      toast.success(`Now playing: ${song.title} by ${song.artist}`);
    } finally {
      setIsLoading(false);
    }
  };

  const markSongAsPlayed = async (songId: string, partyId?: string) => {
    if (!user || user.userType !== "HUB_DJ") {
      throw new Error("Only DJs can mark songs as played");
    }
    
    // Determine which party to modify
    const targetPartyId = partyId || (currentParty?.id || "");
    const party = findPartyById(targetPartyId);
    
    if (!party) {
      throw new Error("Party not found");
    }
    
    setIsLoading(true);
    try {
      // Simulate API call
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
      
      // Use helper function to update state
      updatePartyInState(updatedParty);
      
      toast.success(`Marked song as played: ${song.title}`);
    } finally {
      setIsLoading(false);
    }
  };

  const closeParty = async (partyId: string) => {
    if (!user || user.userType !== "HUB_DJ") {
      throw new Error("Only DJs can close parties");
    }

    const partyIdStr = normalizeId(partyId)

    console.log("close party: ", { partyId, partyIdStr})
    
    const partyToClose = findPartyById(partyIdStr);
    if (!partyToClose) {
      throw new Error("Party not found");
    }
    
    const hasPendingOrPlayingSongs = partyToClose.songs.some(s => s.status === "pending" || s.status === "playing");
    if (hasPendingOrPlayingSongs) {
      throw new Error("Cannot close party with pending or playing songs");
    }
    
    setIsLoading(true);
    try {
      const response = await api.delete(`/dj_wallet/delete_hub/${partyIdStr}`);

      console.log("delete party", response);
      
      const updatedParty = {
        ...partyToClose,
        isActive: false,
      };
      
      // Use helper function to update state
      // updatePartyInState(updatedParty);

      // If this was the current party, clear it
      if (currentParty && normalizeId(currentParty.id) === partyIdStr) {
        setCurrentParty(null);
      }
      
      // Update existing entry in createdParties
      if (!createdParties.some(p => normalizeId(p.id) === partyIdStr)) {
        setCreatedParties(prev => [...prev, updatedParty]);
      } else {
        setCreatedParties(prev => prev.map(p => normalizeId(p.id) === partyIdStr ? updatedParty : p));
      }
      
      // Remove from joinedParties if it exists there
      setJoinedParties(prev => prev.filter(p => normalizeId(p.id) !== partyIdStr));
      
      toast.success(`Party "${partyToClose.name}" has been closed successfully`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpiredParties = () => {
    const now = new Date();
    
    // Check and handle expired current party
    if (currentParty && currentParty.activeUntil && now > currentParty.activeUntil) {
      const expiredParty = { ...currentParty, isActive: false };
      
      // Move to created parties if not already there
      if (!createdParties.some(p => p.id === currentParty.id)) {
        setCreatedParties(prev => [...prev, expiredParty]);
      } else {
        setCreatedParties(prev => prev.map(p => 
          p.id === currentParty.id ? expiredParty : p
        ));
      }
      
      // Clear current party
      setCurrentParty(null);
    }
    
    // Update expired parties in joinedParties
    setJoinedParties(prev => prev.map(party => 
      party.activeUntil && now > party.activeUntil 
        ? { ...party, isActive: false }
        : party
    ));
    
    // Update expired parties in createdParties
    setCreatedParties(prev => prev.map(party => 
      party.activeUntil && now > party.activeUntil 
        ? { ...party, isActive: false }
        : party
    ));
  };

  const getPartyQrCode = (partyId: string) => {
    // In a real app, this would generate or fetch a QR code
    // For now, just return a placeholder URL
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