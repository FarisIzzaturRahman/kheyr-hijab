import { ArrowLeft, Check, KeyRound, Lock, Mail } from 'lucide-react';
import { useState } from 'react';
import { useStore } from '../../context/StoreContext';

export default function AdminLogin({ onAuthenticated, onBackToWebsite }) {
  const { isSupabaseConfigured, adminPin, signInAdmin } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (isSupabaseConfigured) {
      setSubmitting(true);
      const res = await signInAdmin(email, password);
      setSubmitting(false);
      if (res.ok) {
        onAuthenticated();
      } else {
        setError(res.error || 'Email atau password admin salah.');
      }
      return;
    }

    if (pinInput && pinInput === adminPin) {
      sessionStorage.setItem('kheyr_admin_auth', 'true');
      onAuthenticated();
    } else {
      setError('PIN Admin salah. Silakan coba kembali.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emeraldDeep via-emeraldInk to-emeraldDeep p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-champagne/40 bg-pearlWarm p-8 shadow-2xl animate-floatIn">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-champagne/30 text-emeraldInk shadow-md">
            <Lock size={30} className="text-emeraldSoft" />
          </div>
          <h1 className="mt-4 font-display text-3xl font-bold text-ink">Portal Admin KHEYR</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-ink/65">
            {isSupabaseConfigured
              ? 'Masuk dengan akun Email & Password Admin yang terdaftar di Supabase.'
              : 'Masukkan PIN Admin untuk mengelola produk dan pengaturan website.'}
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-4">
          {isSupabaseConfigured ? (
            <>
              <div>
                <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Email Admin
                </label>
                <div className="relative mt-1.5">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-goldMuted" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@kheyr.co.id"
                    autoFocus
                    className="w-full rounded-xl border border-goldMuted/30 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-ink placeholder:text-ink/40 focus:border-emeraldSoft focus:outline-none focus:ring-2 focus:ring-champagne"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                  Password Admin
                </label>
                <div className="relative mt-1.5">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-goldMuted" />
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan Password Admin..."
                    className="w-full rounded-xl border border-goldMuted/30 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-ink placeholder:text-ink/40 focus:border-emeraldSoft focus:outline-none focus:ring-2 focus:ring-champagne"
                  />
                </div>
              </div>
            </>
          ) : (
            <div>
              <label htmlFor="admin-pin" className="block text-xs font-bold uppercase tracking-wider text-ink/70">
                PIN / Password Admin
              </label>
              <div className="relative mt-1.5">
                <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-goldMuted" />
                <input
                  id="admin-pin"
                  type="password"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Masukkan PIN Admin..."
                  autoFocus
                  className="w-full rounded-xl border border-goldMuted/30 bg-white py-3 pl-11 pr-4 text-sm font-semibold text-ink placeholder:text-ink/40 focus:border-emeraldSoft focus:outline-none focus:ring-2 focus:ring-champagne"
                />
              </div>
            </div>
          )}

          {error && <p className="text-xs font-bold text-roseClay">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emeraldSoft py-3.5 text-sm font-bold text-pearl shadow-emerald transition hover:bg-emeraldDeep disabled:opacity-60"
          >
            <Check size={18} />
            {submitting ? 'Memverifikasi...' : 'Masuk ke Dashboard Admin'}
          </button>
        </form>

        <div className="mt-6 flex items-center justify-end border-t border-goldMuted/15 pt-4 text-xs text-ink/60">
          <button
            type="button"
            onClick={onBackToWebsite}
            className="inline-flex items-center gap-1 font-semibold text-goldMuted hover:text-emeraldSoft transition"
          >
            <ArrowLeft size={13} />
            Ke Beranda Web
          </button>
        </div>
      </div>
    </div>
  );
}
