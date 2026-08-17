import { Gift, Palette, Scissors, Shirt, Sparkles } from 'lucide-react';
import SectionHeading from './SectionHeading';
import { advantages } from '../data/content';

const icons = [Shirt, Scissors, Palette, Sparkles, Gift];

export default function Advantages() {
  return (
    <section id="keunggulan" className="bg-pearlWarm px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 flex items-center gap-5">
          <div className="h-px flex-1 bg-goldMuted/25" />
          <Sparkles className="text-goldMuted" size={24} />
          <div className="h-px flex-1 bg-goldMuted/25" />
        </div>

        <SectionHeading eyebrow="Keunggulan Kami" title="Kenapa Memilih KHEYR?">
          Setiap detail dirancang untuk memberi rasa percaya diri sejak produk dilihat,
          disentuh, dipakai, sampai diterima sebagai paket yang cantik.
        </SectionHeading>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {advantages.map((item, index) => {
            const Icon = icons[index];

            return (
              <article
                key={item.title}
                className="rounded-2xl border border-goldMuted/20 bg-white/80 p-6 text-center shadow-[0_16px_46px_rgba(34,25,15,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-soft"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-goldMuted/25 bg-pearlWarm/60 text-goldMuted shadow-inner">
                  <Icon size={28} strokeWidth={1.7} />
                </div>
                <h3 className="mt-5 font-bold text-ink">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-ink/65">{item.description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
