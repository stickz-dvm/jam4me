import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useParty } from "../../context/PartyContext";
import { useWallet } from "../../context/WalletContext";
import { useSpotify } from "../../context/SpotifyContext";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { 
  ArrowLeft, 
  Music, 
  Search, 
  QrCode, 
  Loader2, 
  Clock, 
  CheckCircle, 
  ListMusic, 
  XCircle, 
  AlertCircle, 
  Play,
  Ban,
  Settings,
  X,
  Wallet,
  MapPin
} from "lucide-react";
<<<<<<< HEAD
import { SpotifySearch } from "../SpotifySearch";
import { SongCard } from "../SongCard";
import { MusicPlayer } from "../MusicPlayer";
=======
import { SpotifySearch } from "../ui/SpotifySearch";
import { SongCard } from "../ui/SongCard";
import { MusicPlayer } from "../ui/MusicPlayer";
>>>>>>> 9b3b9117a4545a6388ac0d23c6f74b5c30f28d38
import { toast } from "sonner";
import { SpotifyTrack } from "../../services/SpotifyService";

// This is my new price stepper component for the user side.
function PriceStepper({ 
  minPrice, 
  value, 
  onValueChange 
}: { 
  minPrice: number;
  value: number;
  onValueChange: (newValue: number) => void;
}) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleStep = (increment: number) => {
    onValueChange(Math.max(minPrice, value + increment));
  };

  const handleBlur = () => {
    const numValue = parseInt(inputValue);
    if (!isNaN(numValue) && numValue >= minPrice) {
      onValueChange(numValue);
    } else {
      setInputValue(value.toString());
    }
  };
  
  useEffect(() => {
    setInputValue(value.toString());
<<<<<<< HEAD
  }, [value, minPrice]);
=======
  }, [value]);
>>>>>>> 9b3b9117a4545a6388ac0d23c6f74b5c30f28d38

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <label htmlFor="price" className="text-sm text-white">
          Your Offer
        </label>
        
        <div className="flex items-center gap-2 w-1/2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleStep(-100)} 
            className="h-9 w-9 shrink-0 glow-blue"
          >
            -
          </Button>
          
          <div className="relative flex-grow">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₦</span>
            <Input
              id="price"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value.replace(/\D/g, ''))}
              onBlur={handleBlur}
              className="pl-8 text-center text-lg font-bold bg-yellow-900/20 text-yellow-accent border-yellow-accent/30"
              inputMode="numeric"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => handleStep(100)} 
            className="h-9 w-9 shrink-0 glow-blue"
          >
            +
          </Button>
        </div>
      </div>
      <p className="text-xs text-blue-200 text-right w-1/2 ml-auto">
        Higher offers get priority!
      </p>
    </div>
  );
}

