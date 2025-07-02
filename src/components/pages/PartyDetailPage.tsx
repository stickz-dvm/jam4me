import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useParty } from "../../context/PartyContext";
import { useWallet } from "../../context/WalletContext";
import { useSpotify } from "../../context/SpotifyContext";
import { SpotifyTrack } from "../../services/SpotifyService";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "../ui/dialog";
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
  User,
  MapPin
} from "lucide-react";
import { NairaSign } from "../icons/NairaSign";
import { SpotifySearch } from "../SpotifySearch";
import { SongCard } from "../SongCard";
import { MusicPlayer } from "../MusicPlayer";
import { toast } from "sonner";

export function PartyDetailPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const { user, isDj } = useAuth();
  const { 
    currentParty, 
    requestSong, 
    leaveParty, 
    isLoading, 
    approveSong, 
    declineSong,
    playSong,
    markSongAsPlayed,
    closeParty,
    hasPendingSongs,
    getPartyQrCode
  } = useParty();
  const { balance } = useWallet();
  const { searchTracks } = useSpotify();
  
  // State variables
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
  
  // Helper function to get initials from a name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };
  
  // Check if user is a DJ and it's their party
  const isDjParty = isDj && currentParty?.djId === user?.id;

  // Mock DJ avatar URL - in a real app, this would come from the backend
  const getDjAvatarUrl = () => {
    // Generate a consistent avatar for the same DJ
    if (currentParty) {
      const djId = currentParty.djId;
      // This creates a unique but consistent avatar for each DJ ID
      return `https://api.dicebear.com/7.x/avataaars/svg?seed=${djId}`;
    }
    return undefined;
  };

  useEffect(() => {
    if (!currentParty) {
      // If no party is selected, navigate back to appropriate page
      navigate(isDj ? "/dj/dashboard" : "/parties");
    } else {
      // Set initial price to the minimum price set by the DJ
      setPrice(currentParty.minRequestPrice || 1000);
      setMinRequestPrice(currentParty.minRequestPrice || 1000);
    }
  }, [currentParty, navigate, isDj]);
  
  useEffect(() => {
    if (currentParty && currentParty.songs.length > 0) {
      const playingSong = currentParty.songs.find(song => song.status === "playing");
      if (playingSong) {
        setCurrentlyPlaying(playingSong);
        setIsPlaying(true);
      }
    }
  }, [currentParty]);

  // Set active tab based on which section has songs
  useEffect(() => {
    if (queuedSongs.length > 0) {
      setActiveTab("queue");
    } else if (playedSongs.length > 0) {
      setActiveTab("played");
    }
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsSearching(true);
      setSearchPerformed(true);
      const results = await searchTracks(searchQuery);
      setSearchResults(results || []);
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
    toast.success(`Selected "${track.name}" by ${track.artists && track.artists.length > 0 ? track.artists.map(a => a.name).join(", ") : "Unknown Artist"}`, {
      duration: 2000,
      className: "glass"
    });
  };
  
  const handleRequestSong = async () => {
    if (!selectedTrack) return;
    
    try {
      await requestSong(
        selectedTrack.name, 
        selectedTrack.artists && selectedTrack.artists.length > 0 ? selectedTrack.artists[0].name : "Unknown Artist", 
        price,
        selectedTrack.album?.images?.[0]?.url
      );
      setSelectedTrack(null);
      setPrice(currentParty?.minRequestPrice || 1000);
      toast.success("Song requested successfully! The DJ will review your request.");
    } catch (error) {
      console.error("Error requesting song:", error);
      toast.error("Failed to request song. Please try again.");
    }
  };
  
  const handlePriceChange = (values: number[]) => {
    setPrice(values[0]);
  };

  const handleMinPriceChange = (values: number[]) => {
    setMinRequestPrice(values[0]);
  };

  // DJ actions
  const handlePlaySong = async (songId: string) => {
    try {
      await playSong(songId);
      toast.success("Now playing the selected song");
      // Switch to the played tab when there are no more queue songs
      if (queuedSongs.length <= 1) {
        setActiveTab("played");
      }
    } catch (error) {
      console.error("Error playing song:", error);
      toast.error("Failed to play song. Please try again.");
    }
  };

  const handleDeclineSong = async (songId: string) => {
    try {
      await declineSong(songId);
      toast.success("Song request declined and refunded");
    } catch (error) {
      console.error("Error declining song:", error);
      toast.error("Failed to decline song. Please try again.");
    }
  };

  const handleMarkAsPlayed = async (songId: string) => {
    try {
      await markSongAsPlayed(songId);
      toast.success("Song marked as played");
      // Switch to the played tab when the current song is marked as played
      setActiveTab("played");
    } catch (error) {
      console.error("Error marking song as played:", error);
      toast.error("Failed to mark song as played. Please try again.");
    }
  };

  const handleCloseParty = async () => {
    if (!currentParty) return;
    
    try {
      setIsClosing(true);
      await closeParty(currentParty.id);
      toast.success("Party closed successfully");
      navigate("/dj/dashboard");
    } catch (error) {
      console.error("Error closing party:", error);
      toast.error(error.message || "Failed to close party. Please try again.");
    } finally {
      setIsClosing(false);
    }
  };

  const handleUpdateMinPrice = async () => {
    // This would call an API to update the minimum price
    // For now, we'll just simulate it
    setIsUpdatingPrice(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the current party with new minimum price
      if (currentParty) {
        const updatedParty = {
          ...currentParty,
          minRequestPrice: minRequestPrice
        };
        setCurrentParty(updatedParty);
      }
      
      toast.success(`Minimum request price updated to ₦${minRequestPrice.toLocaleString()}`);
      setShowPriceDialog(false);
    } catch (error) {
      toast.error("Failed to update minimum price");
    } finally {
      setIsUpdatingPrice(false);
    }
  };

  // Copy party passcode to clipboard
  const copyPasscodeToClipboard = () => {
    if (currentParty) {
      navigator.clipboard.writeText(currentParty.passcode);
      toast.success("Passcode copied to clipboard!");
    }
  };

  // Filter songs by status
  const nowPlayingSongs = currentParty?.songs?.filter(song => song.status === "playing") || [];
  const queuedSongs = currentParty?.songs?.filter(song => song.status === "pending") || [];
  const playedSongs = currentParty?.songs?.filter(song => song.status === "played") || [];
  const hasPendingAcceptedSongs = currentParty ? hasPendingSongs(currentParty.id) : false;
  
  // Log song counts to help debug
  useEffect(() => {
    if (currentParty) {
      console.log({
        partyName: currentParty.name,
        totalSongs: currentParty.songs?.length || 0,
        playing: nowPlayingSongs.length,
        queued: queuedSongs.length,
        played: playedSongs.length
      });
    }
  }, [currentParty, nowPlayingSongs.length, queuedSongs.length, playedSongs.length]);

  if (!currentParty) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Different layouts for DJ vs regular user
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
            <Button 
              variant="outline"
              onClick={() => setShowQRDialog(true)}
            >
              <QrCode className="mr-2 h-4 w-4" />
              Show QR
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowPriceDialog(true)}
            >
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
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
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>Ends at: {new Date(currentParty.activeUntil).toLocaleString('en-NG', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}</span>
              </div>
            </div>
          </div>

          {isDj && (
            <Badge className="bg-accent text-accent-foreground">
              DJ MODE
            </Badge>
          )}
        </div>
      </motion.div>
      
      {currentlyPlaying && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="mb-4 flex items-center text-xl font-semibold">
            <Music className="mr-2 h-5 w-5 text-accent" /> Now Playing
          </h2>
          <MusicPlayer
            song={{
              id: currentlyPlaying.id,
              title: currentlyPlaying.title,
              artist: currentlyPlaying.artist,
              albumArt: currentlyPlaying.albumArt || undefined,
              duration: 180000, // Placeholder duration (3 minutes)
            }}
            isPlaying={isPlaying}
          />
          
          {/* DJ Controls for currently playing song */}
          {isDj && (
            <div className="mt-4 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleMarkAsPlayed(currentlyPlaying.id)}
                className="gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Played
              </Button>
            </div>
          )}
          
          <p className="mt-2 text-sm text-muted-foreground">
            <span className="text-accent">Note:</span> {isDj 
              ? "You can mark songs as played when they finish or decline song requests."
              : "Only the DJ can control what's playing. Request songs below to add them to the queue."
            }
          </p>
        </motion.div>
      )}
      
      {/* For regular users: Request a Song section */}
      {!isDj && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="mb-4 text-xl font-semibold">Request a Song</h2>
          <Card className="relative overflow-hidden border-2 border-primary shadow-[0_0_25px_rgba(59,130,246,0.5)] animate-pulse-blue" style={{ background: "linear-gradient(135deg, #0c4a6e 0%, #0284c7 100%)" }}>
            {/* Colorful corner accent */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-400 via-blue-500/50 to-transparent transform rotate-45 translate-x-12 -translate-y-12 z-0 opacity-80"></div>
            
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center text-white">
                <Music className="mr-2 h-5 w-5 text-blue-300" />
                Find a Song
              </CardTitle>
              <CardDescription className="text-blue-100">
                Search for a song to request from the DJ
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10">
              {/* Minimum Price Notice */}
              <div className="mb-4 p-3 bg-blue-950/70 rounded-md flex items-start gap-3 shadow-inner border border-blue-400/30">
                <AlertCircle className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-white">
                    DJ Minimum Request Price: ₦{currentParty.minRequestPrice?.toLocaleString() || "1,000"}
                  </p>
                  <p className="text-xs text-blue-200 mt-1">
                    This is the minimum amount set by the DJ for song requests. Higher bids get priority in the queue.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search for Nigerian hits, artists or albums..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-blue-900/80 backdrop-blur-sm shadow-inner text-white border-blue-500/30 placeholder:text-blue-300/70"
                  />
                  <Button 
                    onClick={handleSearch} 
                    disabled={isSearching || !searchQuery.trim()}
                    className="bg-[rgba(43,110,255,1)] text-white hover:bg-blue-4 bg-[rgba(43,78,255,1)] bg-[rgba(71,43,255,1)]00 shadow-md"
                  >
                    {isSearching ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="mr-2 h-4 w-4" />
                    )}
                    Search
                  </Button>
                </div>
                
                {searchPerformed && searchResults.length === 0 && !isSearching && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 rounded-md bg-blue-950/80 text-center"
                  >
                    <XCircle className="mx-auto mb-2 h-8 w-8 text-blue-300" />
                    <h4 className="font-medium text-white">No songs found</h4>
                    <p className="text-sm text-blue-200">
                      We couldn't find any songs matching "{searchQuery}". Try different keywords or check the spelling.
                    </p>
                  </motion.div>
                )}
                
                <SpotifySearch 
                  results={searchResults} 
                  onSelect={handleTrackSelect}
                  isLoading={isSearching} 
                />
                
                {selectedTrack && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 overflow-hidden rounded-lg bg-blue-900/80 p-4 backdrop-blur-sm border border-blue-400/30 shadow-lg"
                  >
                    <div className="flex items-center gap-4">
                      {selectedTrack.album && selectedTrack.album.images && selectedTrack.album.images[0]?.url ? (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          <img 
                            src={selectedTrack.album.images[0].url} 
                            alt={selectedTrack.album.name || "Album cover"}
                            className="music-poster h-20 w-20 object-cover rounded-md shadow-lg"
                          />
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0.9 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="flex h-20 w-20 items-center justify-center rounded-md bg-blue-800"
                        >
                          <Music className="h-8 w-8 text-blue-300" />
                        </motion.div>
                      )}
                      <div>
                        <h3 className="font-medium text-white text-lg">{selectedTrack.name}</h3>
                        <p className="text-sm text-blue-200">
                          {selectedTrack.artists && selectedTrack.artists.length > 0 
                            ? selectedTrack.artists.map(a => a.name).join(", ")
                            : "Unknown Artist"}
                        </p>
                        <div className="mt-1 flex items-center text-xs text-blue-300">
                          <Music className="mr-1 h-3 w-3 text-blue-400" />
                          <span>{selectedTrack.album ? selectedTrack.album.name || "Unknown Album" : "Unknown Album"}</span>
                          <span className="mx-1">•</span>
                          <span>{Math.floor((selectedTrack.duration_ms || 0) / 60000)}:{(((selectedTrack.duration_ms || 0) % 60000) / 1000).toFixed(0).padStart(2, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </CardContent>
            
            {selectedTrack && (
              <CardFooter className="flex-col space-y-4 relative z-10">
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-white">
                    <label htmlFor="price" className="text-sm">
                      Request Price (₦)
                    </label>
                    <span className="price-badge text-sm">₦{price.toLocaleString()}</span>
                  </div>
                  <Slider
                    id="price"
                    value={[price]}
                    min={currentParty.minRequestPrice || 500}
                    max={10000}
                    step={100}
                    onValueChange={handlePriceChange}
                    className="w-full"
                  />
                  <p className="text-xs text-blue-200">
                    Higher amount increases the chances of your song being played sooner
                  </p>
                </div>
                
                <div className="w-full">
                  <div className="mb-2 flex justify-between text-sm text-white">
                    <span>Your balance:</span>
                    <span className={price > balance ? "text-red-300 font-medium" : ""}>₦{balance.toLocaleString()}</span>
                  </div>
                  <Button 
                    onClick={handleRequestSong} 
                    disabled={isLoading || price > balance}
                    className="w-full glow-blue"
                    variant="default"
                  >
                    Request for ₦{price.toLocaleString()}
                  </Button>
                  {price > balance && (
                    <div className="mt-2">
                      <div className="mb-2 p-2 rounded-md bg-red-900/30 border border-red-500/30 flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-red-300 font-medium">
                            Insufficient Funds
                          </p>
                          <p className="text-xs text-blue-200">
                            You need additional ₦{(price - balance).toLocaleString()} to request this song
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => navigate("/wallet")}
                        className="w-full gap-2 border-blue-400/50 text-blue-300 hover:bg-blue-800/50"
                      >
                        <Wallet className="h-4 w-4" />
                        Add Funds to Wallet
                      </Button>
                    </div>
                  )}
                </div>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      )}
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="space-y-8"
      >
        {/* Playlist Section with Tabs */}
        <div>
          <h2 className="mb-4 flex items-center text-xl font-semibold">
            <ListMusic className="mr-2 h-5 w-5 text-accent" /> 
            Playlist ({currentParty.songs?.length || 0})
          </h2>
          
          {currentParty.songs && currentParty.songs.length > 0 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger 
                  value="queue" 
                  className="flex items-center gap-2 data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
                >
                  <Clock className="h-4 w-4" /> 
                  In Queue ({queuedSongs.length})
                </TabsTrigger>
                <TabsTrigger 
                  value="played" 
                  className="flex items-center gap-2 data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500"
                >
                  <CheckCircle className="h-4 w-4" /> 
                  Played Songs ({playedSongs.length})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="queue" className="mt-0">
                {queuedSongs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {queuedSongs.map((song) => (
                      <Card key={song.id} className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                        <CardContent className="p-4">
                          <SongCard
                            song={{...song, status: "queued"}}
                            currentlyPlaying={false}
                          />
                          
                          {/* DJ Controls */}
                          {isDj && (
                            <div className="mt-4 pt-4 border-t border-border/50 flex justify-between">
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleDeclineSong(song.id)}
                                className="flex-1 mr-2"
                              >
                                <Ban className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                              <Button 
                                size="sm"
                                variant="default"
                                onClick={() => handlePlaySong(song.id)}
                                className="flex-1"
                              >
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
                  <div className="py-6 text-center bg-card/30 backdrop-blur-sm rounded-lg border border-border/50">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-70" />
                    <p className="text-muted-foreground">
                      No songs in queue. {isDj ? "Waiting for song requests." : "Be the first to request a song!"}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="played" className="mt-0">
                {playedSongs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {playedSongs.map((song) => (
                      <Card key={song.id} className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/20 transition-colors">
                        <CardContent className="p-4">
                          <SongCard
                            song={{...song, status: "played"}}
                            currentlyPlaying={false}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center bg-card/30 backdrop-blur-sm rounded-lg border border-border/50">
                    <CheckCircle className="mx-auto mb-2 h-8 w-8 text-muted-foreground opacity-70" />
                    <p className="text-muted-foreground">
                      No songs have been played yet. {isDj ? "Play some songs from the queue." : "Stay tuned for songs to be played!"}
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          ) : (
            <p className="py-8 text-center text-muted-foreground">
              No songs in the playlist yet. {isDj ? "Waiting for song requests." : "Be the first to request a song!"}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}