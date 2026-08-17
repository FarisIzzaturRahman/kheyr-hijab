import { useEffect, useRef } from 'react';

/**
 * Ultra-smooth scroll progress indicator using direct DOM transform
 * to achieve 60-120fps without re-rendering parent React trees.
 */
export default function ScrollProgress({ value }) {
  const barRef = useRef(null);

  useEffect(() => {
    if (value !== undefined) {
      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${value})`;
      }
      return undefined;
    }

    let frame = 0;
    const updateProgress = () => {
      if (!barRef.current) return;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(Math.max(scrollTop / scrollable, 0), 1) : 0;
      barRef.current.style.transform = `scaleX(${progress})`;
    };

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        updateProgress();
      });
    };

    updateProgress();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [value]);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[3px] bg-transparent pointer-events-none" aria-hidden="true">
      <div
        ref={barRef}
        className="h-full origin-left bg-champagne shadow-[0_0_18px_rgba(232,217,189,0.55)] will-change-transform"
        style={{ transform: value !== undefined ? `scaleX(${value})` : 'scaleX(0)' }}
      />
    </div>
  );
}
