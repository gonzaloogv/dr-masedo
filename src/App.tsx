import { useState } from "react";
import { Navbar } from "@/components/site/Navbar";
import { Hero } from "@/components/site/Hero";
import { About } from "@/components/site/About";
import { Credentials } from "@/components/site/Credentials";
import { Services } from "@/components/site/Services";
import { Gallery, type ResultRequest } from "@/components/site/Gallery";
import { Testimonials } from "@/components/site/Testimonials";
import { Contact } from "@/components/site/Contact";
import { Footer } from "@/components/site/Footer";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { SectionProgress } from "@/components/site/SectionProgress";

const App = () => {
  const [resultRequest, setResultRequest] = useState<ResultRequest | null>(null);

  const handleOpenResult = (resultId: string) => {
    setResultRequest({ resultId, requestKey: Date.now() });
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-cream">
      <Navbar />
      <Hero />
      <About />
      <Credentials />
      <Services onOpenResult={handleOpenResult} />
      <Gallery resultRequest={resultRequest} />
      <Testimonials />
      <Contact />
      <Footer />
      <WhatsAppFloat />
      <SectionProgress />
    </main>
  );
};

export default App;
