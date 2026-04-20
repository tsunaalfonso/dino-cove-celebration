import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Users } from "lucide-react";

interface Godparent {
  id: string;
  role: "ninong" | "ninang";
  name: string;
  sort_order: number;
}

const GodparentsFloatingButton = () => {
  const [items, setItems] = useState<Godparent[]>([]);
  const [open, setOpen] = useState(false);

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

  if (items.length === 0) return null;

  const ninongs = items.filter((i) => i.role === "ninong");
  const ninangs = items.filter((i) => i.role === "ninang");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="View Ninongs and Ninangs"
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-5 py-3 shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform animate-bounce-gentle font-heading"
        >
          <Users className="h-5 w-5" />
          <span className="hidden sm:inline text-sm">Ninongs & Ninangs</span>
          <span className="sm:hidden text-sm">Godparents</span>
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
