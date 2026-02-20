import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef, useMemo } from "react";
import { useAuth } from "./AuthContext";
import { toast } from "sonner";
import { useWallet } from "./WalletContext";
import { api } from "../api/apiMethods";
import { ApiResponse, Party, PartyContextType, Song } from "../api/types";

const PartyContext = createContext<PartyContextType | undefined>(undefined);

export const normalizeId = (id: string | number | undefined | null): string => {
  return id != null ? String(id) : "";
};

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

/**
 * Normalize party data from API response to match internal Party type
 */
const normalizePartyFromAPI = (apiData: any): Party => {
  const data = apiData?.data || apiData;
  const id = String(data.hub_id || data.id || data.passcode || "");

  return {
    id,
    name: data.party_name || data.name || "Untitled Party",
    djId: String(data.dj_id || data.djId || ""),
    dj: data.hub_dj || data.dj || "Unknown DJ",
    location: data.venue_name || data.location || "Unknown Location",
    passcode: String(data.passcode || id),
    minRequestPrice: Number(data.base_price || data.base || data.minRequestPrice || 1000),
    activeUntil: data.time_to_end || data.time || data.activeUntil,
    songs: data.songs?.map((song: any) => ({
      id: String(song.id),
      title: song.title,
      artist: song.artist,
      price: Number(song.price),
      requestedBy: song.requestedBy || song.requested_by,
      status: song.status,
      requestedAt: new Date(song.requestedAt || song.requested_at),
      albumArt: song.albumArt || song.album_art,
    })) || [],
    endDate: data.date_to_end || data.date || data.endDate,
    isActive: data.hub_status ?? data.isActive ?? true,
    createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
    earnings: Number(data.earnings || 0),
  };
};

