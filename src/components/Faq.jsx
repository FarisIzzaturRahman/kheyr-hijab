import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import SectionHeading from './SectionHeading';
import { faqs } from '../data/content';

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section id="faq" className="bg-pearlWarm px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="FAQ" title="Pertanyaan yang Sering Diajukan">
          Temukan informasi singkat seputar bahan, ukuran, warna, cara order, dan pengiriman.
        </SectionHeading>

        <div className="grid gap-4 lg:grid-cols-2">
          {faqs.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <article
                key={item.question}
                className="rounded-lg border border-goldMuted/20 bg-white shadow-[0_14px_40px_rgba(34,25,15,0.045)]"
                data-reveal
                style={{ '--reveal-delay': `${(index % 2) * 80}ms` }}
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-bold text-ink"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                >
                  {item.question}
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-goldMuted transition ${isOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                {isOpen ? (
                  <div className="px-5 pb-5">
                    <p className="text-sm leading-7 text-ink/70">{item.answer}</p>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
