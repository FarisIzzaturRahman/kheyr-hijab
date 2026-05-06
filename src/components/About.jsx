import { BadgeCheck, Flower2, Gem, Sparkles } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { brandValues } from '../data/content';

const icons = [Flower2, Sparkles, BadgeCheck, Gem];

export default function About() {
  return (
    <section id="tentang" className="bg-pearl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div>
          <SectionHeading eyebrow="Tentang KHEYR" title="Lebih dari Sekadar Hijab">
            KHEYR hadir untuk muslimah yang ingin tampil anggun, percaya diri, dan tetap nyaman
            dalam setiap aktivitas. Setiap koleksi dirancang agar mudah dipadukan, terasa ringan,
            dan terlihat berkelas.
          </SectionHeading>

          <p className="max-w-2xl text-base leading-8 text-ink/70">
            Kami percaya hijab bukan hanya pelengkap, tetapi bagian dari identitas dan keindahan
            yang patut dirayakan setiap hari. Karena itu, KHEYR menggabungkan material pilihan,
            warna timeless, dan finishing rapi dalam satu pengalaman brand yang hangat.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            {brandValues.map((value, index) => {
              const Icon = icons[index];

              return (
                <article
                  key={value.title}
                  className="rounded-lg border border-goldMuted/20 bg-pearlWarm/80 p-5 shadow-[0_14px_40px_rgba(34,25,15,0.05)]"
                  data-reveal
                  style={{ '--reveal-delay': `${index * 70}ms` }}
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full border border-goldMuted/30 text-goldMuted">
                    <Icon size={20} />
                  </div>
                  <h3 className="font-semibold text-ink">{value.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-ink/60">{value.description}</p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="relative" data-reveal>
          <div className="overflow-hidden rounded-lg border border-champagne/50 bg-mist shadow-soft">
            <img
              src="/images/product-luna-silk.png"
              alt="Koleksi KHEYR Luna Silk"
              className="h-[520px] w-full object-cover object-center"
            />
          </div>
          <div className="absolute -bottom-8 -left-4 hidden w-44 overflow-hidden rounded-lg border border-champagne/50 bg-satin bg-cover bg-center p-6 text-center shadow-emerald sm:block">
            <p className="font-display text-4xl font-semibold text-champagne">KHEYR</p>
            <p className="mt-3 text-xs font-semibold text-pearl/80">Elegan, nyaman, terpercaya.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
