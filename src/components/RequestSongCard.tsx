import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music, Plus, Minus, Search, Crown, Zap, Flame } from "lucide-react";
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
    const maxPrice = 10000; // Arbitrary max for the slider

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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
        }).format(amount).replace('NGN', '₦');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="w-full max-w-md mx-auto space-y-6 p-6 rounded-[2rem] bg-[#001C3D]/40 text-white shadow-[0_0_40px_rgba(59,130,246,0.3)] border border-blue-400/30 relative overflow-hidden backdrop-blur-xl"
        >
            {/* Blurred Background Art - Filling the whole space */}
            {track.album?.images?.[0]?.url && (
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <motion.img
                        initial={{ opacity: 0, scale: 1.5 }}
                        animate={{ opacity: 0.7, scale: 2.2 }}
                        src={track.album.images[0].url}
                        alt=""
                        className="w-full h-full object-cover blur-[20px] origin-center"
                    />
                    {/* Subtle tint to keep text readable */}
                    <div className="absolute inset-0 bg-transparent z-1" />
                    <div className="absolute inset-0 bg-transparent z-2" />
                </div>
            )}

            <div className="relative z-10 space-y-6">
                {/* Ego Boost Badges (now inside z-10 for layering) */}
                <div className="absolute -top-2 -right-2 flex flex-col gap-2">
                    <AnimatePresence>
                        {price >= minPrice * 3 && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0, x: 20 }}
                                animate={{ scale: 1, opacity: 1, x: 0 }}
                                exit={{ scale: 0, opacity: 0, x: 20 }}
                                className="bg-gradient-to-r from-orange-500 to-red-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(239,68,68,0.5)] border border-white/20"
                            >
                                <Flame className="h-3.5 w-3.5 fill-white" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Hot Status</span>
                            </motion.div>
                        )}
                        {price >= minPrice * 2 && (
                            <motion.div
                                initial={{ scale: 0, opacity: 0, x: 20 }}
                                animate={{ scale: 1, opacity: 1, x: 0 }}
                                exit={{ scale: 0, opacity: 0, x: 20 }}
                                className="bg-gradient-to-r from-amber-400 to-yellow-600 px-3 py-1 rounded-full flex items-center gap-1 shadow-[0_0_15px_rgba(251,191,36,0.5)] border border-white/20"
                            >
                                <Crown className="h-3.5 w-3.5 fill-white" />
                                <span className="text-[10px] font-black uppercase tracking-tighter text-[#001C3D]">VIP Priority</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {/* Song Preview Card (Ultra-Transparent Glass) */}
                <div className="relative overflow-hidden rounded-2xl bg-white/[0.03] backdrop-blur-xl p-4 flex items-center gap-4 border border-white/10 shadow-xl">
                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl shadow-lg">
                        {track.album?.images?.[0]?.url ? (
                            <img
                                src={track.album.images[0].url}
                                alt={track.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center bg-blue-900">
                                <Music className="h-8 w-8 text-blue-300" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold truncate text-white drop-shadow-md">{track.name}</h3>
                        <p className="text-white/90 text-sm font-medium truncate drop-shadow-sm">{track.artists.map(a => a.name).join(", ")}</p>
                        <div className="mt-1.5 flex items-center gap-2 text-xs text-white/70 font-medium">
                            <Music className="h-3 w-3 text-blue-400" />
                            <span className="truncate drop-shadow-sm">{track.album?.name || "Single"}</span>
                            <span className="text-white/40">•</span>
                            <span className="drop-shadow-sm">
                                {Math.floor(track.duration_ms / 60000)}:
                                {((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Request Price Section */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-white drop-shadow-sm">Request Price (₦)</span>
                        <div className="bg-[#FFD60A] text-[#001C3D] px-6 py-2 rounded-full font-black text-lg shadow-[0_0_20px_rgba(255,214,10,0.5)] scale-105 transition-transform">
                            ₦{price.toLocaleString()}
                        </div>
                    </div>

                    <div className="px-2">
                        <Slider
                            value={[price]}
                            min={minPrice}
                            max={Math.max(2000, price > 2000 ? price * 1.5 : 2000)}
                            step={50}
                            onValueChange={handlePriceChange}
                            className="py-4 cursor-pointer premium-slider"
                        />
                        <div className="flex justify-between text-xs font-bold text-white/90 mt-1 uppercase tracking-tighter drop-shadow-sm">
                            <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">Min: ₦{minPrice.toLocaleString()}</span>
                            <span className="bg-white/10 px-3 py-1 rounded-full backdrop-blur-md border border-white/5">Max: ₦{Math.max(2000, price > 2000 ? Math.floor(price * 1.5) : 2000).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Balance & Stepper Section */}
                <div className="space-y-2">
                    <span className="text-sm font-medium text-blue-100">Your balance:</span>
                    <div className="flex items-center justify-between bg-white/[0.03] backdrop-blur-xl rounded-full p-1 border border-white/10 shadow-lg">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStep(-100)}
                            className="h-10 w-10 rounded-full bg-[#FFD60A] hover:bg-[#FFD60A]/80 text-[#001C3D] shrink-0 active:scale-95 transition-transform"
                        >
                            <Minus className="h-5 w-5 stroke-[3px]" />
                        </Button>

                        <div className="flex-1 text-center font-bold text-xl">
                            ₦{price.toLocaleString()}
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleStep(100)}
                            className="h-10 w-10 rounded-full bg-[#FFD60A] hover:bg-[#FFD60A]/80 text-[#001C3D] shrink-0 active:scale-95 transition-transform"
                        >
                            <Plus className="h-5 w-5 stroke-[3px]" />
                        </Button>
                    </div>
                </div>

                {/* Action Button */}
                <div className="pt-2 text-center space-y-3">
                    <Button
                        onClick={() => onRequest(price)}
                        disabled={price > balance}
                        className={`w-full py-7 rounded-2xl font-bold text-lg shadow-xl active:scale-[0.98] transition-all relative overflow-hidden ${price >= minPrice * 2
                            ? "bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-[#001C3D] shadow-[0_10px_30px_rgba(251,191,36,0.4)]"
                            : "bg-[#FFD60A] hover:bg-[#FFD60A]/90 text-[#001C3D] shadow-[0_10px_20px_rgba(255,214,10,0.2)]"
                            }`}
                    >
                        <AnimatePresence>
                            {price >= minPrice * 2 && (
                                <motion.div
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '200%' }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                                />
                            )}
                        </AnimatePresence>
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {price >= minPrice * 2 && <Zap className="h-5 w-5 fill-current" />}
                            {price >= minPrice * 2 ? "Boost Request" : "Request Now"}
                        </span>
                    </Button>
                    <div className="flex items-center justify-center gap-2 text-blue-300/60 text-xs font-medium">
                        <span>Your Balance: ₦{balance.toLocaleString()}</span>
                        {price > balance && <span className="text-red-400">• Needs ₦{(price - balance).toLocaleString()} more</span>}
                    </div>
                </div>

                {/* Cancel Option (Glass Card) */}
                <div className="pt-4 flex justify-center">
                    <div className="bg-white/[0.05] backdrop-blur-lg border border-white/10 rounded-full p-1 shadow-md">
                        <Button
                            variant="ghost"
                            onClick={onCancel}
                            className="text-white/70 hover:text-white hover:bg-white/10 rounded-full px-8 h-9 transition-all text-sm font-medium"
                        >
                            Change Song
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

