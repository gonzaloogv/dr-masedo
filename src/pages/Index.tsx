import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";

import { Credentials } from "@/components/site/Credentials";
import { Services } from "@/components/site/Services";
import { Gallery } from "@/components/site/Gallery";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { SectionProgress } from "@/components/site/SectionProgress";

const Index = () => {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <Hero />
      <About />
      <Credentials />
      <Services />
      <Gallery />
      <Testimonials />
      <Contact />
      <Footer />
      <WhatsAppFloat />
      <SectionProgress />
    </main>
  );
};

export default Index;
