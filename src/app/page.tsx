import { Navbar } from "@/components/website/navbar";
import { HeroSection } from "@/components/website/hero-section";
import { AboutSection } from "@/components/website/about-section";
import { RoomsSection } from "@/components/website/rooms-section";
import { FooterOversized } from "@/components/website/footer-oversized";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Main Content */}
      <main>
        <HeroSection />
        <AboutSection />
        <RoomsSection />
      </main>

      <FooterOversized />
    </div>
  );
}
