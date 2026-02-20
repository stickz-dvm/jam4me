import React from "react";
import { Music2, Star, User as UserIcon, Play } from "lucide-react";
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

    const renderStars = (level: number = 0) => {
        return Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                size={10}
                className={i < level ? "fill-[#FFD60A] text-[#FFD60A]" : "text-white/20"}
            />
        ));
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`relative overflow-hidden rounded-[1.5rem] bg-white/[0.05] backdrop-blur-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.3)] ${className}`}
        >
            {/* Animated accent line */}
            <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-400 to-transparent"
            />

            <div className="p-4 flex items-center gap-4">
                <div className="relative shrink-0">
                    <div className="h-14 w-14 rounded-xl overflow-hidden shadow-lg border border-white/10">
                        {data.album_art || data.profile_picture ? (
                            <img
                                src={data.album_art || data.profile_picture}
                                alt=""
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="h-full w-full bg-blue-900/50 flex items-center justify-center">
                                <Music2 className="text-blue-300 h-6 w-6" />
                            </div>
                        )}
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-[#FFD60A] rounded-full flex items-center justify-center border-2 border-[#001C3D] shadow-sm">
                        <Play size={10} className="fill-[#001C3D] text-[#001C3D] ml-0.5" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD60A] flex items-center gap-1.5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Now
                        </span>
                        <div className="flex gap-0.5">
                            {renderStars(data.star_level)}
                        </div>
                    </div>

                    <h3 className="text-lg font-black text-white truncate leading-none uppercase tracking-tight">
                        {data.now_playing}
                    </h3>

                    <div className="mt-1 flex items-center gap-2">
                        <div className="h-4 w-4 rounded-full bg-white/10 flex items-center justify-center overflow-hidden">
                            {data.profile_picture ? (
                                <img src={data.profile_picture} className="h-full w-full object-cover" alt="" />
                            ) : (
                                <UserIcon size={8} className="text-white/50" />
                            )}
                        </div>
                        <p className="text-xs font-bold text-white/50 truncate">
                            Requested by <span className="text-white">{data.username || "Anonymous"}</span>
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
