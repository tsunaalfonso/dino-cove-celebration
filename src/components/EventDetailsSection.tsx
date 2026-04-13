import { motion } from "framer-motion";
import { EVENT_CONFIG } from "@/lib/eventConfig";

const SectionDivider = () => (
  <div className="flex items-center justify-center gap-3 my-4">
    <div className="h-px w-12 bg-border" />
    <span className="text-dino-green text-lg">🌿</span>
    <div className="h-px w-12 bg-border" />
  </div>
);

const EventDetailsSection = () => {
  const cards = [
    {
      icon: "⛪",
      title: EVENT_CONFIG.ceremony.name,
      time: EVENT_CONFIG.ceremony.time,
      venue: EVENT_CONFIG.ceremony.venue,
      address: EVENT_CONFIG.ceremony.address,
    },
    {
      icon: "🎉",
      title: EVENT_CONFIG.reception.name,
      time: EVENT_CONFIG.reception.time,
      venue: EVENT_CONFIG.reception.venue,
      address: EVENT_CONFIG.reception.address,
    },
  ];

  return (
    <section className="py-16 px-4 relative z-10" id="details">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-heading text-primary mb-2">Event Details</h2>
          <p className="text-muted-foreground font-body">Everything you need to know 🦕</p>
          <SectionDivider />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="bg-card rounded-2xl p-6 shadow-sm border border-border hover:shadow-md transition-shadow"
            >
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

        {/* Dress Code & Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="bg-dino-yellow/20 rounded-2xl p-6 border border-dino-yellow/30">
            <h4 className="font-heading text-lg text-foreground mb-2">👗 Dress Code</h4>
            <p className="text-sm font-body text-muted-foreground">{EVENT_CONFIG.dressCode}</p>
          </div>
          <div className="bg-dino-blue/20 rounded-2xl p-6 border border-dino-blue/30">
            <h4 className="font-heading text-lg text-foreground mb-2">📝 Special Note</h4>
            <p className="text-sm font-body text-muted-foreground">{EVENT_CONFIG.specialNote}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default EventDetailsSection;
