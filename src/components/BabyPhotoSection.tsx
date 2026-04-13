import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const BUCKET = "baby-photos";

const BabyPhotoSection = () => {
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    supabase.storage.from(BUCKET).list("", { limit: 50 }).then(({ data }) => {
      if (!data?.length) return;
      const images = data
        .filter((f) => !f.name.startsWith("."))
        .sort((a, b) => a.name.localeCompare(b.name));
      const urls = images.map((f) => {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
        return urlData.publicUrl;
      });
      setPhotoUrls(urls);
    });
  }, []);

  const prev = useCallback(() => setCurrent((c) => (c - 1 + photoUrls.length) % photoUrls.length), [photoUrls.length]);
  const next = useCallback(() => setCurrent((c) => (c + 1) % photoUrls.length), [photoUrls.length]);

  useEffect(() => {
    if (photoUrls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % photoUrls.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [photoUrls.length]);

  if (!photoUrls.length) return null;

  return (
    <section className="py-16 px-4 relative z-10">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-4xl font-heading text-primary mb-2">Our Little Dino 🦕</h2>
          <p className="text-muted-foreground font-body mb-6">A sneak peek at our adorable baby!</p>

          <div className="relative inline-block">
            <div className="w-72 h-72 md:w-96 md:h-96 rounded-3xl overflow-hidden border-4 border-dino-green/30 shadow-lg">
              <img
                src={photoUrls[current]}
                alt={`Baby photo ${current + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
                loading="lazy"
              />
            </div>

            {photoUrls.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prev}
                  className="absolute left-[-20px] top-1/2 -translate-y-1/2 rounded-full h-10 w-10 bg-card/80 backdrop-blur-sm border-border shadow-md"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={next}
                  className="absolute right-[-20px] top-1/2 -translate-y-1/2 rounded-full h-10 w-10 bg-card/80 backdrop-blur-sm border-border shadow-md"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>

                <div className="flex justify-center gap-2 mt-4">
                  {photoUrls.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        i === current ? "bg-primary scale-125" : "bg-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BabyPhotoSection;
