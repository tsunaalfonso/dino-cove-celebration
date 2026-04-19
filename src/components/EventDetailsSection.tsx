import { motion } from "framer-motion";
import type { EventSettings } from "@/hooks/useEventSettings";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import { parseDressCodeColors } from "@/lib/dressCodeColors";

const SectionDivider = () => (
  <div className="flex items-center justify-center gap-3 my-4">
    <div className="h-px w-12 bg-border" />
    <span className="text-dino-green text-lg">🌿</span>
    <div className="h-px w-12 bg-border" />
  </div>
);

interface Props {
  settings?: EventSettings;
}

const EventDetailsSection = ({ settings }: Props) => {
  const cards = [
    {
      icon: "⛪",
      title: "Church Ceremony",
      time: settings?.ceremony_time || EVENT_CONFIG.ceremony.time,
      venue: settings?.ceremony_venue || EVENT_CONFIG.ceremony.venue,
      address: settings?.ceremony_address || EVENT_CONFIG.ceremony.address,
    },
    {
      icon: "🎉",
      title: "Reception",
      time: settings?.reception_time || EVENT_CONFIG.reception.time,
      venue: settings?.reception_venue || EVENT_CONFIG.reception.venue,
      address: settings?.reception_address || EVENT_CONFIG.reception.address,
    },
  ];

  return (
    <section className="py-16 px-4 relative z-10" id="details">
      <div className="max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-heading text-primary mb-2">Event Details</h2>
          <p className="text-muted-foreground font-body">Everything you need to know 🦕</p>
          <SectionDivider />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {cards.map((card, i) => (
            <motion.div key={card.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow">
              <div className="text-4xl mb-3">{card.icon}</div>
              <h3 className="font-heading text-xl text-foreground mb-2">{card.title}</h3>
              <div className="space-y-1 text-sm font-body text-muted-foreground">
                <p>🕐 {card.time}</p>
                <p>📍 {card.venue}</p>
                <p>🗺️ {card.address}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-6">
          <div className="bg-dino-yellow/20 rounded-2xl p-6 border border-dino-yellow/30">
            <h4 className="font-heading text-lg text-foreground mb-2">👗 Dress Code</h4>
            <p className="text-sm font-body text-muted-foreground">{settings?.dress_code || EVENT_CONFIG.dressCode}</p>
            {(() => {
              const colors = parseDressCodeColors(settings?.dress_code_color);
              if (colors.length === 0) return null;
              return (
                <div className="flex flex-wrap gap-3 mt-3">
                  {colors.map((c, i) => (
                    <div key={i} className="flex items-center gap-2 bg-background/60 rounded-full pl-1 pr-3 py-1 border border-border">
                      <span
                        className="inline-block h-6 w-6 rounded-full border-2 border-background shadow-sm ring-1 ring-border"
                        style={{ backgroundColor: c.hex }}
                        aria-label={`Dress code color ${c.name || c.hex}`}
                      />
                      <span className="text-xs font-body font-semibold text-foreground/80">
                        {c.name || c.hex}
                      </span>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          <div className="bg-dino-blue/20 rounded-2xl p-6 border border-dino-blue/30">
            <h4 className="font-heading text-lg text-foreground mb-2">📝 Special Note</h4>
            <p className="text-sm font-body text-muted-foreground">{settings?.special_note || EVENT_CONFIG.specialNote}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EventDetailsSection;
