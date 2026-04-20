import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

interface Godparent {
  id: string;
  role: "ninong" | "ninang";
  name: string;
  sort_order: number;
}

const SPARKLE_COUNT = 8;

const GodparentsFloatingButton = () => {
  const [items, setItems] = useState<Godparent[]>([]);
  const [open, setOpen] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [sparkles, setSparkles] = useState<{ id: number; tx: string; ty: string; emoji: string }[]>([]);
  const sparkleId = useRef(0);

  useEffect(() => {
    supabase
      .from("godparents")
      .select("*")
      .order("role", { ascending: true })
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data as Godparent[]);
      });
  }, []);

  const triggerEffect = () => {
    setShaking(true);
    const emojis = ["✨", "💫", "⭐", "🦕", "🦖"];
    const burst = Array.from({ length: SPARKLE_COUNT }).map(() => {
      const angle = Math.random() * Math.PI * 2;
      const dist = 60 + Math.random() * 40;
      return {
        id: ++sparkleId.current,
        tx: `${Math.cos(angle) * dist - 50}%`,
        ty: `${Math.sin(angle) * dist - 50}%`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
      };
    });
    setSparkles((prev) => [...prev, ...burst]);
    setTimeout(() => setShaking(false), 600);
    setTimeout(() => {
      setSparkles((prev) => prev.filter((s) => !burst.find((b) => b.id === s.id)));
    }, 800);
  };

  if (items.length === 0) return null;

  const ninongs = items.filter((i) => i.role === "ninong");
  const ninangs = items.filter((i) => i.role === "ninang");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="View Ninongs and Ninangs"
          onClick={triggerEffect}
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

          {/* Egg shape */}
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
            <span className="absolute inset-x-3 top-6 h-0.5 bg-foreground/0 group-hover:bg-foreground/30 transition-colors" />

            {/* Tiny dino peeking */}
            <span className="text-2xl drop-shadow-sm transition-transform group-hover:scale-110">
              🦕
            </span>
          </span>

          {/* Label badge */}
          <span className="absolute -top-2 -left-2 rounded-full bg-card border border-border px-2 py-0.5 text-[10px] font-heading text-foreground shadow-sm whitespace-nowrap">
            Tap me!
          </span>
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
