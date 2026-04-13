import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EVENT_CONFIG } from "@/lib/eventConfig";

const MapSection = () => {
  return (
    <section className="py-16 px-4 relative z-10" id="map">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h2 className="text-3xl md:text-4xl font-heading text-primary mb-2">Find Us Here</h2>
          <p className="text-muted-foreground font-body">We can't wait to see you! 🗺️</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
        >
          <div className="aspect-video w-full">
            <iframe
              src={EVENT_CONFIG.map.embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Venue Location"
            />
          </div>
          <div className="p-6 text-center">
            <h3 className="font-heading text-lg text-foreground mb-1">{EVENT_CONFIG.map.venueName}</h3>
            <p className="text-sm text-muted-foreground font-body mb-4">{EVENT_CONFIG.map.fullAddress}</p>
            <Button
              variant="outline"
              className="rounded-full font-body"
              onClick={() => window.open(EVENT_CONFIG.map.directLink, "_blank")}
            >
              📍 Open in Google Maps
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default MapSection;
