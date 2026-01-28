"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Camera,
  Zap,
  RefreshCcw,
  ShieldCheck,
} from "lucide-react";
import { cateringDriverApi } from "@/lib/drivers";

interface CameraViewProps {
  purpose: "PICKUP" | "DROPOFF";
  onCapture: (photoUrl: string) => void;
  onClose: () => void;
}

export default function CameraView({
  purpose,
  onCapture,
  onClose,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [status, setStatus] = useState<
    "IDLE" | "SCANNING" | "VERIFIED" | "ERROR"
  >("IDLE");
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">(
    "environment"
  );

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    const startCamera = async () => {
      try {
        stopCamera();
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode,
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraReady(true);
        }
      } catch (err) {
        console.error("Camera access failed:", err);
        setCameraReady(false);
      }
    };

    startCamera();
    return () => stopCamera();
  }, [facingMode, stopCamera]);

  const switchCamera = () => {
    setFacingMode((prev) => (prev === "environment" ? "user" : "environment"));
  };

  const handleShutter = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    setStatus("SCANNING");

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);

    try {
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to capture"))),
          "image/jpeg",
          0.85
        );
      });

      const file = new File(
        [blob],
        `${purpose.toLowerCase()}-proof-${Date.now()}.jpg`,
        { type: "image/jpeg" }
      );

      const url = await cateringDriverApi.uploadImage(file);

      setStatus("VERIFIED");
      setTimeout(() => {
        stopCamera();
        onCapture(url);
      }, 800);
    } catch (err) {
      console.error("Upload failed:", err);
      setStatus("ERROR");
      setIsCapturing(false);
      setTimeout(() => setStatus("IDLE"), 2000);
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col items-center justify-center p-4 lg:p-12 animate-in fade-in duration-500">
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-5xl h-full bg-[#0F0F10] rounded-[48px] overflow-hidden flex flex-col relative border border-white/10 shadow-[0_0_100px_rgba(250,67,173,0.1)]">
        {/* Top Info Bar */}
        <div className="bg-black/40 backdrop-blur-md px-6 md:px-10 py-4 md:py-6 flex items-center justify-between border-b border-white/10 z-20">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                Evidence Log
              </p>
              <h3 className="text-white font-black">
                {purpose === "PICKUP"
                  ? "Package Verification"
                  : "Delivery Proof"}
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-all border border-white/10"
          >
            <X size={24} />
          </button>
        </div>

        {/* Viewfinder */}
        <div className="flex-1 relative flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />

          {/* Viewfinder Frame */}
          <div className="relative w-full max-w-2xl aspect-video border-2 border-white/10 rounded-[40px] flex items-center justify-center overflow-hidden z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent pointer-events-none" />

            {/* Corner Accents */}
            <div className="absolute top-8 left-8 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
            <div className="absolute top-8 right-8 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
            <div className="absolute bottom-8 left-8 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
            <div className="absolute bottom-8 right-8 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />

            {/* Scanning Overlay */}
            {status === "SCANNING" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-primary/10 backdrop-blur-[2px]">
                <div className="w-full h-1 bg-primary absolute top-0 animate-[scan_2s_linear_infinite] shadow-[0_0_20px_#FA43AD]" />
                <div className="p-8 rounded-[32px] bg-black/80 border border-primary/30 flex flex-col items-center gap-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-primary font-black uppercase tracking-widest text-xs">
                    Uploading & Verifying...
                  </p>
                </div>
              </div>
            )}

            {status === "VERIFIED" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-status-green/10 backdrop-blur-sm animate-in zoom-in duration-300">
                <div className="p-10 rounded-full bg-status-green text-white shadow-2xl shadow-status-green/40">
                  <ShieldCheck size={48} />
                </div>
                <p className="mt-6 text-status-green font-black uppercase tracking-widest text-sm">
                  Asset Verified Successfully
                </p>
              </div>
            )}

            {status === "ERROR" && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-status-red/10 backdrop-blur-sm">
                <p className="text-status-red font-black uppercase tracking-widest text-sm">
                  Upload Failed - Try Again
                </p>
              </div>
            )}

            {status === "IDLE" && !cameraReady && (
              <div className="flex flex-col items-center text-center p-12 space-y-4 z-10">
                <div className="w-20 h-20 rounded-[30px] bg-white/5 flex items-center justify-center text-white/20 mb-2">
                  <Camera size={40} />
                </div>
                <h4 className="text-xl font-bold text-white">
                  Initializing Camera...
                </h4>
                <p className="text-sm text-white/40 max-w-xs">
                  Please allow camera access when prompted.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Control Deck */}
        <div className="bg-black/80 px-6 md:px-12 py-6 md:py-10 flex items-center justify-center gap-12 md:gap-24 border-t border-white/5 z-20">
          <div className="flex flex-col items-center gap-2 opacity-40">
            <button className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white">
              <Zap size={24} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              Flash
            </span>
          </div>

          <button
            onClick={handleShutter}
            disabled={isCapturing || !cameraReady}
            className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-8 border-white/20 p-2 transition-all ${
              isCapturing || !cameraReady
                ? "opacity-50 scale-90"
                : "hover:scale-105 active:scale-95"
            }`}
          >
            <div
              className={`w-full h-full rounded-full transition-all flex items-center justify-center ${
                isCapturing
                  ? "bg-primary"
                  : "bg-white shadow-[0_0_30px_rgba(255,255,255,0.4)]"
              }`}
            >
              {isCapturing ? (
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Camera size={32} className="text-black" />
              )}
            </div>
          </button>

          <div className="flex flex-col items-center gap-2 opacity-40">
            <button
              onClick={switchCamera}
              className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center text-white hover:opacity-100 transition-opacity"
            >
              <RefreshCcw size={24} />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">
              Switch
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
