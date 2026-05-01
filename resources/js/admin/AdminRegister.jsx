import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Mail, User as UserIcon, ArrowRight } from 'lucide-react';
import { adminApi } from './api.js';

export default function AdminRegister() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await adminApi.register({
        name: name.trim(),
        email: email.trim(),
        password,
        password_confirmation: passwordConfirm,
      });
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Shell title="Create account" subtitle="Sign up for the Packrs admin portal.">
      {done ? (
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300 backdrop-blur">
          <p>We've emailed a verification link to <span className="text-white">{email}</span>. Click the link to confirm your address.</p>
          <p className="text-xs text-slate-400">Note: an existing admin must elevate your account before you can sign in to the admin portal.</p>
          <Link to="/admin/login" className="inline-flex items-center gap-2 text-xs text-packrs-teal hover:text-packrs-yellow">
            Back to sign in <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
          <Field icon={UserIcon} type="text" placeholder="Full name" value={name} onChange={setName} autoComplete="name" />
          <Field icon={Mail} type="email" placeholder="you@example.com" value={email} onChange={setEmail} autoComplete="email" />
          <Field icon={Lock} type="password" placeholder="Password (min 8 chars)" value={password} onChange={setPassword} autoComplete="new-password" />
          <Field icon={Lock} type="password" placeholder="Confirm password" value={passwordConfirm} onChange={setPasswordConfirm} autoComplete="new-password" />

          {error && (
            <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/30">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-packrs-teal px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-packrs-yellow disabled:opacity-60"
          >
            {busy ? 'Creating account…' : 'Create account'}
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/admin/login" className="text-packrs-teal hover:text-packrs-yellow">Sign in</Link>
          </div>
        </form>
      )}
    </Shell>
  );
}

function Shell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-slate-950 grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/packrs-logo.png" alt="Packrs Courier" className="mx-auto h-14 w-auto" width="280" height="120" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">{title}</p>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ icon: Icon, type, placeholder, value, onChange, autoComplete }) {
  return (
    <label className="flex items-center gap-2 rounded-lg bg-slate-950/60 px-3 py-2.5 ring-1 ring-slate-800 focus-within:ring-packrs-teal/60">
      <Icon className="h-4 w-4 text-slate-500" />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
      />
    </label>
  );
}
