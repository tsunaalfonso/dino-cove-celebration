import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Gift, ExternalLink, Check } from "lucide-react";

interface WishlistItem {
  id: string;
  name: string;
  link: string | null;
  image_url: string | null;
  claimed: boolean;
}

const WishlistSection = () => {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("wishlist_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setItems(data as WishlistItem[]);
        setLoading(false);
      });
  }, []);

  if (loading || items.length === 0) return null;

  return (
    <section className="py-16 px-4 relative z-10" id="wishlist">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-3">
            <Gift className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-heading text-primary mb-2">
            Avery's Wishlist 🎁
          </h2>
          <p className="text-muted-foreground font-body">
            Sweet little gift ideas for our baby dino
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {items.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden flex flex-col"
            >
              <div className="relative w-full aspect-square bg-muted">
                {item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className={`w-full h-full object-cover ${item.claimed ? "opacity-60" : ""}`}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Gift className="w-12 h-12 text-muted-foreground/40" />
                  </div>
                )}
                {item.claimed && (
                  <div className="absolute top-2 right-2 bg-dino-green text-white text-xs font-body font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
                    <Check className="w-3 h-3" /> Claimed
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col gap-2 flex-1">
                <h3 className="font-heading text-lg text-foreground leading-tight">
                  {item.name}
                </h3>
                {item.link && !item.claimed && (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto inline-flex items-center gap-1.5 text-sm font-body font-semibold text-primary hover:underline"
                  >
                    View gift <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WishlistSection;
