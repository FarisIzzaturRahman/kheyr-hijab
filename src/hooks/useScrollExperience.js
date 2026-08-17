import { useEffect, useState } from 'react';

const sectionIds = ['beranda', 'tentang', 'koleksi', 'keunggulan', 'testimoni', 'faq'];

/**
 * High-performance scroll experience hook
 * - Minimal state transitions (no continuous frame re-renders in parent components)
 * - Optimized IntersectionObservers for active section tracking
 */
export default function useScrollExperience() {
  const [activeSection, setActiveSection] = useState('beranda');
  const [showFloatingCta, setShowFloatingCta] = useState(false);

  useEffect(() => {
    let frame = 0;

    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const shouldShow = scrollTop > window.innerHeight * 0.72;
        setShowFloatingCta((prev) => (prev === shouldShow ? prev : shouldShow));
      });
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        const topId = visible[0]?.target?.id;
        if (topId) {
          setActiveSection((prev) => (prev === topId ? prev : topId));
        }
      },
      {
        rootMargin: '-28% 0px -58% 0px',
        threshold: [0.1, 0.25, 0.5]
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return {
    activeSection,
    showFloatingCta
  };
}
