import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useParty } from "../../context/PartyContext";
import { Music2, Disc, Maximize2, Monitor, Music, User, Play } from "lucide-react";
import { Button } from "../ui/button";

export function NowPlayingPage() {
    const { user, isDj } = useAuth();
    const { nowPlaying, currentParty, fetchNowPlaying } = useParty();
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update clock for that Mac feel
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (currentParty?.id) {
            fetchNowPlaying(currentParty.id);
            const interval = setInterval(() => fetchNowPlaying(currentParty.id), 10000);
            return () => clearInterval(interval);
        }
    }, [currentParty?.id, fetchNowPlaying]);

    const handleFullScreenPopup = () => {
        const width = 1200;
        const height = 800;
        const left = (window.screen.width / 2) - (width / 2);
        const top = (window.screen.height / 2) - (height / 2);

        window.open(
            window.location.href,
            "Jam4Me-Live",
            `width=${width},height=${height},left=${left},top=${top},menubar=no,status=no,toolbar=no`
        );
    };

    // Default to a vibrant blue/purple if no art
    const requesterColor = nowPlaying?.album_art ? "#FFD60A" : "#3b82f6";

    return (
        <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none">
            {/* WALLPAPER: Full page requester profile picture or default gradient */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={nowPlaying?.profile_picture || nowPlaying?.album_art || "default"}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1.5 }}
                    className="absolute inset-0"
                >
                    {nowPlaying?.profile_picture || nowPlaying?.album_art ? (
                        <>
                            <img
                                src={nowPlaying.profile_picture || nowPlaying.album_art}
                                className="w-full h-full object-cover"
                                alt="Wallpaper"
                            />
                            {/* Dark vignette overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/60 shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
                        </>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-[#001C3D] via-[#000B1A] to-black" />
                    )}
                </motion.div>
            </AnimatePresence>

            {/* TOP BAR / MENU BAR */}
            <div className="absolute top-0 inset-x-0 h-12 bg-black/10 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 z-50">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#FF5F57] rounded-full shadow-lg" />
                        <div className="w-3 h-3 bg-[#FEBC2E] rounded-full shadow-lg" />
                        <div className="w-3 h-3 bg-[#28C840] rounded-full shadow-lg" />
                    </div>
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Live Dashboard</span>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        size="sm"
                        onClick={handleFullScreenPopup}
                        className="h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[9px] font-black uppercase tracking-widest px-6 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Maximize2 size={10} />
                        Full Screen
                    </Button>
                    <div className="text-[11px] font-bold text-white/90 mr-2 bg-white/5 px-3 py-1 rounded-full border border-white/5">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="absolute inset-0 flex items-center px-12 md:px-24">
                {nowPlaying && nowPlaying.now_playing ? (
                    <div className="relative">
                        {/* User Nickname on the left */}
                        <motion.div
                            initial={{ x: -100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="space-y-4"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-1 bg-white/20 w-12" />
                                <span className="text-white/50 text-[10px] font-black uppercase tracking-[0.4em]">Requested By</span>
                            </div>
                            <h2
                                className="text-7xl md:text-9xl font-black italic uppercase leading-none tracking-tighter drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]"
                                style={{ color: requesterColor }}
                            >
                                {nowPlaying.username || "Guest"}
                            </h2>
                            <div className="flex items-center gap-3 bg-black/40 backdrop-blur-2xl border border-white/10 p-2.5 rounded-3xl w-fit pr-8">
                                <div className="h-14 w-14 rounded-2xl overflow-hidden border-2 border-white/10 shadow-2xl">
                                    {nowPlaying.profile_picture ? (
                                        <img src={nowPlaying.profile_picture} className="h-full w-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full bg-blue-900/40 flex items-center justify-center">
                                            <User className="text-white/20" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-white/40 uppercase tracking-widest">Active Member</p>
                                    <p className="text-white font-bold leading-tight tracking-tight text-lg">Viewing Live Session</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    /* SILENT MODE: Integrated into the wallpaper */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="w-full max-w-2xl"
                    >
                        <div className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="h-1 bg-blue-500/50 w-12" />
                                <span className="text-blue-400 text-[10px] font-black uppercase tracking-[0.5em]">System Status</span>
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none italic">
                                Silent <br />
                                <span className="text-white/20">Mode</span>
                            </h1>
                            <p className="text-white/40 text-lg font-medium max-w-md leading-relaxed">
                                The hub is currently quiet. Waiting for the DJ to accept new requests or start the next track.
                            </p>
                            <div className="pt-8 flex items-center gap-4">
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest px-10 py-7 text-sm shadow-[0_20px_40px_rgba(37,99,235,0.3)] transition-all active:scale-95"
                                >
                                    Refresh Session
                                </Button>
                                <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-full">
                                    <Disc className="w-5 h-5 text-blue-400 animate-spin-slow" />
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest">Waiting for beats...</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* BOTTOM DOCK / TASKBAR */}
            <AnimatePresence>
                {nowPlaying && nowPlaying.now_playing && (
                    <div className="absolute bottom-10 inset-x-0 flex justify-center px-6 z-50">
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-black/60 backdrop-blur-[40px] border border-white/10 rounded-[3rem] p-3.5 pl-3.5 pr-10 flex items-center gap-6 shadow-[0_40px_100px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
                        >
                            {/* Song Art */}
                            <div className="h-16 w-16 md:h-24 md:w-24 rounded-[2rem] overflow-hidden border border-white/20 relative group bg-blue-900/50 shadow-2xl">
                                {nowPlaying.album_art ? (
                                    <img src={nowPlaying.album_art} className="h-full w-full object-cover" />
                                ) : (
                                    <Music className="w-full h-full p-4 text-blue-300 opacity-50" />
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Play className="fill-white text-white w-8 h-8" />
                                    </motion.div>
                                </div>
                            </div>

                            <div className="min-w-0 max-w-md">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="flex gap-1 items-end h-3">
                                        <motion.div animate={{ height: [2, 12, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1.5 bg-[#FFD60A] rounded-full" />
                                        <motion.div animate={{ height: [8, 2, 10] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1.5 bg-blue-400 rounded-full" />
                                        <motion.div animate={{ height: [4, 14, 6] }} transition={{ repeat: Infinity, duration: 0.7 }} className="w-1.5 bg-white rounded-full" />
                                    </div>
                                    <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.4em]">Live Now</span>
                                </div>
                                <h3 className="text-2xl md:text-4xl font-black text-white truncate uppercase tracking-tighter leading-none mb-1">{nowPlaying.now_playing}</h3>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm font-bold text-white/40 truncate">{currentParty?.name || "Live Session"}</span>
                                </div>
                            </div>

                            <div className="hidden md:flex flex-col items-end gap-1.5 ml-8 border-l border-white/10 pl-8">
                                <Monitor size={18} className="text-white/30" />
                                <span className="text-[9px] font-black text-white/40 uppercase tracking-widest whitespace-nowrap">EXTENDED VIEW</span>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Background branding subtle */}
            <div className="absolute bottom-6 right-8 opacity-10 pointer-events-none">
                <h1 className="text-4xl font-black italic text-white tracking-widest">JAM4ME</h1>
            </div>

            {/* Full screen background glow */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-40 bg-blue-600/10 blur-[150px] rounded-full pointer-events-none" />
        </div>
    );
}
