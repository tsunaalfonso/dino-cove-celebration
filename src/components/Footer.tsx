import { EVENT_CONFIG } from "@/lib/eventConfig";

const Footer = () => (
  <footer className="py-10 px-4 text-center relative z-10 border-t border-border">
    <p className="font-body text-sm text-muted-foreground">
      Made with 💚 for <span className="font-semibold text-foreground">{EVENT_CONFIG.babyName}</span>'s Christening
    </p>
    <p className="font-body text-xs text-muted-foreground/60 mt-2">🦕🌿🥚</p>
  </footer>
);

export default Footer;
