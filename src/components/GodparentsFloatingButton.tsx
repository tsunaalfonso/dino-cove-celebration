import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Godparent {
  id: string;
  role: "ninong" | "ninang";
  name: string;
  sort_order: number;
}

const SPARKLE_COUNT = 10;

const TAPPED_KEY = "godparents-egg-tapped";

const GodparentsFloatingButton = () => {
  const [items, setItems] = useState<Godparent[]>([]);
  const [open, setOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [cracking, setCracking] = useState(false);
  const [hasTapped, setHasTapped] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; tx: string; ty: string; emoji: string }[]>([]);
  const sparkleId = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(TAPPED_KEY) === "1") {
      setHasTapped(true);
    }
    supabase
      .from("godparents")
      .select("*")
      .order("role", { ascending: true })
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data as Godparent[]);
      });
  }, []);

  const playCrackSound = () => {
    try {
      if (!audioCtxRef.current) {
        const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        audioCtxRef.current = new Ctx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();
      const now = ctx.currentTime;

      // Crack: short noise burst with quick decay
      const bufferSize = Math.floor(ctx.sampleRate * 0.25);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        const t = i / bufferSize;
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3);
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = "highpass";
      noiseFilter.frequency.value = 1500;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.4, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      noise.connect(noiseFilter).connect(noiseGain).connect(ctx.destination);
      noise.start(now);
      noise.stop(now + 0.25);

      // Tonal "pop" overlay
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(0.0001, now);
      oscGain.gain.exponentialRampToValueAtTime(0.25, now + 0.01);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.connect(oscGain).connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch {
      // Silently ignore audio errors
    }
  };

  const triggerCrackAndOpen = () => {
    if (cracking) return;
    playCrackSound();
    setCracking(true);
    setShaking(true);
    if (!hasTapped) {
      setHasTapped(true);
      try {
        localStorage.setItem(TAPPED_KEY, "1");
      } catch {
        // ignore storage errors
      }
    }

    const emojis = ["✨", "💫", "⭐", "🦕", "🦖"];
    const burst = Array.from({ length: SPARKLE_COUNT }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 70 + Math.random() * 50;
      return {
        id: ++sparkleId.current,
        tx: `${Math.cos(angle) * dist - 50}%`,
        ty: `${Math.sin(angle) * dist - 50}%`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      };
    });
    setSparkles((prev) => [...prev, ...burst]);

    setTimeout(() => setShaking(false), 300);
    setTimeout(() => {
      setOpen(true);
    }, 700);
    setTimeout(() => {
      setCracking(false);
      setSparkles((prev) => prev.filter((s) => !burst.find((b) => b.id === s.id)));
    }, 1100);
  };

  if (items.length === 0) return null;

  const ninongs = items.filter((i) => i.role === "ninong");
  const ninangs = items.filter((i) => i.role === "ninang");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="View Ninongs and Ninangs"
          onClick={(e) => {
            e.preventDefault();
            triggerCrackAndOpen();
          }}
          className="fixed bottom-6 right-6 z-40 group"
        >
          {/* Sparkle burst layer */}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            {sparkles.map((s) => (
              <span
                key={s.id}
                className="absolute left-1/2 top-1/2 text-lg animate-sparkle"
                style={{ ["--tx" as string]: s.tx, ["--ty" as string]: s.ty }}
              >
                {s.emoji}
              </span>
            ))}
          </span>

          {/* Egg container */}
          <span className="relative block h-20 w-16">
            {cracking ? (
              <>
                {/* Top half */}
                <span
                  className="absolute inset-x-0 top-0 h-1/2 overflow-hidden animate-egg-crack-top"
                  style={{ borderRadius: "50%/110% 110% 0 0" }}
                >
                  <span
                    className="absolute inset-0 bg-gradient-to-br from-dino-blue via-dino-yellow to-dino-orange border-2 border-background"
                    style={{ height: "200%", borderRadius: "50%/55% 55% 27.5% 27.5%" }}
                  />
                </span>
                {/* Bottom half */}
                <span
                  className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden animate-egg-crack-bottom"
                  style={{ borderRadius: "50%/0 0 90% 90%" }}
                >
                  <span
                    className="absolute inset-x-0 bottom-0 bg-gradient-to-br from-dino-blue via-dino-yellow to-dino-orange border-2 border-background"
                    style={{ height: "200%", borderRadius: "50%/27.5% 27.5% 45% 45%" }}
                  />
                </span>
                {/* Flash + dino reveal */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="absolute h-10 w-10 rounded-full bg-dino-yellow/70 blur-xl animate-crack-flash" />
                  <span className="relative text-3xl animate-egg-pop drop-shadow-md">🦕</span>
                </span>
              </>
            ) : (
              <span
                className={`relative flex h-20 w-16 items-center justify-center rounded-[50%/55%_55%_45%_45%] bg-gradient-to-br from-dino-blue via-dino-yellow to-dino-orange border-2 border-background shadow-lg shadow-primary/30 animate-egg-glow transition-transform duration-200 group-hover:scale-110 group-active:scale-95 ${
                  shaking ? "animate-egg-shake" : "animate-egg-idle"
                }`}
              >
                {/* Egg spots */}
                <span className="absolute top-3 left-2 h-2 w-3 rounded-full bg-foreground/15 rotate-12" />
                <span className="absolute top-7 right-2 h-1.5 w-2 rounded-full bg-foreground/20" />
                <span className="absolute bottom-4 left-3 h-2 w-2.5 rounded-full bg-foreground/15 -rotate-12" />
                <span className="absolute bottom-6 right-3 h-1 w-1.5 rounded-full bg-foreground/20" />

                {/* Crack hint on hover */}
                <span className="absolute inset-x-3 top-1/2 h-0.5 bg-foreground/0 group-hover:bg-foreground/30 transition-colors" />

                {/* Tiny dino peeking */}
                <span className="text-2xl drop-shadow-sm transition-transform group-hover:scale-110">
                  🦕
                </span>
              </span>
            )}
          </span>

          {/* Label badge — only shown until first tap */}
          {!hasTapped && (
            <span className="absolute -top-2 -left-2 rounded-full bg-card border border-border px-2 py-0.5 text-[10px] font-heading text-foreground shadow-sm whitespace-nowrap animate-bounce-gentle">
              Tap me!
            </span>
          )}
        </button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-heading text-2xl text-primary">
            👫 Ninongs & Ninangs
          </SheetTitle>
          <p className="text-sm font-body text-muted-foreground">
            Our chosen godparents for Cael's special day 🦕
          </p>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <section>
            <h3 className="font-heading text-lg text-foreground mb-3 flex items-center gap-2">
              🤵 Ninongs
              <span className="text-xs font-body text-muted-foreground">({ninongs.length})</span>
            </h3>
            {ninongs.length === 0 ? (
              <p className="text-sm font-body text-muted-foreground italic">To be announced.</p>
            ) : (
              <ul className="space-y-2">
                {ninongs.map((g, i) => (
                  <li
                    key={g.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-dino-blue/15 border border-border animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dino-blue/40 text-foreground font-heading text-sm">
                      {i + 1}
                    </span>
                    <span className="font-body font-semibold text-foreground">{g.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <h3 className="font-heading text-lg text-foreground mb-3 flex items-center gap-2">
              👰 Ninangs
              <span className="text-xs font-body text-muted-foreground">({ninangs.length})</span>
            </h3>
            {ninangs.length === 0 ? (
              <p className="text-sm font-body text-muted-foreground italic">To be announced.</p>
            ) : (
              <ul className="space-y-2">
                {ninangs.map((g, i) => (
                  <li
                    key={g.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-dino-orange/15 border border-border animate-fade-in"
                    style={{ animationDelay: `${i * 60}ms` }}
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-dino-orange/40 text-foreground font-heading text-sm">
                      {i + 1}
                    </span>
                    <span className="font-body font-semibold text-foreground">{g.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default GodparentsFloatingButton;
