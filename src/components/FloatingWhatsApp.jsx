import { MessageCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export default function FloatingWhatsApp({ visible }) {
  const { waLinks } = useStore();

  return (
    <div
      className={`fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] right-4 z-40 flex items-center transition duration-300 md:bottom-8 md:right-8 ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-6 opacity-0'
      }`}
    >
      <a
        href={waLinks.ask}
        className="group relative flex items-center gap-2.5 rounded-full bg-emeraldSoft px-5 py-3.5 text-sm font-bold text-pearl shadow-emerald backdrop-blur-md transition-all duration-300 hover:bg-emeraldDeep hover:shadow-2xl hover:scale-105"
        aria-label="Chat Admin via WhatsApp"
      >
        {/* Pulse ring background */}
        <span className="absolute -inset-1 rounded-full bg-emeraldSoft/40 animate-pulse-ring -z-10" />

        {/* Online green indicator dot */}
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
        </span>

        <MessageCircle size={19} className="transition-transform group-hover:scale-110" />
        <span className="tracking-wide">Chat Admin</span>
      </a>
    </div>
  );
}
