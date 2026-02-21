import React from "react";
import { Music2, Play, User as UserIcon } from "lucide-react";
import { motion } from "framer-motion";

interface NowPlayingCardProps {
    data: {
        now_playing: string;
        username: string;
        profile_picture?: string;
        star_level?: number;
        album_art?: string;
    } | null;
    className?: string;
}

export function NowPlayingCard({ data, className }: NowPlayingCardProps) {
    if (!data || !data.now_playing) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`group relative overflow-hidden rounded-[2rem] bg-white/[0.05] backdrop-blur-3xl border border-white/20 shadow-[0_30px_60px_rgba(0,0,0,0.5)] transition-all duration-500 ${className}`}
        >
            {/* Blurred Background Art */}
            {data.album_art && (
                <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
                    <motion.img
                        initial={{ scale: 1.5 }}
                        animate={{ scale: 2 }}
                        src={data.album_art}
                        className="w-full h-full object-cover blur-[40px]"
                    />
                </div>
            )}

            {/* Animated accent line */}
            <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent z-10"
            />

            <div className="relative z-10 p-5 md:p-6 flex flex-col md:flex-row items-center gap-6">
                {/* Requester Avatar - Prominent Feature */}
                <div className="relative group shrink-0">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="h-20 w-20 md:h-24 md:w-24 rounded-[1.5rem] overflow-hidden shadow-2xl border-2 border-[#FFD60A] ring-4 ring-black/20"
                    >
                        {data.profile_picture ? (
                            <img src={data.profile_picture} className="h-full w-full object-cover" alt="" />
                        ) : (
                            <div className="h-full w-full bg-blue-900/50 flex items-center justify-center">
                                <UserIcon size={32} className="text-white/50" />
                            </div>
                        )}
                    </motion.div>
                    <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center border-2 border-[#001C3D] shadow-xl">
                        <Play size={14} className="fill-white text-white ml-0.5" />
                    </div>
                </div>

                <div className="flex-1 min-w-0 text-center md:text-left">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#FFD60A] flex items-center justify-center md:justify-start gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Now
                        </span>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full border border-white/5 self-center md:self-auto">
                            <UserIcon size={10} className="text-white/50" />
                            <span className="text-[9px] font-black uppercase tracking-tighter text-white/70">
                                Requester: <span className="text-white">{data.username || "Anonymous"}</span>
                            </span>
                        </div>
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black text-white truncate leading-tight uppercase tracking-tighter mb-1">
                        {data.now_playing}
                    </h3>

                    <div className="flex items-center justify-center md:justify-start gap-2">
                        <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                        <p className="text-sm font-bold text-blue-300 uppercase tracking-widest opacity-80">
                            Now Playing in Party
                        </p>
                    </div>
                </div>

                {/* Album Art Preview Snippet */}
                {data.album_art && (
                    <div className="hidden lg:block shrink-0">
                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-white/10 shadow-lg">
                            <img src={data.album_art} className="h-full w-full object-cover" alt="" />
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}
