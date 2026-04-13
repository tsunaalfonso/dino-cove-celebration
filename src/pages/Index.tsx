import dinoRunning from "@/assets/dino-running.png";
import FloatingElements from "@/components/FloatingElements";
import HeroSection from "@/components/HeroSection";
import EventDetailsSection from "@/components/EventDetailsSection";
import BabyPhotoSection from "@/components/BabyPhotoSection";
import MapSection from "@/components/MapSection";
import RsvpSection from "@/components/RsvpSection";
import Footer from "@/components/Footer";
import { useEventSettings } from "@/hooks/useEventSettings";

const Index = () => {
  const { settings, loading } = useEventSettings();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background gap-6">
        <img
          src={dinoRunning}
          alt="Loading..."
          className="w-24 h-24 animate-bounce-gentle drop-shadow-lg"
        />
        <p className="font-heading text-xl text-primary animate-pulse">Loading... 🦕</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <FloatingElements />
      <HeroSection settings={settings} />
      <EventDetailsSection settings={settings} />
      <BabyPhotoSection />
      <MapSection settings={settings} />
      <RsvpSection />
      <Footer />
    </div>
  );
};

export default Index;
