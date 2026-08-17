import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { faqs } from '../data/content';

export default function Faq() {
  const { waLinks } = useStore();
  const [openIndex, setOpenIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenIndex((current) => (current === index ? null : index));
  };

  return (
    <section id="faq" className="bg-pearlWarm px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr] lg:gap-16 lg:items-start">
          
          {/* Left Column: Heading + Sticky Consultation Concierge Box */}
          <div className="flex flex-col gap-8 lg:sticky lg:top-28 lg:self-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider text-goldMuted">FAQ</p>
              <h2 className="mt-2 font-display text-4xl font-semibold leading-tight text-ink md:text-5xl">
                Pertanyaan yang Sering Diajukan
              </h2>
              <p className="mt-4 text-base leading-8 text-ink/70">
                Temukan informasi lengkap dan ringkas seputar material bahan, ukuran scarf, akurasi warna, cara pemesanan, hingga garansi retur.
              </p>
            </div>

            {/* Stylist Consultation Concierge Box (Stays in place on the left side, never pushed by accordions) */}
            <div className="overflow-hidden rounded-2xl border border-champagne/40 bg-gradient-to-br from-emeraldDeep via-emeraldSoft to-emeraldDeep p-6 sm:p-7 text-pearl shadow-emerald">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-champagne/20 text-champagne backdrop-blur-md">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <h3 className="font-display text-xl font-bold text-champagne">
                    Butuh Bantuan Hijab?
                  </h3>
                  <p className="text-xs text-pearl/75">Konsultasi Gratis dengan Stylist</p>
                </div>
              </div>

              <p className="mt-3.5 text-xs sm:text-sm leading-relaxed text-pearl/80">
                Masih ragu memilih warna yang cocok dengan tone kulit atau outfit acara Anda? Tanyakan langsung ke Hijab Stylist kami.
              </p>

              <a
                href={waLinks.stylist}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-champagne px-5 py-3 text-xs sm:text-sm font-bold text-emeraldInk shadow-md transition hover:bg-pearl hover:shadow-lg"
              >
                <MessageCircle size={17} />
                Konsultasi via WhatsApp
              </a>
            </div>
          </div>

          {/* Right Column: FAQ Accordion List (Expands smoothly without affecting the left column) */}
          <div className="flex flex-col gap-4 sm:gap-4.5">
            {faqs.map((item, index) => {
              const isOpen = openIndex === index;
              const contentId = `faq-content-${index}`;
              const headerId = `faq-header-${index}`;

              return (
                <article
                  key={item.question}
                  className={`overflow-hidden rounded-2xl border bg-white shadow-[0_10px_30px_rgba(34,25,15,0.03)] transition-all duration-300 ${
                    isOpen
                      ? 'border-goldMuted/50 shadow-soft ring-1 ring-champagne/40'
                      : 'border-goldMuted/20 hover:border-goldMuted/40'
                  }`}
                >
                  <button
                    id={headerId}
                    type="button"
                    className="flex w-full items-center justify-between gap-4 px-5 sm:px-6 py-4.5 sm:py-5 text-left text-sm sm:text-base font-bold text-ink transition hover:text-goldMuted"
                    aria-expanded={isOpen}
                    aria-controls={contentId}
                    onClick={() => toggleFaq(index)}
                  >
                    <span className="leading-snug pr-2">{item.question}</span>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                        isOpen ? 'bg-emeraldSoft text-pearl' : 'bg-pearlWarm text-goldMuted'
                      }`}
                    >
                      <ChevronDown
                        size={18}
                        className={`transition-transform duration-300 ${isOpen ? 'rotate-180 text-pearl' : ''}`}
                      />
                    </div>
                  </button>

                  {isOpen ? (
                    <div id={contentId} role="region" aria-labelledby={headerId} className="px-5 sm:px-6 pb-5 sm:pb-6 animate-floatIn">
                      <div className="border-t border-goldMuted/15 pt-3.5">
                        <p className="text-xs sm:text-sm leading-relaxed text-ink/75">{item.answer}</p>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>

        </div>
      </div>
    </section>
  );
}
