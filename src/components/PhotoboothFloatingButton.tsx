import { useEffect, useRef, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Download, RefreshCw, SwitchCamera } from "lucide-react";
import { toast } from "sonner";
import { usePhotoboothSettings } from "@/hooks/usePhotoboothSettings";

const PhotoboothFloatingButton = () => {
  const { settings } = usePhotoboothSettings();
  const [open, setOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

  const drawFrame = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    // Outer pastel border
    const border = Math.round(Math.min(w, h) * 0.045);
    ctx.save();
    ctx.lineWidth = border;
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#A8DADC");
    grad.addColorStop(0.5, "#F6E27F");
    grad.addColorStop(1, "#F4A261");
    ctx.strokeStyle = grad;
    ctx.strokeRect(border / 2, border / 2, w - border, h - border);
    ctx.restore();

    // Top corner emojis
    const emojiSize = Math.round(Math.min(w, h) * 0.07);
    ctx.font = `${emojiSize}px serif`;
    ctx.textBaseline = "top";
    ctx.fillText("🦕", border * 1.2, border * 1.2);
    ctx.textAlign = "right";
    ctx.fillText("🥚", w - border * 1.2, border * 1.2);
    ctx.textAlign = "left";

    // Bottom name plate
    const plateH = Math.round(h * 0.13);
    const plateY = h - plateH - border;
    ctx.save();
    const plateGrad = ctx.createLinearGradient(0, plateY, 0, plateY + plateH);
    plateGrad.addColorStop(0, "rgba(255,255,255,0.92)");
    plateGrad.addColorStop(1, "rgba(255,255,255,0.78)");
    ctx.fillStyle = plateGrad;
    const radius = plateH * 0.3;
    const x = border;
    const wPlate = w - border * 2;
    ctx.beginPath();
    ctx.moveTo(x + radius, plateY);
    ctx.lineTo(x + wPlate - radius, plateY);
    ctx.quadraticCurveTo(x + wPlate, plateY, x + wPlate, plateY + radius);
    ctx.lineTo(x + wPlate, plateY + plateH - radius);
    ctx.quadraticCurveTo(x + wPlate, plateY + plateH, x + wPlate - radius, plateY + plateH);
    ctx.lineTo(x + radius, plateY + plateH);
    ctx.quadraticCurveTo(x, plateY + plateH, x, plateY + plateH - radius);
    ctx.lineTo(x, plateY + radius);
    ctx.quadraticCurveTo(x, plateY, x + radius, plateY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Name text
    ctx.fillStyle = "#3A6E4B";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const nameSize = Math.round(plateH * 0.36);
    ctx.font = `bold ${nameSize}px "Fredoka One", "Nunito", sans-serif`;
    ctx.fillText("CAEL AVERY M. ALFONSO", w / 2, plateY + plateH * 0.38);

    const subSize = Math.round(plateH * 0.22);
    ctx.font = `600 ${subSize}px "Nunito", sans-serif`;
    ctx.fillStyle = "#7a5a2e";
    ctx.fillText("🦕 Our Little Dino • Christening 🦕", w / 2, plateY + plateH * 0.74);
  };

  const capture = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    const w = video.videoWidth || 720;
    const h = video.videoHeight || 720;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Mirror front camera
    if (facing === "user") {
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -w, 0, w, h);
      ctx.restore();
    } else {
      ctx.drawImage(video, 0, 0, w, h);
    }

    drawFrame(ctx, w, h);
    setSnapshot(canvas.toDataURL("image/png"));
    stopStream();
  };

  const retake = () => {
    setSnapshot(null);
    startCamera(facing);
  };

  const download = () => {
    if (!snapshot) return;
    const a = document.createElement("a");
    a.href = snapshot;
    a.download = `cael-photobooth-${Date.now()}.png`;
    a.click();
    toast.success("Photo saved! 🦕");
  };

  const flipCamera = () => {
    const next = facing === "user" ? "environment" : "user";
    setFacing(next);
  };

  return (
    <>
      <button
        aria-label="Open Photobooth"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-40 group"
      >
        <span className="relative flex h-20 w-20 items-center justify-center">
          {/* Glow */}
          <span className="absolute inset-0 rounded-full bg-gradient-to-br from-dino-green/40 via-dino-yellow/40 to-dino-orange/40 blur-md animate-egg-glow" />

          {/* Dino head body */}
          <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-dino-green via-dino-blue to-dino-yellow border-2 border-background shadow-lg shadow-primary/30 transition-transform duration-200 group-hover:scale-110 group-active:scale-95 animate-bounce-gentle">
            {/* Spots */}
            <span className="absolute top-2 left-2 h-1.5 w-1.5 rounded-full bg-foreground/20" />
            <span className="absolute bottom-3 right-3 h-1.5 w-1.5 rounded-full bg-foreground/15" />

            {/* Camera icon over dino */}
            <span className="relative flex items-center justify-center">
              <span className="text-2xl drop-shadow-sm">🦖</span>
              <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-card border border-border shadow">
                <Camera className="h-3.5 w-3.5 text-primary" />
              </span>
            </span>
          </span>

          {/* Label */}
          <span className="absolute -top-2 -right-2 rounded-full bg-card border border-border px-2 py-0.5 text-[10px] font-heading text-foreground shadow-sm whitespace-nowrap">
            Photobooth
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
              Snap a memory with our little dino frame! 🦕
            </p>
          </DialogHeader>

          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-muted border-4 border-dino-green/30 shadow-inner">
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
                {/* Live frame overlay preview */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-2 rounded-xl border-4 border-transparent" style={{ borderImage: "linear-gradient(135deg, #A8DADC, #F6E27F, #F4A261) 1" }} />
                  <span className="absolute top-3 left-3 text-2xl">🦕</span>
                  <span className="absolute top-3 right-3 text-2xl">🥚</span>
                  <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-card/85 backdrop-blur-sm px-3 py-2 text-center">
                    <p className="font-heading text-sm text-primary leading-tight">CAEL AVERY M. ALFONSO</p>
                    <p className="font-body text-[10px] text-muted-foreground">🦕 Our Little Dino • Christening 🦕</p>
                  </div>
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
