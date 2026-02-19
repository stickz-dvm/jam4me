import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, QrCode, PartyPopper, MapPin, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { useAuth } from "../../context/AuthContext";
import { useParty } from "../../context/PartyContext";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Html5QrcodeScanner, Html5QrcodeScanType, QrcodeSuccessCallback } from "html5-qrcode";

export function PartiesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { joinParty, joinedParties, isLoading } = useParty();
  const [passcode, setPasscode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const containerRef = useRef(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getDjAvatarUrl = (djId: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${djId}`;
  };

  if (!user) {
    navigate("/login");
    return null;
  }

  useEffect(() => {
    if (!containerRef.current || !showScanner) return;

    const config: any = {
      fps: 10,
      qrbox: { width: 150, height: 150 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA, Html5QrcodeScanType.SCAN_TYPE_FILE]
    }

    const scanner = new Html5QrcodeScanner(
      "reader",
      config,
      false
    )

    const onScanSuccess: QrcodeSuccessCallback = (decodedText, decodedResult) => {
      const partyId = decodedText.match(/(?:party\/|jam4me-party-)([a-z0-9]+)/)?.[1] || decodedText;

      if (partyId) {
        setScanResult(partyId);
        scanner.clear();
        setPasscode(partyId);
        setShowScanner(false);
      } else {
        setJoinError("Invalid QR code");
      }
    };

    const onScanFailure = (error: any) => {
      // Silently handle scan failures
    }

    scanner.render(onScanSuccess, onScanFailure);
    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((err) => {
          console.error("Scanner clear error: ", err);
        })
        scannerRef.current = null
      }
    }
  }, [showScanner]);

  const handleJoinParty = async () => {
    if (!passcode.trim()) {
      setJoinError("Please enter a passcode");
      return;
    }

    try {
      setJoinError("");

      // Wait for the party to be joined and state to update
      await joinParty(passcode);

      // Add a small delay to ensure state has propagated
      setTimeout(() => {
        console.log("Navigating to party:", passcode);
        navigate(`/party/${passcode}`);
      }, 1000);

      // Close the dialog
      setShowJoinDialog(false);
    } catch (err: any) {
      setJoinError(err.message || "Failed to join party");
    }
  };

  const handleOpenModal = (isOpen: boolean) => {
    if (!isOpen) {
      setShowJoinDialog(false);
      setShowScanner(false);
      setPasscode("");
      setJoinError("");
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div
        className="flex justify-between items-center"
        variants={itemVariants}
      >
        <h2 className="gradient-text">Parties</h2>
        <Button onClick={() => setShowJoinDialog(true)} className="glow">
          <Plus className="w-4 h-4 mr-2" />
          Join Party
        </Button>
      </motion.div>

      <div className="space-y-8">
        {/* Active Parties */}
        <div>
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            Active Parties
          </h3>
          {joinedParties.filter(p => p.isActive).length > 0 ? (
            <motion.div
              className="grid gap-4 grid-cols-1 md:grid-cols-2"
              variants={containerVariants}
            >
              {joinedParties.filter(p => p.isActive).map((party) => (
                <motion.div
                  key={party.id}
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Card
                    className="cursor-pointer hover:shadow-md transition-shadow glass border-border/50 border-l-4 border-l-primary"
                    onClick={() => navigate(`/party/${party.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{party.name}</CardTitle>
                        <div className="bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-primary/20">
                          LIVE
                        </div>
                      </div>
                      <CardDescription className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {party.location}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8 border-2 border-primary/10">
                            <AvatarImage src={getDjAvatarUrl(party.djId)} alt={party.dj} />
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {getInitials(party.dj)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">DJ: {party.dj}</span>
                        </div>
                        <div className="flex items-center bg-primary/5 px-2 py-1 rounded-full border border-primary/10">
                          <span className="text-primary font-semibold">{party.songs.length} songs</span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="text-[10px] text-muted-foreground pt-0">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>Ends at {new Date(party.activeUntil).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <span className="opacity-60">ID: {party.id}</span>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center glass rounded-xl border border-dashed border-border/50">
              <p className="text-muted-foreground text-sm italic">You haven't joined any active parties yet.</p>
            </div>
          )}
        </div>

        {/* Previous Hubs */}
        {joinedParties.filter(p => !p.isActive).length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 text-muted-foreground">Previous Hubs</h3>
            <motion.div
              className="grid gap-3 grid-cols-1 md:grid-cols-2 opacity-70 grayscale-[0.5]"
              variants={containerVariants}
            >
              {joinedParties.filter(p => !p.isActive).map((party) => (
                <motion.div key={party.id} variants={itemVariants}>
                  <Card className="glass border-border/30 bg-card/20" data-status="inactive">
                    <CardHeader className="pb-2 py-3 px-4">
                      <CardTitle className="text-base text-muted-foreground">{party.name}</CardTitle>
                      <CardDescription className="text-[10px] flex items-center gap-1">
                        <Clock className="h-2 w-2" />
                        Closed on {new Date(party.activeUntil).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-3 px-4">
                      <div className="flex justify-between items-center text-xs opacity-60">
                        <span>DJ: {party.dj}</span>
                        <span>{party.songs.length} songs played</span>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}
      </div>

      {joinedParties.length === 0 && !isLoading && (
        <motion.div
          className="flex flex-col items-center justify-center py-12 text-center glass rounded-xl p-8 border border-border/50"
          variants={itemVariants}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <PartyPopper className="w-16 h-16 text-primary mb-4" />
          </motion.div>
          <h3 className="gradient-text mb-2">No Parties Joined Yet</h3>
          <p className="text-muted-foreground max-w-md mt-2 mb-6">
            Join a party to request your favorite songs and get the DJ to play them
          </p>
          <Button onClick={() => setShowJoinDialog(true)} className="glow">
            Join Your First Party
          </Button>
        </motion.div>
      )}

      <Dialog open={showJoinDialog} onOpenChange={handleOpenModal}>
        <DialogContent className="glass border-border/50 sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join a Party</DialogTitle>
            <DialogDescription>
              Enter the party passcode or scan the QR code to join
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {joinError && (
              <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
                {joinError}
              </div>
            )}

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="passcode">Party Passcode</label>
              </div>
              <div className="relative">
                <Input
                  id="passcode"
                  placeholder="Enter 6-digit code"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="bg-input-background pr-10"
                  maxLength={6}
                  pattern="[0-9]{6}"
                  inputMode="numeric"
                />
                {passcode.length > 0 && passcode.length < 6 && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground">
                    {6 - passcode.length} more
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">Available codes for demo: "123456", "654321"</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => setShowScanner(!showScanner)}>
              <QrCode className="w-4 h-4 mr-2" />
              {showScanner ? "Hide Scanner" : "Scan QR Code"}
            </Button>

            {showScanner && (
              <div ref={containerRef}>
                <div id="reader" style={{ width: "100%", height: "400px" }}></div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleJoinParty}
              disabled={isLoading || passcode.length !== 6}
              className={`${passcode.length === 6 ? 'glow' : ''}`}
            >
              {isLoading ? "Joining..." : "Join Party"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}