export function PartyProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { addFunds, deductFunds } = useWallet();
  const [currentParty, setCurrentParty] = useState<Party | null>(null);
  const [nowPlaying, setNowPlaying] = useState<any | null>(null);
  const [joinedParties, setJoinedParties] = useState<Party[]>([]);
  const [createdParties, setCreatedParties] = useState<Party[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const hasFetchedDataRef = useRef(false);
  const lastUserIdRef = useRef<string | null>(null);
  // Track if we should skip the next save (to prevent loops)
  const skipNextSaveRef = useRef(false);

  /**
   * CRITICAL: Save to localStorage immediately
   * This function is called synchronously, no waiting for useEffect
  */
  const saveToLocalStorageNow = useCallback((
    userId: string,
    current: Party | null,
    joined: Party[],
    created: Party[]
  ) => {
    try {
      console.log("Saving to localStorage NOW:", {
        userId,
        currentParty: current?.name || "none",
        currentPartyId: current?.id || "none",
        joinedCount: joined.length,
        joinedPartyIds: joined.map(p => p.id),
        createdCount: created.length
      });

      // Save current party
      if (current) {
        const stringified = JSON.stringify(current);
        localStorage.setItem(`jam4me-current-party-${userId}`, stringified);
        console.log("Saved current party:", current.name, "Size:", stringified.length, "bytes");
      } else {
        localStorage.removeItem(`jam4me-current-party-${userId}`);
        console.log("Removed current party");
      }

      // Save joined parties
      const joinedStringified = JSON.stringify(joined);
      localStorage.setItem(`jam4me-joined-parties-${userId}`, joinedStringified);
      console.log("Saved joined parties:", joined.length, "parties", "Size:", joinedStringified.length, "bytes");
      console.log("Party names:", joined.map(p => p.name).join(", ") || "none");

      // Save created parties (DJ only)
      if (user?.userType === "HUB_DJ") {
        const createdStringified = JSON.stringify(created);
        localStorage.setItem(`jam4me-created-parties-${userId}`, createdStringified);
        console.log("Saved created parties:", created.length);
      }

      // Verify save with detailed check
      const verifyCurrentParty = localStorage.getItem(`jam4me-current-party-${userId}`);
      const verifyJoinedParties = localStorage.getItem(`jam4me-joined-parties-${userId}`);

      if (current && !verifyCurrentParty) {
        console.error("CRITICAL: currentParty save failed!");
      } else if (current && verifyCurrentParty) {
        const parsed = JSON.parse(verifyCurrentParty);
        console.log("VERIFIED currentParty:", parsed.name);
      }

      if (joined.length > 0 && !verifyJoinedParties) {
        console.error("CRITICAL: joinedParties save failed!");
      } else if (joined.length > 0 && verifyJoinedParties) {
        const parsed = JSON.parse(verifyJoinedParties);
        console.log("VERIFIED joinedParties:", parsed.length, "parties");
      }

      console.log("localStorage save completed");
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
      // Check if quota exceeded
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        toast.error("Storage full. Please clear some space.");
      }
    }
  }, [user?.userType]);

  /**
   * Centralized localStorage save function
   * This is the ONLY place that writes to localStorage
   */
  const saveToLocalStorage = useCallback((
    userId: string,
    current: Party | null,
    joined: Party[],
    created: Party[]
  ) => {
    try {
      if (current) {
        localStorage.setItem(`jam4me-current-party-${userId}`, JSON.stringify(current));
      } else {
        localStorage.removeItem(`jam4me-current-party-${userId}`);
      }

      localStorage.setItem(`jam4me-joined-parties-${userId}`, JSON.stringify(joined));

      if (user?.userType === "HUB_DJ") {
        localStorage.setItem(`jam4me-created-parties-${userId}`, JSON.stringify(created));
      }

      console.log("Saved to localStorage:", {
        currentParty: current?.name,
        joinedCount: joined.length,
        createdCount: created.length
      });
    } catch (error) {
      console.error("Failed to save to localStorage:", error);
    }
  }, [user?.userType]);

  /**
   * Load party data from localStorage
   */
  const loadLocalPartyData = useCallback(() => {
    if (!user) {
      console.log("No user, clearing state");
      setCurrentParty(null);
      setJoinedParties([]);
      setCreatedParties([]);
      return;
    }

    try {
      console.log("Loading from localStorage for user:", user.id);

      const storedCurrentParty = localStorage.getItem(`jam4me-current-party-${user.id}`);
      const storedJoinedParties = localStorage.getItem(`jam4me-joined-parties-${user.id}`);
      const storedCreatedParties = localStorage.getItem(`jam4me-created-parties-${user.id}`);

      console.log("Raw localStorage data:", {
        currentParty: storedCurrentParty ? "exists" : "null",
        joinedParties: storedJoinedParties ? "exists" : "null",
        createdParties: storedCreatedParties ? "exists" : "null"
      });

      if (storedCurrentParty) {
        let parsedParty = JSON.parse(storedCurrentParty);
        parsedParty.activeUntil = new Date(parsedParty.activeUntil);
        parsedParty.createdAt = new Date(parsedParty.createdAt);
        parsedParty.songs = parsedParty.songs?.map((s: any) => ({
          ...s,
          requestedAt: new Date(s.requestedAt)
        })) || [];

        parsedParty = updateSongReferences(parsedParty);
        setCurrentParty(parsedParty);
        console.log("Loaded current party:", parsedParty.name);
      }

      if (storedJoinedParties) {
        let parsedParties = JSON.parse(storedJoinedParties);
        let formattedParties = parsedParties.map((p: any) => ({
          ...p,
          activeUntil: new Date(p.activeUntil),
          createdAt: new Date(p.createdAt),
          songs: p.songs?.map((s: any) => ({
            ...s,
            requestedAt: new Date(s.requestedAt)
          })) || []
        }));

        formattedParties = formattedParties.map(updateSongReferences);
        setJoinedParties(formattedParties);
        console.log("Loaded joined parties:", formattedParties.length);
      }

      if (storedCreatedParties && user.userType === "HUB_DJ") {
        let parsedParties = JSON.parse(storedCreatedParties);
        let formattedParties = parsedParties.map((p: any) => ({
          ...p,
          activeUntil: new Date(p.activeUntil),
          createdAt: new Date(p.createdAt),
          songs: p.songs?.map((s: any) => ({
            ...s,
            requestedAt: new Date(s.requestedAt)
          })) || []
        }));

        formattedParties = formattedParties.map(updateSongReferences);
        setCreatedParties(formattedParties);
        console.log("Loaded created parties:", formattedParties.length);
      }

      console.log("All localStorage data loaded successfully");
    } catch (error) {
      console.error("Failed to load from localStorage:", error);
      // Clear corrupted data
      if (user) {
        localStorage.removeItem(`jam4me-current-party-${user.id}`);
        localStorage.removeItem(`jam4me-joined-parties-${user.id}`);
        localStorage.removeItem(`jam4me-created-parties-${user.id}`);
      }
    }
  }, [user]);

  /**
   * Initialize party state on mount and when auth state changes
   */
  useEffect(() => {
    console.log("Auth state changed:", {
      isAuthenticated,
      authLoading,
      userId: user?.id
    });

    hasFetchedDataRef.current = false;
    setIsInitialized(false);

    if (authLoading) {
      console.log("Auth loading, waiting...");
      return;
    }

    if (!isAuthenticated || !user) {
      console.log("Not authenticated, clearing state");
      setCurrentParty(null);
      setJoinedParties([]);
      setCreatedParties([]);
      setIsInitialized(true);
      return;
    }

    console.log("User authenticated, loading data");
    loadLocalPartyData();
    setIsInitialized(true);
  }, [user, isAuthenticated, authLoading, loadLocalPartyData]);

  /**
   * ✨ NEW: Fetch a single party by passcode/ID
   * This is the key method for PartyDetailsPage
   */
  const fetchPartyByPasscode = useCallback(async (passcode?: string): Promise<Party | null> => {
    if (!user || !isAuthenticated) {
      console.warn("Cannot fetch party: User not authenticated");
      return null;
    }

    try {
      setIsLoading(true);
      console.log("Fetching party by passcode:", passcode);

      // First, check localStorage cache
      const cachedParty = joinedParties.find(p => String(p.id) === String(passcode)) ||
        createdParties.find(p => String(p.id) === String(passcode));

      if (cachedParty) {
        console.log("Found party in cache:", cachedParty.name);
        // Still set as current party and save to localStorage
        const formattedParty = updateSongReferences(cachedParty);
        setCurrentParty(formattedParty);
        saveToLocalStorageNow(user.id, formattedParty, joinedParties, createdParties);
        return formattedParty;
      }

      const response = await api.get(`/user_wallet/get/hub/details/${passcode}`);

      console.log("API Response:", response);

      if (response.status === 200 && response.data) {
        // Normalize the API response
        const normalizedParty = normalizePartyFromAPI(response.data.data || response.data);
        const formattedParty = updateSongReferences(normalizedParty);

        console.log("Fetched party:", {
          id: formattedParty.id,
          name: formattedParty.name,
          dj: formattedParty.dj,
          location: formattedParty.location,
          songsCount: formattedParty.songs?.length || 0
        });

        // Update state - set as current party and add to joined parties if not already there
        setCurrentParty(formattedParty);

        const updatedJoinedParties = joinedParties.some(p => String(p.id) === String(formattedParty.id))
          ? joinedParties
          : [...joinedParties, formattedParty];

        setJoinedParties(updatedJoinedParties);

        // Save to localStorage immediately
        console.log("Saving fetched party to localStorage");
        saveToLocalStorageNow(user.id, formattedParty, updatedJoinedParties, createdParties);

        return formattedParty;
      }

      console.warn("Party not found in API response");
      return null;
    } catch (error: any) {
      console.error("Error fetching party:", error);

      // If API fails, try localStorage one more time
      const fallbackParty = joinedParties.find(p => String(p.id) === String(passcode)) ||
        createdParties.find(p => String(p.id) === String(passcode));

      if (fallbackParty) {
        console.log("API failed, using cached party:", fallbackParty.name);
        const formattedParty = updateSongReferences(fallbackParty);
        setCurrentParty(formattedParty);
        return formattedParty;
      }

      if (error.status !== 401 && error.status !== 404) {
        toast.error("Failed to fetch party details");
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, joinedParties, createdParties, saveToLocalStorageNow]);

  const fetchSongList = useCallback(async (hubId: string) => {
    if (!user || !isAuthenticated) return;

    try {
      // Endpoint is always on the dj_wallet side for song management
      const response = await api.post("/dj_wallet/song_list/", { hub_id: hubId });

      if (response.status === 200) {
        const songs = response.data.songs || response.data;
        if (Array.isArray(songs)) {
          const normalizedSongs = songs.map((song: any) => ({
            id: String(song.id || Math.random().toString(36).substr(2, 9)),
            title: song.title || song.song_title,
            artist: song.artist || song.artiste_name,
            price: Number(song.price || 0),
            requestedBy: song.requested_by || song.username,
            status: song.status || "pending",
            requestedAt: new Date(song.requested_at || Date.now()),
            albumArt: song.album_art || song.profile_picture
          }));

          setCurrentParty(prev => {
            if (!prev || String(prev.id) !== String(hubId)) return prev;
            return { ...prev, songs: normalizedSongs };
          });
        }
      }
    } catch (error: any) {
      // Suppress specific backend error noise for song list
      if (error.status !== 500 && error.status !== 404) {
        console.error("Error fetching song list:", error);
      }
    }
  }, [user, isAuthenticated]);

  const fetchNowPlaying = useCallback(async (hubId: string) => {
    if (!user || !isAuthenticated) return;

    try {
      const endpoint = user.userType === "HUB_DJ"
        ? "/dj_wallet/get_now_playing/"
        : "/user_wallet/get_now_playing/";

      const response = await api.post(endpoint, { hub_id: hubId });
      if (response.status === 200) {
        setNowPlaying(response.data);
      }
    } catch (error: any) {
      // Suppress specific backend error noise for now playing
      if (error.status !== 500 && error.status !== 404) {
        console.error("Error fetching now playing:", error);
      }
    }
  }, [user, isAuthenticated]);

  /**
   * Fetch user's joined parties from API
   */
  const fetchJoinedParties = async (): Promise<Party[] | null> => {
    if (!user || !isAuthenticated) {
      console.warn("Cannot fetch joined parties: User not authenticated");
      return null;
    }

    try {
      // Use the appropriate endpoint for hub list/history
      const endpoint = user.userType === "HUB_DJ" ? "/dj_wallet/get_hubs/" : "/user_wallet/get_hubs/";
      const payload = user.userType === "HUB_DJ" ? { dj_id: user.id } : { user_id: user.id };

      const response = await api.post(endpoint, payload);

      if (response.status === 200) {
        const hubs = response.data.hubs || response.data;
        if (Array.isArray(hubs)) {
          return hubs.map(normalizePartyFromAPI);
        }
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching joined parties:", error);
      if (error.status !== 401 && error.status !== 404) {
        toast.error("Failed to fetch joined parties");
      }
      return [];
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
      const response = await api.post("/dj_wallet/get_hubs/", { dj_id: user.id });
      if (response.status === 200) {
        const hubs = response.data.hubs || response.data;
        if (Array.isArray(hubs)) {
          return hubs.map(normalizePartyFromAPI);
        }
      }
      return [];
    } catch (error: any) {
      console.error("Error fetching created parties:", error);
      if (error.status !== 401 && error.status !== 404) {
        toast.error("Failed to fetch created parties");
      }
      return [];
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

      // If there's a current party, refresh its details too
      if (currentParty) {
        await Promise.all([
          fetchSongList(currentParty.id),
          fetchNowPlaying(currentParty.id)
        ]);
      }
    } catch (error) {
      console.error("Error refreshing party data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, authLoading, fetchSongList, fetchNowPlaying]);

  /**
   * Initialize party state on mount and when auth state changes
   */
  useEffect(() => {
    // Reset fetch flag ONLY when user actually changes
    if (user?.id !== lastUserIdRef.current) {
      hasFetchedDataRef.current = false;
      lastUserIdRef.current = user?.id || null;
    }

    if (authLoading) {
      return;
    }

    if (!isAuthenticated || !user) {
      if (isInitialized) {
        setCurrentParty(null);
        setJoinedParties([]);
        setCreatedParties([]);
      } else {
        setIsInitialized(true);
      }
      return;
    }

    // Load local data first
    if (!isInitialized) {
      loadLocalPartyData();
      setIsInitialized(true);
    }

    // Then fetch fresh data from API ONCE
    if (!hasFetchedDataRef.current) {
      hasFetchedDataRef.current = true;
      refreshPartyData();
    }
  }, [user?.id, isAuthenticated, authLoading, loadLocalPartyData, refreshPartyData, isInitialized]);

  /**
   * Save to localStorage whenever party state changes
   */
  useEffect(() => {
    if (!user) return;

    // Skip if we just loaded from localStorage
    if (skipNextSaveRef.current) {
      skipNextSaveRef.current = false;
      return;
    }

    saveToLocalStorage(user.id, currentParty, joinedParties, createdParties);
  }, [currentParty, joinedParties, createdParties, user, saveToLocalStorage]);

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

  const joinParty = useCallback(async (passcode: string): Promise<ApiResponse> => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to join a party");
      throw new Error("Not authenticated");
    }

    console.log("Starting joinParty for passcode:", passcode);
    setIsLoading(true);

    try {
      // We'll try the documented endpoint with the standard prefix
      const currentUserId = user.id;
      // DO NOT use Number() because passcodes can be alphanumeric (e.g. E2OR8X)
      const hubId = passcode;

      console.log("Joining Hub with payload:", { user_id: currentUserId, hub_id: hubId });

      // Try the /user_wallet/ prefix first as it matches other working routes
      const response = await api.post("/user_wallet/jo/_hub/", {
        user_id: currentUserId,
        hub_id: hubId,
        hub_passcode: hubId, // Common variant
        join_code: hubId
      });

      console.log("Join Hub Response (Primary):", response);

      if (response.status === 200) {
        const data = response.data.data || response.data;

        // Create the party object
        const newParty: Party = {
          id: data.passcode || data.id || passcode,
          name: data.party_name || data.name || "Joined Party",
          djId: data.dj_id || data.djId,
          dj: data.hub_dj || data.dj || "Unknown DJ",
          location: data.venue_name || data.location || "Venue",
          passcode: data.passcode || passcode,
          minRequestPrice: Number(data.base_price || 1000),
          activeUntil: data.time_to_end || new Date(Date.now() + 3600000).toISOString(),
          songs: [],
          endDate: data.date_to_end,
          isActive: data.hub_status ?? true,
          createdAt: new Date(),
        };

        const formattedParty = updateSongReferences(newParty);
        console.log("Successfully joined and formatted party:", formattedParty);

        const updatedJoinedParties = joinedParties.some(p => String(p.id) === String(formattedParty.id))
          ? joinedParties
          : [...joinedParties, formattedParty];

        // Save and update state
        saveToLocalStorageNow(user.id, formattedParty, updatedJoinedParties, createdParties);
        setCurrentParty(formattedParty);
        setJoinedParties(updatedJoinedParties);

        toast.success(`Joined party: ${formattedParty.name}`);
        return response;
      }

      return response;
    } catch (error: any) {
      console.error("Join Hub Error Details:", {
        status: error.status,
        message: error.message,
        serverResponse: error.response?.data,
        payloadSent: { user_id: user.id, passcode }
      });

      // If we got a 400, let's try the alternative old endpoint as a last resort
      if (error.status === 400 || error.status === 404) {
        console.log("Primary endpoint failed with 400/404, trying legacy endpoint...");
        try {
          const legacyResponse = await api.post("/user_wallet/jo/_hub/", {
            user_id: user.id,
            join_code: passcode
          });

          if (legacyResponse.status === 200) {
            // Handle successful legacy response logic here...
            toast.success("Joined via legacy gateway");
            // (We would ideally refetch or use standard mapping here)
            return legacyResponse;
          }
        } catch (e) {
          console.error("Legacy endpoint also failed");
        }
      }


      const errorMessage = error.response?.data?.message || error.message || "Failed to join party";
      toast.error(`Error ${error.status || ''}: ${errorMessage}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, joinedParties, createdParties, saveToLocalStorageNow]);

  const leaveParty = useCallback(() => {
    if (!isAuthenticated || !user) {
      toast.error("Please login to leave a party");
      return;
    }

    console.log("Leaving party");
    setCurrentParty(null);
    setJoinedParties([]);

    // Immediately update localStorage
    if (user) {
      saveToLocalStorageNow(user.id, null, joinedParties, createdParties);
    }

    toast.success("Left the party");
  }, [user, isAuthenticated, joinedParties, createdParties, saveToLocalStorageNow]);

  const createParty = useCallback(async (partyData: Omit<Party, "id" | "djId" | "songs" | "passcode" | "createdAt">): Promise<Party> => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can create parties");
      throw new Error("Only DJs can create parties");
    }

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

      const response = await api.post("/dj_wallet/crt_hub/", payload);

      const responseData = response.data.data || response.data;

      // Use normalization to ensure all fields are correct
      const newParty = normalizePartyFromAPI(responseData);

      // Overwrite any fields that might be MISSING from the create response 
      // but were in the initial partyData
      if (!newParty.name) newParty.name = partyData.name;
      if (!newParty.location) newParty.location = partyData.location;
      if (!newParty.minRequestPrice) newParty.minRequestPrice = partyData.minRequestPrice;

      // Ensure DJ info is set
      newParty.djId = user.id;
      newParty.dj = user.djName || user.username;
      newParty.songs = []; // New party has no songs

      const updatedCreatedParties = [newParty, ...createdParties];

      // setCreatedParties(prev => [newParty, ...prev]);
      setCreatedParties(updatedCreatedParties);
      setCurrentParty(newParty);

      saveToLocalStorageNow(user.id, newParty, joinedParties, updatedCreatedParties);

      toast.success(`Party created: ${newParty.name}`);

      return newParty;
    } catch (error: any) {
      console.error("Create party error:", error);
      toast.error(error.message || "Failed to create party");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, createdParties, joinedParties, saveToLocalStorageNow]);

  const requestSong = useCallback(async (songTitle: string, artist: string, price: number, albumArt?: string) => {
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
      // NOTE: Using 'request_song/' endpoint from endpoint.txt
      // Payload: {'song_title': 'string', 'artiste_name': 'string', 'user_id': 'int'}
      await api.post("/request_song/", {
        song_title: songTitle,
        artiste_name: artist,
        user_id: user.id
      });

      // Deduct locally for UI feedback (backup to API handling it)
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
  }, [user, isAuthenticated, currentParty, deductFunds, updatePartyInState]);

  const approveSong = useCallback(async (songId: string, partyId?: string) => {
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
  }, [user, isAuthenticated, currentParty, findPartyById, updatePartyInState]);

  const declineSong = useCallback(async (songId: string, partyId?: string) => {
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
  }, [user, isAuthenticated, currentParty, findPartyById, updatePartyInState, addFunds]);

  const playSong = useCallback(async (songId: string, partyId?: string) => {
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
  }, [user, isAuthenticated, currentParty, findPartyById, updatePartyInState, addFunds]);

  const markSongAsPlayed = useCallback(async (songId: string, partyId?: string) => {
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
  }, [user, isAuthenticated, currentParty, findPartyById, updatePartyInState]);

  const closeParty = useCallback(async (partyId: string): Promise<ApiResponse> => {
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

      if (response.status === 200) {
        toast.success(`Party "${partyToClose.name}" closed successfully`);

        const updatedParty = {
          ...partyToClose,
          isActive: false,
        };

        if (currentParty && normalizeId(currentParty.id) === partyIdStr) {
          setCurrentParty(null);
        }

        setCreatedParties(prev => {
          if (!prev.some(p => normalizeId(p.id) === partyIdStr)) {
            return [...prev, updatedParty];
          }
          return prev.map(p => normalizeId(p.id) === partyIdStr ? updatedParty : p);
        });

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
  }, [user, isAuthenticated, currentParty, findPartyById]);

  const getPartyQrCode = useCallback((partyId: string) => {
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=jam4me-party-${partyId}`;
  }, []);

  const hasPendingSongs = useCallback((partyId: string) => {
    const party = findPartyById(partyId);
    if (!party) return false;

    return party.songs.some(s => s.status === "pending" || s.status === "playing");
  }, [findPartyById]);

  const handleExpiredParties = useCallback(() => {
    // CRITICAL: Use robust Date comparison instead of locale string comparison
    const now = new Date();

    // Check current party for expiration
    if (currentParty && (currentParty.endDate || currentParty.activeUntil)) {
      try {
        let expirationDate: Date | null = null;

        if (currentParty.endDate && currentParty.activeUntil) {
          // Combine date and time
          expirationDate = new Date(`${currentParty.endDate}T${currentParty.activeUntil}`);
        } else if (currentParty.endDate) {
          // Default to end of day if only date
          expirationDate = new Date(`${currentParty.endDate}T23:59:59`);
        }

        if (expirationDate && now > expirationDate) {
          console.log("Party expired based on Date comparison:", {
            party: currentParty.name,
            now: now.toISOString(),
            exhaustedAt: expirationDate.toISOString()
          });

          const expiredParty = { ...currentParty, isActive: false };

          setCreatedParties(prev => {
            if (!prev.some(p => p.id === currentParty.id)) {
              return [...prev, expiredParty];
            }
            return prev.map(p => p.id === currentParty.id ? expiredParty : p);
          });

          setCurrentParty(null);
          toast.info("Your session has expired");
        }
      } catch (e) {
        console.warn("Failed to parse party expiration date:", e);
      }
    }
  }, [currentParty]);

  const updatePartySettings = useCallback(async (partyId: string, settings: Partial<Party>) => {
    if (!isAuthenticated || !user || user.userType !== "HUB_DJ") {
      toast.error("Only DJs can update party settings");
      throw new Error("Only DJs can update party settings");
    }

    setIsLoading(true);
    try {
      const partyIdStr = normalizeId(partyId);
      const party = findPartyById(partyIdStr);
      if (!party) throw new Error("Party not found");

      // Attempt to persist to backend if endpoint exists
      // Given the pattern in ProfilePage.tsx: /dj_wallet/dj/edit/profile/
      // We'll try a similar pattern for hubs
      try {
        const payload: any = {
          dj_id: user.id,
          hub_id: partyId,
        };

        if (settings.minRequestPrice !== undefined) {
          payload.base_price = settings.minRequestPrice;
        }

        if (settings.name !== undefined) {
          payload.party_name = settings.name;
        }

        if (settings.location !== undefined) {
          payload.venue_name = settings.location;
        }

        if (settings.endDate !== undefined) {
          payload.date_to_end = settings.endDate;
        }

        if (settings.activeUntil !== undefined) {
          payload.time_to_end = settings.activeUntil;
        }

        // We'll try this endpoint, but if it fails with 404, we'll just update locally
        // as the backend might not have this specific endpoint yet
        await api.post("/dj_wallet/dj/edit/hub/", payload);
      } catch (apiError: any) {
        console.warn("API persistent update failed, updating locally only:", apiError);
        // If it's a 404, we don't throw, we just let the local update happen
        if (apiError.status !== 404) {
          throw apiError;
        }
      }

      const updatedParty = { ...party, ...settings };
      updatePartyInState(updatedParty);

      // Save to localStorage immediately
      const isCurrent = currentParty && normalizeId(currentParty.id) === partyIdStr;
      const updatedCreated = createdParties.map(p => normalizeId(p.id) === partyIdStr ? updatedParty : p);

      saveToLocalStorageNow(
        user.id,
        isCurrent ? updatedParty : currentParty,
        joinedParties,
        updatedCreated
      );

      toast.success("Settings updated successfully");
    } catch (error: any) {
      console.error("Update party settings error:", error);
      toast.error(error.message || "Failed to update settings");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user, isAuthenticated, currentParty, joinedParties, createdParties, findPartyById, updatePartyInState, saveToLocalStorageNow]);

  const value = useMemo(() => ({
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
    fetchPartyByPasscode,
    updatePartySettings,
    fetchSongList,
    fetchNowPlaying,
    nowPlaying,
  }), [
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
    handleExpiredParties,
    refreshPartyData,
    fetchPartyByPasscode,
    updatePartySettings,
    fetchSongList,
    fetchNowPlaying,
    nowPlaying
  ]);

  return (
    <PartyContext.Provider value={value}>
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