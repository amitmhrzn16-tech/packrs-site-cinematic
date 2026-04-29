import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { adminApi, adminToken } from './api.js';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await adminApi.login(email.trim(), password);
      adminToken.set(res.token);
      navigate('/admin', { replace: true });
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
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">Admin Portal</p>
          <p className="mt-1 text-sm text-slate-400">Sign in with your admin account.</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
          <Field icon={Mail} type="email" placeholder="admin@packrs.test" value={email} onChange={setEmail} />
          <Field icon={Lock} type="password" placeholder="Password" value={password} onChange={setPassword} />

          {error && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/30">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-packrs-teal px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-packrs-yellow disabled:opacity-60"
          >
            {busy ? 'Signing in…' : 'Sign in'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] text-slate-500">
          Default seed user: <span className="text-slate-300">admin@packrs.test / admin1234</span>
        </p>
      </div>
    </div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-lg bg-slate-950/60 px-3 py-2.5 ring-1 ring-slate-800 focus-within:ring-packrs-teal/60">
      <Icon className="h-4 w-4 text-slate-500" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={type === 'password' ? 'current-password' : 'email'}
        required
        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
      />
    </label>
  );
}
