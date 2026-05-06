import { useState } from 'react';
import About from './components/About';
import Advantages from './components/Advantages';
import Collections from './components/Collections';
import Faq from './components/Faq';
import FloatingWhatsApp from './components/FloatingWhatsApp';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import ScrollProgress from './components/ScrollProgress';
import Testimonials from './components/Testimonials';
import useScrollExperience from './hooks/useScrollExperience';

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { activeSection, heroOffset, scrollProgress, showFloatingCta } = useScrollExperience();

  return (
    <>
      <ScrollProgress value={scrollProgress} />
      <Header activeSection={activeSection} onMenuOpenChange={setMobileMenuOpen} />
      <main>
        <Hero scrollOffset={heroOffset} />
        <About />
        <Collections />
        <Advantages />
        <Testimonials />
        <Faq />
      </main>
      <Footer />
      <FloatingWhatsApp visible={showFloatingCta && !mobileMenuOpen} />
    </>
  );
}
