import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { adminApi } from './api.js';

export default function AdminResetPassword() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);

  const missingParams = !token || !email;

  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await adminApi.resetPassword({
        email,
        token,
        password,
        password_confirmation: passwordConfirm,
      });
      setDone(true);
      setTimeout(() => navigate('/admin/login', { replace: true }), 1500);
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
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">Reset password</p>
          <p className="mt-1 text-sm text-slate-400">{email ? `Resetting password for ${email}` : 'Choose a new password'}</p>
        </div>

        {missingParams ? (
          <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300 backdrop-blur">
            <p>This reset link is missing required parameters. Please request a new one.</p>
            <Link to="/admin/forgot-password" className="inline-flex items-center gap-2 text-xs text-packrs-teal hover:text-packrs-yellow">
              Request new link <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : done ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-emerald-300 backdrop-blur">
            Password updated. Redirecting to sign in…
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur">
            <Field icon={Lock} placeholder="New password (min 8 chars)" value={password} onChange={setPassword} />
            <Field icon={Lock} placeholder="Confirm new password" value={passwordConfirm} onChange={setPasswordConfirm} />

            {error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-300 ring-1 ring-rose-500/30">{error}</p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-packrs-teal px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-packrs-yellow disabled:opacity-60"
            >
              {busy ? 'Updating…' : 'Update password'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <div className="text-center text-xs text-slate-400">
              <Link to="/admin/login" className="hover:text-packrs-teal">Back to sign in</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ icon: Icon, placeholder, value, onChange }) {
  return (
    <label className="flex items-center gap-2 rounded-lg bg-slate-950/60 px-3 py-2.5 ring-1 ring-slate-800 focus-within:ring-packrs-teal/60">
      <Icon className="h-4 w-4 text-slate-500" />
      <input
        type="password"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="new-password"
        required
        minLength={8}
        className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
      />
    </label>
  );
}
