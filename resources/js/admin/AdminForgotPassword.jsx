import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { adminApi } from './api.js';

export default function AdminForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMessage(null);
    try {
      const res = await adminApi.forgotPassword(email.trim());
      setMessage(res.message || 'If that account exists, a password reset link has been sent.');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/packrs-logo.png" alt="Packrs Courier" className="mx-auto h-14 w-auto" width="280" height="120" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">Forgot password</p>
          <p className="mt-1 text-sm text-slate-400">We'll email you a reset link.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
          <label className="flex items-center gap-2 rounded-lg bg-slate-950/60 px-3 py-2.5 ring-1 ring-slate-800 focus-within:ring-packrs-teal/60">
            <Mail className="h-4 w-4 text-slate-500" />
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/30">{error}</p>
          )}
          {message && (
            <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 ring-1 ring-emerald-500/30">{message}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-packrs-teal px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-packrs-yellow disabled:opacity-60"
          >
            {busy ? 'Sending…' : 'Send reset link'}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <Link to="/admin/login" className="hover:text-packrs-teal">Back to sign in</Link>
            <Link to="/admin/register" className="hover:text-packrs-teal">Create account</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
