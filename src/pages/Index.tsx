import FloatingElements from "@/components/FloatingElements";
import HeroSection from "@/components/HeroSection";
import EventDetailsSection from "@/components/EventDetailsSection";
import MapSection from "@/components/MapSection";
import RsvpSection from "@/components/RsvpSection";
import Footer from "@/components/Footer";
import { useEventSettings } from "@/hooks/useEventSettings";

const Index = () => {
  const { settings, loading } = useEventSettings();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-body text-muted-foreground animate-pulse">Loading... 🦕</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <FloatingElements />
      <HeroSection settings={settings} />
      <EventDetailsSection settings={settings} />
      <MapSection settings={settings} />
      <RsvpSection />
      <Footer />
    </div>
  );
};

export default Index;
