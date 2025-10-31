import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { normalizeId, useParty } from "../../context/PartyContext";
import { useWallet } from "../../context/WalletContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose } from "../ui/dialog";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { 
  ArrowLeft, 
  Music2, 
  QrCode, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Play, 
  Pause,
  BarChart3,
  Share2,
  X,
  AlertTriangle,
  Loader2,
  Ban,
  MapPin
} from "lucide-react";
import { NairaSign } from "../icons/NairaSign";
import { toast } from "sonner";
import { MusicPlayer } from "../MusicPlayer";



export function DjPartyManagementPage() {
  const { partyId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentParty,
    createdParties, 
    approveSong,
    declineSong,
    playSong,
    markSongAsPlayed,
    closeParty,
    getPartyQrCode,
    hasPendingSongs,
    handleExpiredParties,
    isLoading
  } = useParty();

  const [showQRDialog, setShowQRDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showClosePartyDialog, setShowClosePartyDialog] = useState(false);
  const [minRequestPrice, setMinRequestPrice] = useState(1000);
  const [isSaving, setIsSaving] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeTab, setActiveTab] = useState("queue");
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<any | null>(null);
  
  // Get the relevant party - either current party or from createdParties
  const partyIdStr = normalizeId(partyId);
  const party = normalizeId(currentParty?.id) === partyIdStr
    ? currentParty
    : createdParties.find(p => normalizeId(p.id) === partyIdStr);

  // Navigate away if party not found
  useEffect(() => {
    if (!isLoading && !party && partyId) {
      toast.error("Party not found");
      navigate("/dj/dashboard");
    }
  }, [party, partyId, navigate, isLoading]);

  // Initialize state from party data
  useEffect(() => {
    if (party) {
      setMinRequestPrice(party.minRequestPrice || 1000);
      
      // Find currently playing song
      const playingSong = party.songs?.find(song => song.status === "playing");
      
      // Only update if there's a change (different song is playing or no song is playing)
      if (playingSong) {
        // Check if it's a different song than what's currently displayed
        if (!currentlyPlaying || currentlyPlaying.id !== playingSong.id) {
          setCurrentlyPlaying(playingSong);
          setIsPlaying(true);
        }
      } else {
        // No song is playing now
        setCurrentlyPlaying(null);
        setIsPlaying(false);
      }
    }
  }, [party, currentlyPlaying]);

  useEffect(() => {
    handleExpiredParties();
  }, []); // Added dependency array to prevent infinite loop

  // Check if partyId exists
  if (!partyId) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">This party does not exist.</p>
        <Button onClick={() => navigate('/dj/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  // Show loading state when necessary
  if (!party || isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading party details...</p>
        </div>
      </div>
    );
  }

  // Verify that the DJ owns this party
  if (party.djId !== user?.id) {
    return (
      <div className="container mx-auto p-6 text-center">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
        <p className="text-muted-foreground mb-6">You don't have permission to manage this party.</p>
        <Button onClick={() => navigate('/dj/dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  // Handle song actions
  const handlePlaySong = async (songId: string) => {
    try {
      // Find the song that's being played
      const songToPlay = party.songs.find(s => s.id === songId);
      if (!songToPlay) {
        throw new Error("Song not found");
      }
      
      // Pass the partyId explicitly to the playSong function
      await playSong(songId, partyId);
      
      // Manually update the currentlyPlaying state for immediate UI update
      setCurrentlyPlaying(songToPlay);
      setIsPlaying(true);
      
      toast.success(`Now playing: ${songToPlay.title} by ${songToPlay.artist}`);
    } catch (error: any) {
      console.error("Error playing song:", error);
      toast.error(error.message || "Failed to play song. Please try again.");
    }
  };

  const handleDeclineSong = async (songId: string) => {
    try {
      // Pass the partyId explicitly to the declineSong function
      await declineSong(songId, partyId);
      toast.success("Song declined and refunded to user");
    } catch (error: any) {
      console.error("Error declining song:", error);
      toast.error(error.message || "Failed to decline song. Please try again.");
    }
  };

  const handleMarkAsPlayed = async (songId: string) => {
    try {
      // Pass the partyId explicitly to the markSongAsPlayed function
      await markSongAsPlayed(songId, partyId);
      toast.success("Song marked as played");
    } catch (error: any) {
      console.error("Error marking song as played:", error);
      toast.error(error.message || "Failed to update song status. Please try again.");
    }
  };

  const handleUpdateMinPrice = async () => {
    setIsSaving(true);
    try {
      // Simulate API call for updating min price
      await new Promise(resolve => setTimeout(resolve, 800));
      
      toast.success(`Minimum request price updated to ₦${minRequestPrice.toLocaleString()}`);
      setShowSettingsDialog(false);
    } catch (error: any) {
      console.error("Error updating party settings:", error);
      toast.error("Failed to update settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCloseParty = async () => {
    if (hasPendingSongs(partyId as string)) {
      toast.error("Cannot close party with pending accepted songs");
      setShowClosePartyDialog(false);
      return;
    }

    setIsClosing(true);
    try {
      const response = await closeParty(partyId as string);
      if (response.status === 200 && response.data.message.includes("Closed")) {
        toast.success("Party closed successfully");
        navigate("/dj/dashboard");
      }
    } catch (error: any) {
      console.error("Error closing party:", error);
      toast.error("Failed to close party. Please try again.");
    } finally {
      setIsClosing(false);
      setShowClosePartyDialog(false);
    }
  };

  // Copy party passcode to clipboard
  const copyPasscodeToClipboard = () => {
    if (party) {
      navigator.clipboard.writeText(party.passcode);
      toast.success("Passcode copied to clipboard!");
    }
  };

  // Filter songs by status - directly from party data to stay in sync
  const pendingSongs = party.songs?.filter(song => song.status === "pending") || [];
  const playingSongs = party.songs?.filter(song => song.status === "playing") || [];
  const playedSongs = party.songs?.filter(song => song.status === "played") || [];

  // Sort pending songs by price (highest first)
  const sortedPendingSongs = [...pendingSongs].sort((a, b) => b.price - a.price);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            className="mr-2" 
            onClick={() => navigate("/dj/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowQRDialog(true)}
          >
            <QrCode className="h-4 w-4 mr-2" />
            QR Code
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => setShowSettingsDialog(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          
          <Button 
            variant="destructive"
            onClick={() => setShowClosePartyDialog(true)}
          >
            <X className="h-4 w-4 mr-2" />
            Close Party
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">{party.name}</h1>
            <div className="flex flex-wrap gap-4 text-muted-foreground">
              <div className="flex items-center">
                <Music2 className="mr-1 h-4 w-4" />
                <span>DJ: {party.dj || user?.djName}</span>
              </div>
              <div className="flex items-center">
                <QrCode className="mr-1 h-4 w-4" />
                <span>Passcode: {party.passcode}</span>
              </div>
              <div className="flex items-center">
                <NairaSign className="mr-1 h-4 w-4" />
                <span>Min. Request: ₦{party.minRequestPrice?.toLocaleString() || "1,000"}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="mr-1 h-4 w-4" />
                <span>Venue: {party.location}</span>
              </div>
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                <span>Ends at: {new Date(party.activeUntil).toLocaleString('en-NG', {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}</span>
              </div>
            </div>
          </div>

          <Badge className="bg-accent text-accent-foreground">
            DJ MODE
          </Badge>
        </div>
      </motion.div>

      {/* Now Playing Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4 flex items-center">
          <Music2 className="mr-2 h-5 w-5 text-accent" /> Now Playing
        </h2>
        
        {currentlyPlaying ? (
          <div className="mb-6">
            <MusicPlayer
              song={{
                id: currentlyPlaying.id,
                title: currentlyPlaying.title,
                artist: currentlyPlaying.artist,
                albumArt: currentlyPlaying.albumArt,
                duration: 180000, // Placeholder duration (3 minutes)
              }}
              isPlaying={isPlaying}
            />
            
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkAsPlayed(currentlyPlaying.id)}
                className="mr-2"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Played
              </Button>
              
              <Button
                variant={isPlaying ? "default" : "ghost"}
                size="sm"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <Card className="bg-muted/10 backdrop-blur-sm border-border/50">
            <CardContent className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-muted/20 p-4 mb-4">
                <Music2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-medium mb-2">No song playing</h3>
              <p className="text-muted-foreground text-center mb-6">
                Start playing a song from the queue below
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>

      {/* Tabs for Queue Management */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="mb-8"
      >
        <Tabs defaultValue="queue" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="queue" className="relative">
                Queue
                {pendingSongs.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {pendingSongs.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">
                History
                {playedSongs.length > 0 && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    ({playedSongs.length})
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Queue Tab */}
          <TabsContent value="queue" className="mt-0">
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  Pending Song Requests
                </CardTitle>
                <CardDescription>
                  Manage song requests from party-goers
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sortedPendingSongs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {sortedPendingSongs.map((song) => (
                      <Card key={song.id} className="bg-muted/10 backdrop-blur-sm border-accent/10 transition-all">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-16 h-16 overflow-hidden rounded-md shrink-0 bg-muted/30">
                              {song.albumArt ? (
                                <img 
                                  src={song.albumArt} 
                                  alt={`${song.title} cover`}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <Music2 className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-grow">
                              <h4 className="font-medium text-base mb-1">{song.title}</h4>
                              <p className="text-sm text-muted-foreground">{song.artist}</p>
                              <div className="flex items-center mt-2">
                                <Badge className="price-badge border-none">
                                  ₦{song.price?.toLocaleString() || 0}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-2">
                                  Requested by {song.requestedBy?.substring(0, 8) || "Guest"}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2 justify-end">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeclineSong(song.id)}
                            >
                              <Ban className="h-4 w-4 mr-2" />
                              Decline
                            </Button>
                            <Button 
                              variant="default" 
                              size="sm"
                              onClick={() => handlePlaySong(song.id)}
                            >
                              <Play className="h-4 w-4 mr-2" />
                              Play Now
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="rounded-full bg-muted/20 w-12 h-12 mx-auto flex items-center justify-center mb-3">
                      <Music2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No song requests in queue</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Share your party code to start receiving requests
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* History Tab */}
          <TabsContent value="history" className="mt-0">
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-muted-foreground" />
                  Played Songs
                </CardTitle>
                <CardDescription>
                  History of played songs in this party
                </CardDescription>
              </CardHeader>
              <CardContent>
                {playedSongs.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {playedSongs.map((song) => (
                      <Card key={song.id} className="bg-muted/10 backdrop-blur-sm">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 overflow-hidden rounded-md shrink-0 bg-muted/30">
                              {song.albumArt ? (
                                <img 
                                  src={song.albumArt} 
                                  alt={`${song.title} cover`}
                                  className="w-full h-full object-cover opacity-80"
                                />
                              ) : (
                                <div className="flex items-center justify-center w-full h-full">
                                  <Music2 className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-base mb-1">{song.title}</h4>
                              <p className="text-sm text-muted-foreground">{song.artist}</p>
                              <div className="flex items-center mt-2">
                                <Badge variant="outline" className="bg-muted/20">
                                  ₦{song.price?.toLocaleString() || 0}
                                </Badge>
                                <span className="text-xs text-muted-foreground ml-2">
                                  Played {new Date(song.requestedAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="rounded-full bg-muted/20 w-12 h-12 mx-auto flex items-center justify-center mb-3">
                      <Music2 className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">No songs have been played yet</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Play songs from the queue to see them here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Stats Tab */}
          <TabsContent value="stats" className="mt-0">
            <Card className="bg-card/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                  Party Statistics
                </CardTitle>
                <CardDescription>
                  Overview of your party's performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-1">Total Requests</p>
                    <div className="flex items-center">
                      <Music2 className="h-5 w-5 mr-2 text-primary" />
                      <span className="text-2xl font-bold">{party.songs?.length || 0}</span>
                    </div>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-1">Total Earnings</p>
                    <div className="flex items-center">
                      <NairaSign className="h-5 w-5 mr-2 text-green-500" />
                      <span className="text-2xl font-bold">₦{(party.earnings || 0).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="bg-muted/20 p-4 rounded-lg">
                    <p className="text-muted-foreground text-sm mb-1">Songs Played</p>
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-accent" />
                      <span className="text-2xl font-bold">{playedSongs.length}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-3">Top Requesters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Placeholder for top requesters - in a real app would calculate this */}
                    <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                          1
                        </div>
                        <div>
                          <p className="font-medium">User 0x8f4e...2a1b</p>
                          <p className="text-sm text-muted-foreground">₦5,000 total spent</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Requested</p>
                        <p className="font-medium">5 songs</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between bg-muted/20 p-3 rounded-lg">
                      <div className="flex items-center">
                        <div className="bg-primary/20 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                          2
                        </div>
                        <div>
                          <p className="font-medium">User 0x3d2c...9f7a</p>
                          <p className="text-sm text-muted-foreground">₦3,200 total spent</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Requested</p>
                        <p className="font-medium">3 songs</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* QR Code Dialog */}
      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Party QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code for your party: {party.name}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <div className="w-64 h-64 bg-white p-3 rounded-lg shadow-lg mb-6">
              <img 
                src={getPartyQrCode(party.id)} 
                alt="Party QR Code" 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-center">
                <p className="text-muted-foreground mb-1">Passcode</p>
                <div className="flex items-center gap-2">
                  <span className="text-3xl font-mono font-bold tracking-widest bg-muted/30 px-4 py-2 rounded">
                    {party.passcode}
                  </span>
                  <Button size="sm" variant="outline" onClick={copyPasscodeToClipboard}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button>Done</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Party Settings</DialogTitle>
            <DialogDescription>
              Adjust settings for your party
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="font-medium">Minimum Song Request Price (₦)</label>
                <div className="flex items-center">
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <NairaSign className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <input 
                      type="text"
                      value={minRequestPrice.toLocaleString()}
                      onChange={(e) => {
                        // Strip commas and non-numeric characters
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        const numValue = parseInt(value);
                        if (!isNaN(numValue)) {
                          setMinRequestPrice(numValue);
                        } else if (value === '') {
                          setMinRequestPrice(0);
                        }
                      }}
                      onBlur={() => {
                        // Ensure minimum value of 100
                        if (minRequestPrice < 100) {
                          setMinRequestPrice(100);
                          toast.warning("Minimum song request price is ₦100");
                        }
                      }}
                      className="bg-input-background pl-10 py-2 rounded-md w-full focus:ring-2 focus:ring-primary"
                      placeholder="Enter any amount (min ₦100)"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge 
                    className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
                    variant="outline"
                    onClick={() => setMinRequestPrice(500)}
                  >
                    ₦500
                  </Badge>
                  <Badge 
                    className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
                    variant="outline"
                    onClick={() => setMinRequestPrice(1000)}
                  >
                    ₦1,000
                  </Badge>
                  <Badge 
                    className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
                    variant="outline"
                    onClick={() => setMinRequestPrice(2000)}
                  >
                    ₦2,000
                  </Badge>
                  <Badge 
                    className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
                    variant="outline"
                    onClick={() => setMinRequestPrice(5000)}
                  >
                    ₦5,000
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Set any price (minimum ₦100) that users must pay to request a song
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateMinPrice} 
              disabled={isSaving || minRequestPrice === party.minRequestPrice}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <NairaSign className="mr-2 h-4 w-4" />
                  Update Price
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Close Party Confirmation Dialog */}
      <Dialog open={showClosePartyDialog} onOpenChange={setShowClosePartyDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Close Party</DialogTitle>
            <DialogDescription>
              Are you sure you want to close this party? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {hasPendingSongs(partyId as string) ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-start gap-3 mb-4">
                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Cannot close party</p>
                  <p className="text-sm mt-1">
                    You have pending accepted song requests that need to be played before closing the party.
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">
                Once closed, this party will no longer accept new song requests and will be moved to your past parties.
              </p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleCloseParty} 
              disabled={isClosing || hasPendingSongs(partyId as string)}
            >
              {isClosing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Closing...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Close Party
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}