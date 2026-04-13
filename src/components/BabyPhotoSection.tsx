import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

const BUCKET = "baby-photos";

const BabyPhotoSection = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    supabase.storage.from(BUCKET).list("", { limit: 10 }).then(({ data }) => {
      const file = data?.find((f) => f.name.startsWith("baby-photo"));
      if (file) {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(file.name);
        setPhotoUrl(urlData.publicUrl);
      }
    });
  }, []);

  if (!photoUrl) return null;

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
          <div className="inline-block rounded-3xl overflow-hidden border-4 border-dino-green/30 shadow-lg">
            <img
              src={photoUrl}
              alt="Our baby"
              className="w-full max-w-md object-cover"
              loading="lazy"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default BabyPhotoSection;
