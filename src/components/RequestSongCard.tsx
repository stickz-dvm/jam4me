import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Plus, Minus, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { SpotifyTrack } from "../services/SpotifyService";

interface RequestSongCardProps {
    track: SpotifyTrack;
    balance: number;
    minPrice: number;
    onRequest: (price: number) => void;
    onCancel: () => void;
}

export function RequestSongCard({
    track,
    balance,
    minPrice,
    onRequest,
    onCancel
}: RequestSongCardProps) {
    const [price, setPrice] = useState(minPrice);

    useEffect(() => {
        if (price < minPrice) {
            setPrice(minPrice);
        }
    }, [minPrice, price]);

    const handlePriceChange = (value: number[]) => {
        setPrice(value[0]);
    };

    const handleStep = (increment: number) => {
        setPrice(prev => Math.max(minPrice, prev + increment));
    };

    const getStatusText = () => {
        if (price >= minPrice * 5) return "WHALE PRIORITY";
        if (price >= minPrice * 3) return "HOT REQUEST";
        if (price >= minPrice * 2) return "VIP PRIORITY";
        return "NORMAL REQUEST";
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{
                opacity: 1,
                y: 0,
                backgroundColor: price >= minPrice * 5 ? "rgba(180, 83, 9, 0.85)" :
                    price >= minPrice * 3 ? "rgba(159, 18, 57, 0.75)" :
                        price >= minPrice * 2 ? "rgba(88, 28, 135, 0.65)" :
                            "rgba(0, 28, 61, 0.65)"
            }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full space-y-4 p-3 md:p-5 rounded-[2rem] text-white shadow-[0_0_60px_rgba(0,0,0,0.5)] border border-white/20 relative overflow-hidden backdrop-blur-3xl transition-colors duration-700"
        >
            {/* Blurred Background Art */}
            {track.album?.images?.[0]?.url && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <motion.img
                        initial={{ opacity: 0, scale: 1.5 }}
                        animate={{ opacity: 0.4, scale: 2.2 }}
                        src={track.album.images[0].url}
                        alt=""
                        className="w-full h-full object-cover blur-[40px] origin-center"
                    />
                </div>
            )}

            <div className="relative z-10 max-w-5xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                    {/* Desktop Large Art Preview */}
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="hidden md:block"
                    >
                        <div className="aspect-square w-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 group relative">
                            {track.album?.images?.[0]?.url ? (
                                <img
                                    src={track.album.images[0].url}
                                    alt={track.name}
                                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-blue-900/50">
                                    <Music className="h-20 w-20 text-blue-300" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                                <h3 className="text-2xl font-black text-white">{track.name}</h3>
                                <p className="text-white/80 font-medium">{track.artists.map(a => a.name).join(", ")}</p>
                            </div>
                        </div>
                    </motion.div>

                    <div className="space-y-6">
                        {/* Mobile Preview Style (Desktop also uses this for info) */}
                        <div className="relative overflow-hidden rounded-2xl bg-white/[0.05] backdrop-blur-xl p-4 flex items-center gap-4 border border-white/10 shadow-xl">
                            <div className="h-16 w-16 md:hidden shrink-0 overflow-hidden rounded-xl">
                                <img
                                    src={track.album?.images?.[0]?.url}
                                    alt={track.name}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-black truncate text-white uppercase tracking-tight">{track.name}</h3>
                                        <p className="text-white/80 text-sm font-bold truncate">{track.artists.map(a => a.name).join(", ")}</p>
                                    </div>
                                    <div className="shrink-0 text-right">
                                        <span className="text-[10px] font-black px-2 py-1 bg-white/20 rounded-full">{getStatusText()}</span>
                                    </div>
                                </div>
                                <div className="mt-2 flex items-center gap-2 text-xs text-white/50 font-bold uppercase tracking-widest">
                                    <span>{track.album?.name || "Single"}</span>
                                    <span>•</span>
                                    <span>
                                        {Math.floor(track.duration_ms / 60000)}:
                                        {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Price Controls */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.2em]">Request Price</p>
                                    <p className="text-3xl font-black text-[#FFD60A]">₦{price.toLocaleString()}</p>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest text-right">Balance</p>
                                    <p className="text-lg font-bold">₦{balance.toLocaleString()}</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Slider
                                    value={[price]}
                                    min={minPrice}
                                    max={10000}
                                    step={50}
                                    onValueChange={handlePriceChange}
                                    className="py-2 cursor-grab active:cursor-grabbing"
                                />
                                <div className="flex justify-between text-[8px] font-black text-white/40 uppercase tracking-widest">
                                    <span>Min: ₦{minPrice.toLocaleString()}</span>
                                    <span>Max: ₦10,000</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 flex items-center bg-black/20 rounded-full p-1 border border-white/5">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleStep(-100)}
                                        className="h-10 w-10 text-white/70 hover:text-white !rounded-full p-0 flex items-center justify-center overflow-hidden"
                                    >
                                        <Minus className="h-4 w-4" />
                                    </Button>
                                    <div className="flex-1 text-center font-black">₦100</div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleStep(100)}
                                        className="h-10 w-10 text-white/70 hover:text-white !rounded-full p-0 flex items-center justify-center overflow-hidden"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="space-y-3">
                            <Button
                                onClick={() => onRequest(price)}
                                disabled={price > balance}
                                className={`w-full py-8 rounded-full font-black text-xl uppercase tracking-widest shadow-2xl active:scale-[0.98] transition-all relative overflow-hidden ${price >= minPrice * 2 ? "bg-white text-black" : "bg-[#FFD60A] text-black"
                                    }`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-3">
                                    {price >= minPrice * 2 && <Zap className="h-6 w-6 fill-current" />}
                                    {price >= minPrice * 2 ? "Send High Priority" : "Request Song"}
                                </span>
                            </Button>

                            {price > balance && (
                                <p className="text-center text-[10px] font-black text-red-400 uppercase tracking-widest">
                                    Insufficient Balance (Needs ₦{(price - balance).toLocaleString()} more)
                                </p>
                            )}

                            <Button
                                variant="ghost"
                                onClick={onCancel}
                                className="w-full text-white/40 hover:text-white font-black text-[10px] uppercase tracking-[0.3em] transition-all"
                            >
                                Search Another Song
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
