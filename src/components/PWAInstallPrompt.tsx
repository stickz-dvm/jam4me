import React, { useState, useEffect } from "react";
import { Download, Smartphone, X } from "lucide-react";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isVisible, setIsVisible] = useState(false);
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        // Check if it's iOS
        const isIOSDevice =
            /iPad|iPhone|iPod/.test(navigator.userAgent) &&
            !(window as any).MSStream;
        setIsIOS(isIOSDevice);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Show the customized install button
            setIsVisible(true);
        };

        window.addEventListener("beforeinstallprompt", handler);

        // For iOS, we can show instructions since beforeinstallprompt isn't supported
        if (isIOSDevice) {
            const lastPrompt = localStorage.getItem("pwa-ios-prompt-last");
            const oneWeek = 7 * 24 * 60 * 60 * 1000;
            const now = Date.now();

            if (!lastPrompt || now - parseInt(lastPrompt) > oneWeek) {
                setIsVisible(true);
            }
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt && !isIOS) return;

        if (isIOS) {
            toast.info("To install: tap 'Share', then 'Add to Home Screen'", {
                duration: 5000,
            });
            setIsVisible(false);
            localStorage.setItem("pwa-ios-prompt-last", Date.now().toString());
            return;
        }

        // Show the install prompt
        deferredPrompt.prompt();
        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            toast.success("Thank you for installing Jam4me!");
        }

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setIsVisible(false);
    };

    const closePrompt = () => {
        setIsVisible(false);
        if (isIOS) {
            localStorage.setItem("pwa-ios-prompt-last", Date.now().toString());
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    className="relative overflow-hidden rounded-2xl bg-[#1e293b]/90 backdrop-blur-md border border-primary/20 p-5 shadow-2xl"
                >
                    <button
                        onClick={closePrompt}
                        className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="flex items-start gap-4 pr-6">
                        <div className="bg-primary/20 p-3 rounded-xl">
                            <Smartphone className="text-primary w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-white font-bold text-base leading-tight">Install Jam4me App</h4>
                            <p className="text-muted-foreground text-xs mt-1">
                                Install as an app for a faster, premium music experience directly on your home screen.
                            </p>
                            <div className="mt-4">
                                <Button
                                    onClick={handleInstallClick}
                                    className="w-full glow bg-primary hover:bg-primary/90 text-white font-bold h-10 rounded-xl flex items-center justify-center gap-2"
                                >
                                    <Download size={16} />
                                    {isIOS ? "How to Install" : "Install Now"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
