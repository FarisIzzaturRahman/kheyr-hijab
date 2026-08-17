import { CheckCircle2, ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import SectionHeading from './SectionHeading';
import { testimonials } from '../data/content';

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const move = useCallback((direction) => {
    setActive((current) => (current + direction + testimonials.length) % testimonials.length);
  }, []);

  // Auto-play timer (pause when hovered/focused)
  useEffect(() => {
    if (isPaused) return undefined;
    const interval = setInterval(() => {
      move(1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused, move]);

  const visible = useMemo(
    () => testimonials.map((item, index) => ({ ...item, featured: index === active })),
    [active]
  );

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') move(-1);
    if (e.key === 'ArrowRight') move(1);
  };

  return (
    <section
      id="testimoni"
      className="bg-pearl px-4 py-20 sm:px-6 lg:px-8 lg:py-24"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      aria-label="Bagian Testimoni Pelanggan"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Testimoni" title="Apa Kata Mereka?">
            Cerita pelanggan setia yang merasakan kenyamanan bahan, warna yang anggun, dan pengalaman
            order yang dibantu dengan hangat.
          </SectionHeading>

          <div className="mb-8 flex gap-3">
            <button
              type="button"
              aria-label="Testimoni sebelumnya"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-goldMuted/30 bg-white text-goldMuted shadow-sm transition hover:bg-emeraldSoft hover:text-pearl"
              onClick={() => move(-1)}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Testimoni berikutnya"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-goldMuted/30 bg-white text-goldMuted shadow-sm transition hover:bg-emeraldSoft hover:text-pearl"
              onClick={() => move(1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {visible.map((item) => {
            const initials = item.name
              .split(' ')
              .map((n) => n[0])
              .join('');

            return (
              <article
                key={item.name}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-6 shadow-[0_18px_48px_rgba(34,25,15,0.06)] transition-all duration-300 hover:shadow-soft ${
                  item.featured
                    ? 'border-goldMuted ring-4 ring-champagne/40 shadow-emerald scale-[1.02]'
                    : 'border-goldMuted/15'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1 text-goldMuted" aria-label={`Rating bintang ${item.rating || 5}`}>
                      {Array.from({ length: item.rating || 5 }).map((_, index) => (
                        <Star key={index} size={15} fill="currentColor" />
                      ))}
                    </div>
                    <Quote size={24} className="text-roseClay/60" />
                  </div>
                  <p className="mt-4 min-h-[6.5rem] text-sm leading-relaxed text-ink/75 italic">
                    &ldquo;{item.text}&rdquo;
                  </p>
                </div>

                <div className="mt-6 flex items-center gap-3.5 border-t border-goldMuted/15 pt-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-roseClay font-display text-sm font-bold text-emeraldInk shadow-inner">
                    {initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="font-bold text-ink text-sm">{item.name}</p>
                      {item.verified ? (
                        <CheckCircle2 size={14} className="text-emeraldSoft" title="Pembeli Terverifikasi" />
                      ) : null}
                    </div>
                    <p className="text-xs text-ink/60">
                      {item.city} • <span className="font-semibold text-emeraldSoft">{item.product}</span>
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Indicators */}
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Lihat testimoni ${item.name}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === active ? 'w-8 bg-goldMuted shadow-sm' : 'w-2.5 bg-goldMuted/30 hover:bg-goldMuted/60'
              }`}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
