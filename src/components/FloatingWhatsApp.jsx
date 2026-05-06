import { MessageCircle } from 'lucide-react';
import { brand } from '../data/content';

const orderUrl = `https://wa.me/${brand.whatsapp}?text=${encodeURIComponent(
  'Assalamu alaikum KHEYR, saya ingin tanya koleksi hijab.'
)}`;

export default function FloatingWhatsApp({ visible }) {
  return (
    <a
      href={orderUrl}
      className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex max-w-[calc(100vw-2rem)] items-center justify-center gap-2 rounded-full bg-emeraldSoft px-4 py-3 text-sm font-bold text-pearl shadow-emerald transition duration-300 md:hidden ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <MessageCircle size={18} />
      Chat Admin
    </a>
  );
}
