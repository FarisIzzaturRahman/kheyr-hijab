import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { useMemo, useState } from 'react';
import SectionHeading from './SectionHeading';
import { testimonials } from '../data/content';

export default function Testimonials() {
  const [active, setActive] = useState(0);
  const visible = useMemo(
    () => testimonials.map((item, index) => ({ ...item, featured: index === active })),
    [active]
  );

  const move = (direction) => {
    setActive((current) => (current + direction + testimonials.length) % testimonials.length);
  };

  return (
    <section id="testimoni" className="bg-pearl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Testimoni" title="Apa Kata Mereka?">
            Cerita pelanggan yang merasakan kenyamanan bahan, warna yang anggun, dan pengalaman
            order yang dibantu dengan hangat.
          </SectionHeading>

          <div className="mb-8 flex gap-3">
            <button
              type="button"
              aria-label="Testimoni sebelumnya"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-goldMuted/30 bg-white text-goldMuted transition hover:bg-emeraldSoft hover:text-pearl"
              onClick={() => move(-1)}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              aria-label="Testimoni berikutnya"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-goldMuted/30 bg-white text-goldMuted transition hover:bg-emeraldSoft hover:text-pearl"
              onClick={() => move(1)}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-4">
          {visible.map((item) => (
            <article
              key={item.name}
              className={`rounded-lg border bg-white p-6 shadow-[0_18px_48px_rgba(34,25,15,0.06)] transition duration-300 ${
                item.featured
                  ? 'border-goldMuted/50 ring-4 ring-champagne/30'
                  : 'border-goldMuted/15'
              }`}
              data-reveal
            >
              <div className="flex items-center justify-between">
                <div className="flex gap-1 text-goldMuted" aria-label="Rating bintang lima">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={15} fill="currentColor" />
                  ))}
                </div>
                <Quote size={22} className="text-roseClay/70" />
              </div>
              <p className="mt-5 min-h-[7rem] text-sm leading-7 text-ink/70">{item.text}</p>
              <div className="mt-6 border-t border-goldMuted/15 pt-4">
                <p className="font-bold text-ink">{item.name}</p>
                <p className="mt-1 text-sm text-ink/60">
                  {item.city} - {item.product}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-7 flex justify-center gap-2">
          {testimonials.map((item, index) => (
            <button
              key={item.name}
              type="button"
              aria-label={`Lihat testimoni ${item.name}`}
              className={`h-2.5 rounded-full transition-all ${
                index === active ? 'w-8 bg-goldMuted' : 'w-2.5 bg-goldMuted/30'
              }`}
              onClick={() => setActive(index)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
