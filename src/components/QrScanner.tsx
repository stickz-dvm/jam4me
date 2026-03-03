import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, Camera, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";

interface QrScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onClose: () => void;
}

export function QrScanner({ onScanSuccess, onClose }: QrScannerProps) {
    const [error, setError] = useState<string | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const qrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerId = "qr-reader-container";

    useEffect(() => {
        const html5QrCode = new Html5Qrcode(scannerId);
        qrCodeRef.current = html5QrCode;

        const startScanner = async () => {
            try {
                const config = {
                    fps: 15,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                };

                await html5QrCode.start(
                    { facingMode: "environment" }, // Force rear/back camera
                    config,
                    (decodedText) => {
                        // Success
                        onScanSuccess(decodedText);
                    },
                    () => {
                        // Silently ignore scan failure (happens many times per second)
                    }
                );
                setIsScanning(true);
                setError(null);
            } catch (err: any) {
                console.error("Error starting QR scanner:", err);
                setError("Camera access denied or not found. Please ensure you have granted camera permissions.");
                setIsScanning(false);
            }
        };

        // Small delay to ensure the DOM element is ready
        const timer = setTimeout(() => {
            startScanner();
        }, 100);

        return () => {
            clearTimeout(timer);
            if (qrCodeRef.current && qrCodeRef.current.isScanning) {
                qrCodeRef.current
                    .stop()
                    .then(() => {
                        console.log("Scanner stopped");
                    })
                    .catch((err) => console.error("Error stopping QR scanner:", err));
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            {/* The Square Popup Container */}
            <div className="relative w-full aspect-square max-w-[300px] rounded-[2rem] overflow-hidden bg-black shadow-2xl border-2 border-white/20">
                <div id={scannerId} className="w-full h-full" />

                {/* No Viewfinder - Just raw camera feed */}

                {/* Error State */}
                {error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/95 p-6 text-center z-30">
                        <AlertTriangle className="w-10 h-10 text-destructive mb-4" />
                        <p className="text-white/80 text-sm font-medium leading-relaxed">{error}</p>
                    </div>
                )}

                {/* Loading State */}
                {!isScanning && !error && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-30">
                        <div className="w-2 h-10 bg-primary/40 rounded-full animate-pulse" />
                    </div>
                )}
            </div>

            {/* Pill-shaped Close Button */}
            <div className="mt-8">
                <Button
                    variant="ghost"
                    onClick={onClose}
                    className="rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/5 px-10 py-2.5 h-auto flex items-center gap-2 backdrop-blur-md transition-all active:scale-95 shadow-lg"
                >
                    <X className="w-4 h-4" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em]">Close</span>
                </Button>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        #qr-reader-container video {
          object-fit: cover !important;
          width: 100% !important;
          height: 100% !important;
          border-radius: 2rem;
        }
        #qr-reader-container img { display: none !important; }
        #qr-reader-container > div:first-child { border: none !important; }
        #qr-reader-container { background: black !important; }
      `}} />
        </div>
    );
}
