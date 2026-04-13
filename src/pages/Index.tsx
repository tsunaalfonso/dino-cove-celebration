import FloatingElements from "@/components/FloatingElements";
import HeroSection from "@/components/HeroSection";
import EventDetailsSection from "@/components/EventDetailsSection";
import MapSection from "@/components/MapSection";
import RsvpSection from "@/components/RsvpSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <FloatingElements />
      <HeroSection />
      <EventDetailsSection />
      <MapSection />
      <RsvpSection />
      <Footer />
    </div>
  );
};

export default Index;
