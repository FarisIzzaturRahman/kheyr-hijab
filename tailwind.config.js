/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        emeraldInk: '#061d18',
        emeraldDeep: '#092c25',
        emeraldSoft: '#123f35',
        champagne: '#e8d9bd',
        pearl: '#f8f5ef',
        pearlWarm: '#fffaf2',
        roseClay: '#b98278',
        goldMuted: '#a77b44',
        ink: '#1b211f',
        mist: '#efe8dd',
        sage: '#8fa08d'
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 24px 70px rgba(34, 25, 15, 0.10)',
        emerald: '0 24px 80px rgba(6, 29, 24, 0.28)'
      },
      backgroundImage: {
        satin:
          'radial-gradient(80% 60% at 18% 12%, rgba(47,109,92,0.42), transparent 58%), radial-gradient(70% 55% at 88% 86%, rgba(232,217,189,0.10), transparent 60%), repeating-linear-gradient(115deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 18px), linear-gradient(135deg, #061d18 0%, #0a3028 48%, #041713 100%)'
      },
      keyframes: {
        floatIn: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        softPulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.72' },
          '50%': { transform: 'scale(1.04)', opacity: '0.92' }
        }
      },
      animation: {
        floatIn: 'floatIn 760ms ease both',
        softPulse: 'softPulse 4.5s ease-in-out infinite'
      }
    }
  },
  plugins: []
};
