import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useParty } from "../../context/PartyContext";
import { useWallet } from "../../context/WalletContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { User, Plus, Calendar as CalendarIcon, Music2, Banknote, Clock, QrCode, CheckCircle, BarChart3, Loader2, XCircle, Activity, Share2, MapPin } from "lucide-react";
import { toast } from "sonner";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { MusicPlayer } from "../MusicPlayer";
import { NairaSign } from "../icons/NairaSign";
import { format } from "date-fns";

export function DjDashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { balance } = useWallet();
  const { 
    createParty, 
    createdParties,
    isLoading: contextLoading,
    getPartyQrCode,
    hasPendingSongs 
  } = useParty();

  // Component state
  const [partyName, setPartyName] = useState("");
  const [partyVenue, setPartyVenue] = useState("");
  const [minSongRequestPrice, setMinSongRequestPrice] = useState(500);
  const [customPriceInput, setCustomPriceInput] = useState("500");
  const [partyEndDate, setPartyEndDate] = useState<Date | undefined>(new Date(Date.now() + 24 * 60 * 60 * 1000)); // 24 hours from now
  const [partyEndHour, setPartyEndHour] = useState("23");
  const [partyEndMinute, setPartyEndMinute] = useState("59");
  const [isCreatingParty, setIsCreatingParty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("ongoing");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedParty, setSelectedParty] = useState(null);
  
  // Create a ref for focusing, but we won't pass it directly to Input
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  // Initialize stats with zero values for new users
  const [stats, setStats] = useState({
    totalParties: 0,
    totalEarnings: 0,
    totalRequests: 0,
    songsPlayed: 0,
    topSongs: [] as { title: string; artist: string; requestCount: number }[]
  });

  // Filter parties by status - safely handle undefined parties
  const parties = createdParties || [];
  const ongoingParties = parties.filter(party => party.isActive !== false);
  const pastParties = parties.filter(party => party.isActive === false);

  // Handle custom price input change
  const handleCustomPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/\D/g, '');
    setCustomPriceInput(value);
    
    // Update price value 
    const numValue = parseInt(value);
    if (!isNaN(numValue)) {
      setMinSongRequestPrice(numValue);
    }
  };

  // Apply custom price when input field loses focus
  const handleCustomPriceBlur = () => {
    const numValue = parseInt(customPriceInput);
    if (!isNaN(numValue)) {
      if (numValue < 100) {
        setMinSongRequestPrice(100);
        setCustomPriceInput("100");
        toast.warning("Minimum song request price is ₦100");
      } else {
        setMinSongRequestPrice(numValue);
        setCustomPriceInput(numValue.toString());
      }
    } else {
      setCustomPriceInput("100");
      setMinSongRequestPrice(100);
    }
  };

  useEffect(() => {
    // Calculate stats based on the available parties
    const calculateStats = () => {
      setIsLoading(true);
      try {
        if (!parties || parties.length === 0) {
          setStats({
            totalParties: 0,
            totalEarnings: 0,
            totalRequests: 0,
            songsPlayed: 0,
            topSongs: []
          });
          return;
        }

        // Calculate total earnings and total requests
        let totalEarnings = 0;
        let totalRequests = 0;
        let songsPlayed = 0;
        const songStats: Record<string, { title: string; artist: string; requestCount: number }> = {};

        parties.forEach(party => {
          // Check for undefined properties to avoid errors
          const partyEarnings = party.earnings || 0;
          const partySongs = party.songs || [];
          
          totalEarnings += partyEarnings;
          totalRequests += partySongs.length;
          
          // Count played songs
          songsPlayed += partySongs.filter(s => s.status === "played" || s.status === "playing").length;
          
          // Track song request frequency
          partySongs.forEach(song => {
            const key = `${song.title}-${song.artist}`;
            if (songStats[key]) {
              songStats[key].requestCount += 1;
            } else {
              songStats[key] = {
                title: song.title,
                artist: song.artist,
                requestCount: 1
              };
            }
          });
        });

        // Convert song stats to array and sort by request count
        const topSongs = Object.values(songStats)
          .sort((a, b) => b.requestCount - a.requestCount)
          .slice(0, 6); // Get top 6 songs

        setStats({
          totalParties: parties.length,
          totalEarnings,
          totalRequests,
          songsPlayed,
          topSongs
        });
      } catch (error) {
        console.error("Failed to calculate stats:", error);
        toast.error("Failed to load dashboard data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    calculateStats();
  }, [parties]);

  // Update custom price input when the minSongRequestPrice changes
  useEffect(() => {
    setCustomPriceInput(minSongRequestPrice.toString());
  }, [minSongRequestPrice]);

  // Combine date and time into a single Date object
  const getCombinedDateTime = () => {
    if (!partyEndDate) return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now as fallback
    
    const endDate = new Date(partyEndDate);
    endDate.setHours(parseInt(partyEndHour || "23", 10));
    endDate.setMinutes(parseInt(partyEndMinute || "59", 10));
    endDate.setSeconds(0);
    
    return endDate;
  };

  // Create a new party
  const handleCreateParty = async (closeDialog: () => void) => {
    if (!partyName.trim()) {
      toast.error("Please enter a party name");
      return;
    }

    if (!partyVenue.trim()) {
      toast.error("Please enter a party venue");
      return;
    }

    // Ensure price is valid
    const price = parseInt(customPriceInput);
    if (isNaN(price) || price < 100) {
      toast.error("Please enter a valid price (minimum ₦100)");
      return;
    }

    // Get the combined date and time
    const endDateTime = getCombinedDateTime();
    
    // Make sure end time is in the future
    if (endDateTime <= new Date()) {
      toast.error("Party end time must be in the future");
      return;
    }

    setIsCreatingParty(true);
    try {
      await createParty({
        name: partyName,
        minRequestPrice: minSongRequestPrice,
        passcode: Math.floor(100000 + Math.random() * 900000).toString(), // Generate a 6-digit passcode
        location: partyVenue,
        dj: user?.name || "DJ Anonymous",
        activeUntil: endDateTime,
      });

      toast.success("Party created successfully!");
      setPartyName("");
      setPartyVenue("");
      setMinSongRequestPrice(500);
      setCustomPriceInput("500");
      setPartyEndDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
      setPartyEndHour("23");
      setPartyEndMinute("59");
      closeDialog();
    } catch (error) {
      console.error("Failed to create party:", error);
      toast.error("Failed to create party. Please try again.");
    } finally {
      setIsCreatingParty(false);
    }
  };

  // Focus the name input when dialog opens
  useEffect(() => {
    if (dialogOpen && inputContainerRef.current) {
      setTimeout(() => {
        // Find the input inside our container div and focus it
        const inputElement = inputContainerRef.current?.querySelector('input');
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    }
  }, [dialogOpen]);

  // Show QR code modal
  const handleShowQRCode = (party, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSelectedParty(party);
    setQrDialogOpen(true);
  };

  // Navigate to party management page
  const navigateToPartyManagement = (partyId) => {
    if (!partyId) {
      console.error("Invalid party ID for navigation");
      return;
    }
    navigate(`/dj/party/${partyId}`);
  };

  // Copy party passcode to clipboard
  const copyPasscodeToClipboard = () => {
    if (selectedParty) {
      navigator.clipboard.writeText(selectedParty.passcode);
      toast.success("Passcode copied to clipboard!");
    }
  };
  
  // Get initials from name for avatar fallback
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Prepare default top songs if none exist
  const displayTopSongs = stats.topSongs && stats.topSongs.length > 0 ? stats.topSongs : [
    { title: "No songs requested yet", artist: "Start a party to see popular requests", requestCount: 0 },
    { title: "Create your first party", artist: "And start receiving song requests", requestCount: 0 },
    { title: "Share your party code", artist: "Let party-goers connect with you", requestCount: 0 }
  ];

  // Combine loading states
  const showLoading = isLoading || contextLoading;

  // Create the price selection UI component
  const PriceSelector = () => (
    <div className="space-y-2">
      <label className="text-sm font-medium">Minimum Song Request Price (NGN)</label>
      <div className="space-y-4">
        <div className="flex items-center">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <NairaSign className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
              ref={priceInputRef}
              type="text"
              value={customPriceInput}
              onChange={handleCustomPriceChange}
              onBlur={handleCustomPriceBlur}
              className="pl-10 bg-input-background"
              inputMode="numeric"
              placeholder="Enter any amount"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge 
            className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
            variant="outline"
            onClick={() => {
              setMinSongRequestPrice(500);
              setCustomPriceInput("500");
              if (priceInputRef.current) priceInputRef.current.focus();
            }}
          >
            ₦500
          </Badge>
          <Badge 
            className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
            variant="outline"
            onClick={() => {
              setMinSongRequestPrice(1000);
              setCustomPriceInput("1000");
              if (priceInputRef.current) priceInputRef.current.focus();
            }}
          >
            ₦1,000
          </Badge>
          <Badge 
            className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
            variant="outline"
            onClick={() => {
              setMinSongRequestPrice(2000);
              setCustomPriceInput("2000");
              if (priceInputRef.current) priceInputRef.current.focus();
            }}
          >
            ₦2,000
          </Badge>
          <Badge 
            className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
            variant="outline"
            onClick={() => {
              setMinSongRequestPrice(5000);
              setCustomPriceInput("5000");
              if (priceInputRef.current) priceInputRef.current.focus();
            }}
          >
            ₦5,000
          </Badge>
          <Badge 
            className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
            variant="outline"
            onClick={() => {
              setMinSongRequestPrice(10000);
              setCustomPriceInput("10000");
              if (priceInputRef.current) priceInputRef.current.focus();
            }}
          >
            ₦10,000
          </Badge>
          <Badge 
            className="cursor-pointer px-3 py-1 hover:bg-primary/30" 
            variant="outline"
            onClick={() => {
              setMinSongRequestPrice(20000);
              setCustomPriceInput("20000");
              if (priceInputRef.current) priceInputRef.current.focus();
            }}
          >
            ₦20,000
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Enter any price (minimum ₦100). Higher prices may lead to more exclusive requests.
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold gradient-text">DJ Dashboard</h1>
            <p className="text-muted-foreground">Manage your parties and requests</p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="glow">
                <Plus size={16} />
                Create Party
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card/95 backdrop-blur-md">
              <DialogHeader>
                <DialogTitle>Create a New Party</DialogTitle>
                <DialogDescription>
                  Set up your party details and share the code with party-goers.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2" ref={inputContainerRef}>
                  <label className="text-sm font-medium">Party Name</label>
                  <Input
                    placeholder="Enter party name"
                    value={partyName}
                    onChange={(e) => setPartyName(e.target.value)}
                    className="bg-input/50 backdrop-blur-sm"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !isCreatingParty && partyName) {
                        e.preventDefault();
                        const closeBtn = document.querySelector("[data-create-party]") as HTMLButtonElement;
                        if (closeBtn) closeBtn.click();
                      }
                    }}
                  />
                </div>
                <PriceSelector />
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setPartyName("");
                      setPartyVenue("");
                      setMinSongRequestPrice(500);
                      setCustomPriceInput("500");
                      setPartyEndDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
                      setPartyEndHour("23");
                      setPartyEndMinute("59");
                    }}
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button 
                  onClick={() => handleCreateParty(() => setDialogOpen(false))} 
                  disabled={isCreatingParty}
                  data-create-party="true"
                >
                  {isCreatingParty ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Party"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* QR Code Modal */}
        <Dialog open={qrDialogOpen} onOpenChange={setQrDialogOpen}>
          <DialogContent className="bg-card/95 backdrop-blur-md">
            <DialogHeader>
              <DialogTitle>Party QR Code</DialogTitle>
              <DialogDescription>
                {selectedParty ? `Share this QR code for party: ${selectedParty.name}` : 'Share this QR code for your party'}
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col items-center justify-center p-4">
              {selectedParty && (
                <>
                  <div className="w-64 h-64 bg-white p-3 rounded-lg shadow-lg mb-6">
                    <img 
                      src={getPartyQrCode(selectedParty.id)} 
                      alt="Party QR Code" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-1">Passcode</p>
                      <div className="flex items-center gap-2">
                        <span className="text-3xl font-mono font-bold tracking-widest bg-muted/30 px-4 py-2 rounded">
                          {selectedParty.passcode}
                        </span>
                        <Button size="sm" variant="outline" onClick={copyPasscodeToClipboard}>
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button>Done</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dashboard stats cards have been completely removed */}

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Parties</h2>
          <Tabs defaultValue="ongoing" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="ongoing">Active Parties</TabsTrigger>
              <TabsTrigger value="past">Past Parties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="ongoing">
              {showLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : ongoingParties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoingParties.map((party) => (
                    <Card 
                      key={party.id} 
                      className="bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{party.name}</CardTitle>
                          <Badge>Active</Badge>
                        </div>
                        <CardDescription>
                          Created {new Date(party.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Passcode:</span>
                            <span className="font-mono bg-muted/30 px-2 rounded">{party.passcode}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Min. Request:</span>
                            <span>₦{party.minRequestPrice || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Requests:</span>
                            <span>{party.songs?.length || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Earnings:</span>
                            <span className="text-spotify-green">₦{party.earnings || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={(e) => handleShowQRCode(party, e)}
                        >
                          <QrCode className="h-4 w-4 mr-2" />
                          QR Code
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigateToPartyManagement(party.id);
                          }}
                        >
                          Manage
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                  
                  <Card className="bg-muted/10 border-dashed backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
                    <CardContent className="flex flex-col items-center justify-center h-full min-h-[240px] cursor-pointer">
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger className="flex flex-col items-center justify-center w-full h-full">
                          <div className="rounded-full bg-muted/20 p-4 mb-3">
                            <Plus className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <p className="text-muted-foreground">Create New Party</p>
                        </DialogTrigger>
                        <DialogContent className="bg-card/95 backdrop-blur-md">
                          <DialogHeader>
                            <DialogTitle>Create a New Party</DialogTitle>
                            <DialogDescription>
                              Set up your party details and share the code with party-goers.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Party Name</label>
                              <Input
                                placeholder="Enter party name"
                                value={partyName}
                                onChange={(e) => setPartyName(e.target.value)}
                                className="bg-input/50 backdrop-blur-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Party Venue</label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                  <MapPin className="h-4 w-4 text-muted-foreground" />
                                </div>
                                <Input
                                  placeholder="Enter venue location"
                                  value={partyVenue}
                                  onChange={(e) => setPartyVenue(e.target.value)}
                                  className="bg-input/50 backdrop-blur-sm pl-10"
                                />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Party End Time</label>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <div className="flex-1">
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className="w-full justify-start text-left font-normal bg-input/50 backdrop-blur-sm"
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {partyEndDate ? format(partyEndDate, "PPP") : "Select date"}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                      <Calendar
                                        mode="single"
                                        selected={partyEndDate}
                                        onSelect={setPartyEndDate}
                                        initialFocus
                                        disabled={(date) => date < new Date()}
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                
                                <div className="flex gap-2">
                                  <Select value={partyEndHour} onValueChange={setPartyEndHour}>
                                    <SelectTrigger className="w-[80px] bg-input/50 backdrop-blur-sm">
                                      <SelectValue placeholder="Hour" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                                        <SelectItem key={hour} value={hour.toString().padStart(2, "0")}>
                                          {hour.toString().padStart(2, "0")}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  
                                  <span className="flex items-center text-muted-foreground">:</span>
                                  
                                  <Select value={partyEndMinute} onValueChange={setPartyEndMinute}>
                                    <SelectTrigger className="w-[80px] bg-input/50 backdrop-blur-sm">
                                      <SelectValue placeholder="Min" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {Array.from({ length: 60 }, (_, i) => i).filter(i => i % 5 === 0).map((minute) => (
                                        <SelectItem key={minute} value={minute.toString().padStart(2, "0")}>
                                          {minute.toString().padStart(2, "0")}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Set when the party will end. Guests won't be able to join or request songs after this time.
                              </p>
                            </div>
                            
                            <PriceSelector />
                          </div>
                          <DialogFooter>
                            <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button 
                              onClick={() => handleCreateParty(() => setDialogOpen(false))} 
                              disabled={isCreatingParty}
                              data-create-party="true"
                            >
                              {isCreatingParty ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Creating...
                                </>
                              ) : (
                                "Create Party"
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="bg-muted/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="rounded-full bg-muted/20 p-4 mb-4">
                      <Music2 className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No active parties</h3>
                    <p className="text-muted-foreground text-center mb-6">
                      You don't have any active parties at the moment. Create a new party to start receiving song requests.
                    </p>
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                      <DialogTrigger asChild>
                        <Button>
                          <Plus size={16} className="mr-2" />
                          Create Your First Party
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card/95 backdrop-blur-md">
                        <DialogHeader>
                          <DialogTitle>Create a New Party</DialogTitle>
                          <DialogDescription>
                            Set up your party details and share the code with party-goers.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Party Name</label>
                            <Input
                              placeholder="Enter party name"
                              value={partyName}
                              onChange={(e) => setPartyName(e.target.value)}
                              className="bg-input/50 backdrop-blur-sm"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Party Venue</label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <Input
                                placeholder="Enter venue location"
                                value={partyVenue}
                                onChange={(e) => setPartyVenue(e.target.value)}
                                className="bg-input/50 backdrop-blur-sm pl-10"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Party End Time</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <div className="flex-1">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <Button
                                      variant="outline"
                                      className="w-full justify-start text-left font-normal bg-input/50 backdrop-blur-sm"
                                    >
                                      <CalendarIcon className="mr-2 h-4 w-4" />
                                      {partyEndDate ? format(partyEndDate, "PPP") : "Select date"}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                      mode="single"
                                      selected={partyEndDate}
                                      onSelect={setPartyEndDate}
                                      initialFocus
                                      disabled={(date) => date < new Date()}
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              
                              <div className="flex gap-2">
                                <Select value={partyEndHour} onValueChange={setPartyEndHour}>
                                  <SelectTrigger className="w-[80px] bg-input/50 backdrop-blur-sm">
                                    <SelectValue placeholder="Hour" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
                                      <SelectItem key={hour} value={hour.toString().padStart(2, "0")}>
                                        {hour.toString().padStart(2, "0")}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                
                                <span className="flex items-center text-muted-foreground">:</span>
                                
                                <Select value={partyEndMinute} onValueChange={setPartyEndMinute}>
                                  <SelectTrigger className="w-[80px] bg-input/50 backdrop-blur-sm">
                                    <SelectValue placeholder="Min" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: 60 }, (_, i) => i).filter(i => i % 5 === 0).map((minute) => (
                                      <SelectItem key={minute} value={minute.toString().padStart(2, "0")}>
                                        {minute.toString().padStart(2, "0")}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Set when the party will end. Guests won't be able to join or request songs after this time.
                            </p>
                          </div>
                          
                          <PriceSelector />
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                          </DialogClose>
                          <Button 
                            onClick={() => handleCreateParty(() => setDialogOpen(false))} 
                            disabled={isCreatingParty}
                            data-create-party="true"
                          >
                            {isCreatingParty ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Creating...
                              </>
                            ) : (
                              "Create Party"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="past">
              {showLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : pastParties.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastParties.map((party) => (
                    <Card key={party.id} className="bg-card/80 backdrop-blur-sm border-border/50">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle>{party.name}</CardTitle>
                          <Badge variant="outline">Closed</Badge>
                        </div>
                        <CardDescription>
                          {new Date(party.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Songs:</span>
                            <span>{party.songs?.length || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Earnings:</span>
                            <span className="text-spotify-green">₦{party.earnings || 0}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          variant="outline"
                          size="sm" 
                          className="w-full"
                          onClick={() => navigateToPartyManagement(party.id)}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="bg-muted/10 backdrop-blur-sm">
                  <CardContent className="flex flex-col items-center justify-center py-8">
                    <div className="rounded-full bg-muted/20 p-4 mb-4">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">No past parties</h3>
                    <p className="text-muted-foreground text-center">
                      You haven't closed any parties yet. Complete an active party to see it here.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Popular Song Requests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTopSongs.map((song, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                      <Music2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium line-clamp-1">{song.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-1">{song.artist}</p>
                    </div>
                  </div>
                  {song.requestCount > 0 && (
                    <div className="mt-4 flex justify-between items-center">
                      <Badge variant="outline" className="bg-muted/30">
                        {song.requestCount} {song.requestCount === 1 ? 'request' : 'requests'}
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}