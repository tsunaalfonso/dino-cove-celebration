import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Download, RefreshCw, SwitchCamera } from "lucide-react";
import { toast } from "sonner";
import { usePhotoboothSettings } from "@/hooks/usePhotoboothSettings";
import photoboothFrame from "@/assets/photobooth-frame.png";

const PhotoboothFloatingButton = () => {
  const { settings } = usePhotoboothSettings();
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameImgRef = useRef<HTMLImageElement | null>(null);

  // Preload frame image once
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = photoboothFrame;
    img.onload = () => {
      frameImgRef.current = img;
    };
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  }, [stream]);

  const startCamera = useCallback(async (mode: "user" | "environment") => {
    try {
      stopStream();
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 1280 } },
        audio: false,
      });
      setStream(s);
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        await videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error("Camera error", err);
      toast.error("Could not access camera. Please allow permissions. 🦕");
    }
  }, [stopStream]);

  useEffect(() => {
    if (open && !snapshot) {
      startCamera(facing);
    }
    if (!open) {
      stopStream();
      setSnapshot(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, facing]);

  useEffect(() => {
    return () => stopStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const drawNameOnCanvas = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Crisp blue outlined cartoon name across the top
    const nameSize = Math.round(w * 0.052);
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `bold ${nameSize}px "Fredoka One", "Nunito", sans-serif`;
    const y = Math.round(h * 0.13);
    // Outline
    ctx.lineWidth = Math.max(4, nameSize * 0.18);
    ctx.strokeStyle = "#2563EB";
    ctx.strokeText(settings.pb_title, w / 2, y);
    // Fill
    ctx.fillStyle = "#7DD3FC";
    ctx.fillText(settings.pb_title, w / 2, y);
    ctx.restore();
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 1024;
    const h = video.videoHeight || 1024;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw camera (mirrored if front-facing)
    if (facing === "user") {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -w, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, w, h);
    }

    // Overlay decorative dino frame PNG
    if (frameImgRef.current) {
      ctx.drawImage(frameImgRef.current, 0, 0, w, h);
    }

    // Crisp name on top
    drawNameOnCanvas(ctx, w, h);

    setSnapshot(canvas.toDataURL("image/png"));
    stopStream();
  };

  const retake = () => {
    setSnapshot(null);
    startCamera(facing);
  };

  const dataUrlToBlob = async (dataUrl: string) => {
    const res = await fetch(dataUrl);
    return res.blob();
  };

  const download = async () => {
    if (!snapshot) return;
    try {
      const blob = await dataUrlToBlob(snapshot);
      const filename = `cael-photobooth-${Date.now()}.png`;
      const file = new File([blob], filename, { type: "image/png" });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean };

      if (nav.canShare && nav.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Cael's Dino Photobooth",
            text: "Saved from Cael's christening photobooth 🦕",
          });
          toast.success("Saved! Choose 'Save Image' to add to your gallery 📸");
          return;
        } catch (err) {
          if ((err as Error)?.name === "AbortError") return;
        }
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast.success("Photo downloaded! Check your Downloads or Gallery 🦕");
    } catch (e) {
      console.error(e);
      toast.error("Couldn't save the photo. Try again.");
    }
  };

  const flipCamera = () => {
    setFacing((f) => (f === "user" ? "environment" : "user"));
  };

  return (
    <>
      <button
        aria-label="Open Photobooth"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 group"
      >
        <span className="relative flex h-20 w-20 items-center justify-center">
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-dino-green/40 via-dino-yellow/40 to-dino-orange/40 blur-md animate-egg-glow" />
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-dino-green via-dino-blue to-dino-yellow border-2 border-background shadow-lg shadow-primary/30 transition-transform duration-200 group-hover:scale-110 group-active:scale-95 animate-bounce-gentle">
            <span className="absolute top-2 left-2 h-1.5 w-1.5 rounded-full bg-foreground/20" />
            <span className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-foreground/15" />
            <span className="relative flex items-center justify-center">
              <span className="text-2xl drop-shadow-sm">🦖</span>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow">
                <Camera className="h-3.5 w-3.5 text-primary" />
              </span>
            </span>
          </span>
          <span className="absolute -top-2 -right-2 rounded-full bg-card border border-border px-2 py-0.5 text-[10px] font-heading text-foreground shadow-sm whitespace-nowrap">
            {settings.pb_button_label}
          </span>
        </span>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg w-[95vw] sm:w-full">
          <DialogHeader>
            <DialogTitle className="font-heading text-2xl text-primary">
              📸 Cael's Dino Photobooth
            </DialogTitle>
            <p className="text-sm font-body text-muted-foreground">
              Snap a memory with our jungle dino frame! 🦕
            </p>
          </DialogHeader>

          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted shadow-inner">
            {snapshot ? (
              <img src={snapshot} alt="Photobooth snapshot" className="w-full h-full object-contain" />
            ) : (
              <>
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facing === "user" ? "scale-x-[-1]" : ""}`}
                />
                {/* Decorative dino frame overlay */}
                <img
                  src={photoboothFrame}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 w-full h-full object-cover select-none"
                  draggable={false}
                />
                {/* Name across the top */}
                <div className="pointer-events-none absolute top-[8%] left-0 right-0 text-center px-6">
                  <h3
                    className="font-heading text-lg sm:text-2xl tracking-wide leading-tight"
                    style={{
                      color: "#7DD3FC",
                      WebkitTextStroke: "1.5px #2563EB",
                    }}
                  >
                    {settings.pb_title}
                  </h3>
                </div>
              </>
            )}
          </div>
          <canvas ref={canvasRef} className="hidden" />

          <div className="flex flex-wrap gap-2 justify-center">
            {snapshot ? (
              <>
                <Button onClick={retake} variant="outline" className="rounded-full">
                  <RefreshCw className="mr-2 h-4 w-4" /> Retake
                </Button>
                <Button onClick={download} className="rounded-full">
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
              </>
            ) : (
              <>
                <Button onClick={flipCamera} variant="outline" className="rounded-full">
                  <SwitchCamera className="mr-2 h-4 w-4" /> Flip
                </Button>
                <Button onClick={capture} className="rounded-full">
                  <Camera className="mr-2 h-4 w-4" /> Snap
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PhotoboothFloatingButton;
