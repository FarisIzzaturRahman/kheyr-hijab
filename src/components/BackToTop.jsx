import { ArrowUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const shouldShow = scrollTop > 400;
        setVisible((prev) => (prev === shouldShow ? prev : shouldShow));
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Kembali ke atas"
      className={`fixed bottom-20 right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-goldMuted/30 bg-pearlWarm text-emeraldInk shadow-soft backdrop-blur-md transition-all duration-300 hover:bg-emeraldSoft hover:text-pearl md:bottom-8 md:right-8 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <ArrowUp size={18} />
    </button>
  );
}