export function PartyDetailPage() {
  const { passcode } = useParams();
  const navigate = useNavigate();
  const { user, isDj } = useAuth();
  const { 
    currentParty, 
    joinedParties,
    requestSong, 
    leaveParty, 
    isLoading, 
    approveSong, 
    declineSong,
    playSong,
    markSongAsPlayed,
    closeParty,
    hasPendingSongs,
    getPartyQrCode,
    setCurrentParty,
    fetchPartyByPasscode
  } = useParty();
  const { balance } = useWallet();
  const { searchTracks } = useSpotify();
  
  const [price, setPrice] = useState(1000);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [minRequestPrice, setMinRequestPrice] = useState(1000);
  const [isUpdatingPrice, setIsUpdatingPrice] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showPriceDialog, setShowPriceDialog] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");
  
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  const isDjParty = isDj && currentParty?.djId === user?.id;

  const getDjAvatarUrl = () => {
    if (currentParty) {
      const djId = currentParty.djId;
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${djId}`;
    }
    return undefined;
  };

  useEffect(() => {
    if (currentParty && currentParty.songs.length > 0) {
      const playingSong = currentParty.songs.find(song => song.status === "playing");
      if (playingSong && playingSong.id !== currentlyPlaying?.id) {
        setCurrentlyPlaying(playingSong);
        setIsPlaying(true);
      } else if (!playingSong && currentlyPlaying) {
        setCurrentlyPlaying(null);
        setIsPlaying(false);
      }
    } else if (currentlyPlaying) {
      setCurrentlyPlaying(null);
      setIsPlaying(false);
    }
  }, [currentParty]);

  useEffect(() => {
    if (currentParty) {
      setPrice(currentParty.minRequestPrice || 1000);
      setMinRequestPrice(currentParty.minRequestPrice || 1000);
      return;
    }

    if (!currentParty && passcode) {
      const found = joinedParties.find(
        (p) => String(p.id) === String(passcode)
      );

      if (found) {
        setCurrentParty(found);
        setPrice(found.minRequestPrice || 1000);
        setMinRequestPrice(found.minRequestPrice || 1000);
      } else {
        const timeoutId = setTimeout(() => {
          toast.error("Party not found. Please rejoin from the Parties page.");
          navigate(isDj ? "/dj/dashboard" : "/parties");
        }, 1000);

        return () => clearTimeout(timeoutId);
      }
    }
  }, [currentParty, passcode, joinedParties.length, navigate, isDj]);

  useEffect(() => {
    const loadParty = async () => {
      if (passcode) {
        const party = await fetchPartyByPasscode(passcode);
        setCurrentParty(party);
      }
    };
    loadParty();
  }, [passcode, fetchPartyByPasscode, setCurrentParty]);

  const queuedSongs = currentParty?.songs?.filter(song => song.status === "pending") || [];
  const playedSongs = currentParty?.songs?.filter(song => song.status === "played") || [];

<<<<<<< HEAD
  const queuedSongs = useMemo(
    () => currentParty?.songs?.filter(song => song.status === "pending") || [],
    [currentParty?.songs]
  );

  const playedSongs = useMemo(
    () => currentParty?.songs?.filter(song => song.status === "played") || [],
    [currentParty?.songs]
  );

=======
>>>>>>> 9b3b9117a4545a6388ac0d23c6f74b5c30f28d38
  useEffect(() => {
    if (queuedSongs.length > 0) {
      setActiveTab("queue");
    } else if (playedSongs.length > 0) {
      setActiveTab("played");
    }
  }, [queuedSongs.length, playedSongs.length]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setSearchPerformed(true);
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching tracks:", error);
      toast.error("Failed to search for tracks. Please try again.");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleTrackSelect = (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setSearchResults([]);
    setSearchQuery("");
    setSearchPerformed(false);
    toast.success(`Selected "${track.name}" by ${track.artists.map((a) => a.name).join(", ")}`);
  };
  
  const handleRequestSong = async () => {
    if (!selectedTrack) return;
    
    try {
      await requestSong(
        selectedTrack.name, 
        selectedTrack.artists[0]?.name || "Unknown Artist", 
        price,
        selectedTrack.album?.images?.[0]?.url
      );
      setSelectedTrack(null);
      setPrice(currentParty?.minRequestPrice || 1000);
      toast.success("Song requested successfully!");
    } catch (error) {
      console.error("Error requesting song:", error);
      toast.error("Failed to request song.");
    }
  };

  const handleMinPriceChange = (values: number[]) => {
    setMinRequestPrice(values[0]);
  };

  const handlePlaySong = async (songId: string) => {
    try {
      await playSong(songId);
    } catch (error) {
      toast.error("Failed to play song.");
    }
  };

  const handleDeclineSong = async (songId: string) => {
    try {
      await declineSong(songId);
    } catch (error) {
      toast.error("Failed to decline song.");
    }
  };

  const handleMarkAsPlayed = async (songId: string) => {
    try {
      await markSongAsPlayed(songId);
    } catch (error) {
      toast.error("Failed to mark song as played.");
    }
  };

  const handleCloseParty = async () => {
    if (!currentParty) return;
    
    setIsClosing(true);
    try {
      await closeParty(currentParty.id);
      toast.success("Party closed successfully");
      navigate("/dj/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Failed to close party.");
    } finally {
      setIsClosing(false);
    }
  };

  const handleUpdateMinPrice = async () => {
    setIsUpdatingPrice(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (currentParty) {
        setCurrentParty({ ...currentParty, minRequestPrice });
      }
      toast.success(`Minimum price updated to ₦${minRequestPrice.toLocaleString()}`);
      setShowPriceDialog(false);
    } catch (error) {
      toast.error("Failed to update minimum price");
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  const copyPasscodeToClipboard = () => {
    if (currentParty) {
      navigator.clipboard.writeText(currentParty.passcode);
      toast.success("Passcode copied to clipboard!");
    }
  };

  const nowPlayingSongs = currentParty?.songs?.filter(song => song.status === "playing") || [];
  const hasPendingAcceptedSongs = currentParty ? hasPendingSongs(currentParty.id) : false;

  if (!currentParty) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => navigate(isDj ? "/dj/dashboard" : "/parties")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> 
          {isDj ? "Back to Dashboard" : "Back to Parties"}
        </Button>
        
        {isDj ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowQRDialog(true)}>
              <QrCode className="mr-2 h-4 w-4" />
              Show QR
            </Button>
            <Button variant="outline" onClick={() => setShowPriceDialog(true)}>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button 
              variant="destructive"
              onClick={handleCloseParty}
              disabled={isClosing || hasPendingAcceptedSongs}
            >
              {isClosing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <X className="mr-2 h-4 w-4" />}
              {hasPendingAcceptedSongs ? "Can't Close Yet" : "Close Party"}
            </Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => leaveParty()}>
            Leave Party
          </Button>
        )}
      </div>
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="mb-2 text-3xl font-bold gradient-text">{currentParty.name}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center">
                <Avatar className="mr-2 h-6 w-6 border border-primary/20">
                  <AvatarImage src={getDjAvatarUrl()} alt={currentParty.dj} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(currentParty.dj)}
                  </AvatarFallback>
                </Avatar>
                <span>DJ: {currentParty.dj}</span>
              </div>
              <div className="flex items-center">
                <QrCode className="mr-1 h-4 w-4" />
                <span>Passcode: {currentParty.passcode}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span>Venue: {currentParty.location}</span>
              </div>
            </div>
          </div>
          {isDj && <Badge className="bg-accent text-accent-foreground">DJ MODE</Badge>}
        </div>
      </motion.div>
      
      {currentlyPlaying && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mb-8">
          <h2 className="mb-4 flex items-center text-xl font-semibold">
            <Music className="mr-2 h-5 w-5 text-accent" /> Now Playing
          </h2>
          <MusicPlayer song={currentlyPlaying} isPlaying={isPlaying} />
          {isDj && (
            <div className="mt-4 flex justify-end">
              <Button size="sm" variant="outline" onClick={() => handleMarkAsPlayed(currentlyPlaying.id)} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Mark as Played
              </Button>
            </div>
          )}
        </motion.div>
      )}
      
      {!isDj && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="mb-8">
          <h2 className="mb-4 text-xl font-semibold">Request a Song</h2>
          <Card className="relative overflow-hidden border-2 border-primary shadow-[0_0_25px_rgba(59,130,246,0.5)]" style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)" }}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400 via-blue-500/50 to-transparent transform rotate-45 translate-x-12 -translate-y-12 z-0 opacity-80"></div>
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-white"><Music className="mr-2 h-5 w-5 text-blue-300" />Find a Song</CardTitle>
              <CardDescription className="text-blue-100">Search for a song to request</CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="mb-4 p-3 bg-blue-950/70 rounded-md flex items-start gap-3 shadow-inner border border-blue-400/30">
                <AlertCircle className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">DJ Minimum: ₦{currentParty.minRequestPrice?.toLocaleString() || "1,000"}</p>
                  <p className="text-xs text-blue-200 mt-1">Higher bids get priority in the queue.</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for songs, artists, or albums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-blue-900/80 backdrop-blur-sm shadow-inner text-white border-blue-500/30 placeholder:text-blue-300/70"
                  />
                  <Button onClick={handleSearch} disabled={isSearching || !searchQuery.trim()} className="bg-blue-500 text-white hover:bg-blue-600 shadow-md">
                    {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Search
                  </Button>
                </div>
                {searchPerformed && searchResults.length === 0 && !isSearching && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-md bg-blue-950/80 text-center">
                    <XCircle className="mx-auto mb-2 h-8 w-8 text-blue-300" />
                    <h4 className="font-medium text-white">No songs found</h4>
                    <p className="text-sm text-blue-200">Try different keywords or check the spelling.</p>
                  </motion.div>
                )}
                <SpotifySearch results={searchResults} onSelect={handleTrackSelect} isLoading={isSearching} />
                {selectedTrack && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 overflow-hidden rounded-lg bg-blue-900/80 p-4 backdrop-blur-sm border border-blue-400/30 shadow-lg">
                    <div className="flex items-center gap-4">
                      {selectedTrack.album?.images?.[0]?.url ? (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }}>
                          <img 
                            src={selectedTrack.album.images[0].url} 
                            alt={selectedTrack.album.name || "Album cover"}
                            className="h-20 w-20 object-cover rounded-md shadow-lg"
                          />
                        </motion.div>
                      ) : (
                        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="flex h-20 w-20 items-center justify-center rounded-md bg-blue-800">
                          <Music className="h-8 w-8 text-blue-300" />
                        </motion.div>
                      )}
                      <div>
                        <h3 className="font-medium text-white text-lg">{selectedTrack.name}</h3>
                        <p className="text-sm text-blue-200">{selectedTrack.artists.map(a => a.name).join(", ")}</p>
                        <div className="mt-1 flex items-center text-xs text-blue-300">
                          <Music className="mr-1 h-3 w-3 text-blue-400" />
                          <span>{selectedTrack.album?.name || "Unknown Album"}</span>
                          <span className="mx-1">•</span>
                          <span>{Math.floor(selectedTrack.duration_ms / 60000)}:{((selectedTrack.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
            {selectedTrack && (
              <CardFooter className="flex-col space-y-4 relative z-10">
                <PriceStepper 
                  minPrice={currentParty.minRequestPrice || 500}
                  value={price}
                  onValueChange={setPrice}
                />
                <div className="w-full">
                  <div className="mb-2 flex justify-between text-sm text-white">
                    <span>Your balance:</span>
                    <span className={price > balance ? "text-red-300 font-medium" : ""}>₦{balance.toLocaleString()}</span>
                  </div>
                  <Button onClick={handleRequestSong} disabled={isLoading || price > balance} className="w-full glow-blue" variant="default">
                    Request for ₦{price.toLocaleString()}
                  </Button>
                  {price > balance && (
                    <div className="mt-2">
                      <div className="mb-2 p-2 rounded-md bg-red-900/30 border border-red-500/30 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-red-300 font-medium">Insufficient Funds</p>
                          <p className="text-xs text-blue-200">You need ₦{(price - balance).toLocaleString()} more.</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => navigate("/wallet")} className="w-full gap-2 border-blue-400/50 text-blue-300 hover:bg-blue-800/50">
                        <Wallet className="h-4 w-4" />
                        Add Funds
                      </Button>
                    </div>
                  )}
                </div>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      )}
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="space-y-8">
        <div>
          <h2 className="mb-4 flex items-center text-xl font-semibold">
            <ListMusic className="mr-2 h-5 w-5 text-accent" /> 
            Playlist ({currentParty.songs?.length || 0})
          </h2>
          {currentParty.songs && currentParty.songs.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="queue" className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary">
                  <Clock className="h-4 w-4" /> 
                  In Queue ({queuedSongs.length})
                </TabsTrigger>
                <TabsTrigger value="played" className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
                  <CheckCircle className="h-4 w-4" /> 
                  Played Songs ({playedSongs.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="queue" className="mt-0">
                {queuedSongs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {queuedSongs.map((song) => (
                      <Card key={song.id} className="bg-card/80 backdrop-blur-sm border-border/50">
                        <CardContent className="p-4">
                          <SongCard song={{...song, status: "queued"}} currentlyPlaying={false} />
                          {isDj && (
                            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between">
                              <Button size="sm" variant="destructive" onClick={() => handleDeclineSong(song.id)} className="flex-1 mr-2">
                                <Ban className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                              <Button size="sm" variant="default" onClick={() => handlePlaySong(song.id)} className="flex-1">
                                <Play className="h-4 w-4 mr-2" />
                                Play Next
                              </Button>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center bg-card/30 backdrop-blur-sm rounded-lg">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No songs in queue.</p>
                  </div>
                )}
              </TabsContent>
              <TabsContent value="played" className="mt-0">
                {playedSongs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {playedSongs.map((song) => (
                      <Card key={song.id} className="bg-card/80 backdrop-blur-sm border-border/50">
                        <CardContent className="p-4">
                          <SongCard song={{...song, status: "played"}} currentlyPlaying={false} />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center bg-card/30 backdrop-blur-sm rounded-lg">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No songs have been played yet.</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <p className="py-8 text-center text-muted-foreground">No songs in the playlist yet.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
