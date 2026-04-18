import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import type { EventSettings } from "@/hooks/useEventSettings";

interface Props {
  settings?: EventSettings;
}

interface MapCardProps {
  title: string;
  venueName: string;
  address: string;
  embedUrl: string;
  directLink: string;
  emoji: string;
}

const MapCard = ({ title, venueName, address, embedUrl, directLink, emoji }: MapCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="bg-card rounded-2xl overflow-hidden shadow-sm border border-border"
  >
    <div className="bg-muted/40 px-5 py-3 border-b border-border">
      <h3 className="font-heading text-lg text-primary">{emoji} {title}</h3>
    </div>
    <div className="aspect-video w-full">
      <iframe
        src={embedUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${title} Location`}
      />
    </div>
    <div className="p-6 text-center">
      <h4 className="font-heading text-base text-foreground mb-1">{venueName}</h4>
      <p className="text-sm text-muted-foreground font-body mb-4">{address}</p>
      <Button
        variant="outline"
        className="rounded-full font-body"
        onClick={() => window.open(directLink, "_blank")}
      >
        📍 Open in Google Maps
      </Button>
    </div>
  </motion.div>
);

const MapSection = ({ settings }: Props) => {
  const churchEmbed = settings?.map_embed_url || EVENT_CONFIG.map.embedUrl;
  const churchLink = settings?.map_direct_link || EVENT_CONFIG.map.directLink;
  const churchVenue = settings?.ceremony_venue || EVENT_CONFIG.map.venueName;
  const churchAddress = settings?.ceremony_address || EVENT_CONFIG.map.fullAddress;

  const receptionEmbed = settings?.reception_map_embed_url?.trim();
  const receptionLink = settings?.reception_map_direct_link?.trim();
  const receptionVenue = settings?.reception_venue || EVENT_CONFIG.reception.venue;
  const receptionAddress = settings?.reception_address || EVENT_CONFIG.reception.address;

  const hasReceptionMap = Boolean(receptionEmbed);

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

        <div className="grid gap-6">
          <MapCard
            title="Church Ceremony"
            emoji="⛪"
            venueName={churchVenue}
            address={churchAddress}
            embedUrl={churchEmbed}
            directLink={churchLink}
          />
          {hasReceptionMap && (
            <MapCard
              title="Reception"
              emoji="🎉"
              venueName={receptionVenue}
              address={receptionAddress}
              embedUrl={receptionEmbed!}
              directLink={receptionLink || receptionEmbed!}
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default MapSection;
