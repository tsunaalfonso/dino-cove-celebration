import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { EVENT_CONFIG } from "@/lib/eventConfig";
import babyDino from "@/assets/baby-dino-hero.png";

const HeroSection = () => {
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const target = new Date(EVENT_CONFIG.eventDate + "T00:00:00").getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      setCountdown({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const scrollToRsvp = () => {
    document.getElementById("rsvp")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 pb-12 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center max-w-2xl mx-auto z-10"
      >
        {/* Badge */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="inline-block mb-6 px-4 py-1.5 rounded-full bg-dino-yellow/40 border border-dino-yellow/60"
        >
          <span className="text-sm font-semibold text-accent-foreground font-body">🦕 Our Little Dino</span>
        </motion.div>

        {/* Hero Image */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <img
            src={babyDino}
            alt="Cute baby dinosaur in an egg"
            className="w-48 h-48 md:w-64 md:h-64 mx-auto animate-bounce-gentle"
            width={256}
            height={256}
          />
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground font-body text-base md:text-lg mb-2"
        >
          You're Invited to the Christening of
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-3xl md:text-5xl lg:text-6xl font-heading text-primary mb-4 leading-tight"
        >
          {EVENT_CONFIG.babyName}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-muted-foreground font-body text-base md:text-lg mb-8"
        >
          Join us as we celebrate the baptism of our little dino 🦕
        </motion.p>

        {/* Event Quick Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="flex flex-wrap justify-center gap-4 mb-8 text-sm font-body"
        >
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm border border-border">
            <span>📅</span>
            <span className="font-semibold">May 9, 2026</span>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm border border-border">
            <span>⏰</span>
            <span className="font-semibold">{EVENT_CONFIG.eventTime}</span>
          </div>
          <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm border border-border">
            <span>📍</span>
            <span className="font-semibold">{EVENT_CONFIG.ceremony.venue}</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1 }}
        >
          <Button
            onClick={scrollToRsvp}
            size="lg"
            className="text-lg px-10 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-heading"
          >
            RSVP Now 🦖
          </Button>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-10 flex justify-center gap-3 md:gap-6"
        >
          {[
            { label: "Days", value: countdown.days },
            { label: "Hours", value: countdown.hours },
            { label: "Mins", value: countdown.minutes },
            { label: "Secs", value: countdown.seconds },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center bg-card/80 backdrop-blur rounded-2xl px-4 py-3 min-w-[60px] shadow-sm border border-border"
            >
              <span className="text-2xl md:text-3xl font-heading text-primary">
                {String(item.value).padStart(2, "0")}
              </span>
              <span className="text-xs text-muted-foreground font-body">{item.label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
