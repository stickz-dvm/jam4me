import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useParty } from "../../context/PartyContext";
import { NowPlayingCard } from "../NowPlayingCard";
import { Music2, Disc, PlayCircle } from "lucide-react";

export function NowPlayingPage() {
    const { user, isDj } = useAuth();
    const { nowPlaying, currentParty, fetchNowPlaying } = useParty();

    const isHostDj = isDj && currentParty && String(currentParty.djId) === String(user?.id);

    useEffect(() => {
        if (currentParty?.id) {
            fetchNowPlaying(currentParty.id);

            // Auto-refresh every 30 seconds
            const interval = setInterval(() => {
                fetchNowPlaying(currentParty.id);
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [currentParty?.id, fetchNowPlaying]);

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[calc(100vh-160px)] flex flex-col items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full space-y-8 text-center"
            >
                <div className="space-y-2">
                    <div className="flex justify-center mb-4">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                            <div className="relative bg-card/50 backdrop-blur-sm border border-border/50 p-4 rounded-full">
                                <Music2 className="w-12 h-12 text-primary animate-pulse" />
                            </div>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold gradient-text">Now Playing</h1>
                    <p className="text-muted-foreground">The current song filling the air</p>
                </div>

                {nowPlaying && nowPlaying.now_playing ? (
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                        <NowPlayingCard data={nowPlaying} className="relative w-full py-8 !bg-card/10 border-none shadow-none" />
                    </div>
                ) : (
                    <div className="bg-card/30 backdrop-blur-md border border-border/50 rounded-2xl p-12 text-center space-y-4">
                        <div className="flex justify-center">
                            <Disc className="w-16 h-16 text-muted-foreground/30 animate-spin-slow" />
                        </div>
                        <p className="text-muted-foreground font-medium">No song is currently playing</p>
                        <p className="text-sm text-muted-foreground/60 max-w-xs mx-auto">
                            {currentParty
                                ? (isHostDj ? "Start playing songs from your queue to see them here." : "Waiting for the DJ to start the next track from the queue.")
                                : (isDj ? "Select an active party from your dashboard to see what's playing." : "Join a party to see what's playing!")}
                        </p>
                    </div>
                )}

                {currentParty && (
                    <div className="pt-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-xs font-semibold text-primary">
                            <PlayCircle size={14} />
                            Connected to {currentParty.name}
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
