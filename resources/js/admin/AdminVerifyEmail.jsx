import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, AlertCircle, Mail } from 'lucide-react';
import { adminApi } from './api.js';

export default function AdminVerifyEmail() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const [status, setStatus] = useState(token ? 'verifying' : 'missing');
  const [message, setMessage] = useState(null);

  const [resendEmail, setResendEmail] = useState('');
  const [resendBusy, setResendBusy] = useState(false);
  const [resendMsg, setResendMsg] = useState(null);

  useEffect(() => {
    let cancelled = false;
    if (!token) return;
    (async () => {
      try {
        const res = await adminApi.verifyEmail(token);
        if (!cancelled) {
          setStatus('success');
          setMessage(res.message || 'Email verified.');
        }
      } catch (e) {
        if (!cancelled) {
          setStatus('error');
          setMessage(e.message);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [token]);

  async function onResend(e) {
    e.preventDefault();
    setResendBusy(true);
    setResendMsg(null);
    try {
      const res = await adminApi.resendVerification(resendEmail.trim());
      setResendMsg(res.message || 'If that account exists, a new verification email has been sent.');
    } catch (e) {
      setResendMsg(e.message);
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 grid place-items-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/packrs-logo.png" alt="Packrs Courier" className="mx-auto h-14 w-auto" width="280" height="120" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-500">Email verification</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300 backdrop-blur">
          {status === 'verifying' && <p>Verifying your email…</p>}

          {status === 'success' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-emerald-300">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">Email verified</span>
              </div>
              <p>{message}</p>
              <Link to="/admin/login" className="inline-flex items-center gap-2 text-xs text-packrs-teal hover:text-packrs-yellow">
                Continue to sign in <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}

          {(status === 'error' || status === 'missing') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-rose-300">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">{status === 'missing' ? 'Missing verification token' : 'Could not verify email'}</span>
              </div>
              {message && <p>{message}</p>}

              <form onSubmit={onResend} className="space-y-3 border-t border-slate-800 pt-4">
                <p className="text-xs text-slate-400">Resend a verification email:</p>
                <label className="flex items-center gap-2 rounded-lg bg-slate-950/60 px-3 py-2.5 ring-1 ring-slate-800 focus-within:ring-packrs-teal/60">
                  <Mail className="h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                    className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </label>
                {resendMsg && (
                  <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300 ring-1 ring-emerald-500/30">{resendMsg}</p>
                )}
                <button
                  type="submit"
                  disabled={resendBusy}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-packrs-teal px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-packrs-yellow disabled:opacity-60"
                >
                  {resendBusy ? 'Sending…' : 'Resend verification email'}
                </button>
              </form>

              <div className="text-center text-xs text-slate-400">
                <Link to="/admin/login" className="hover:text-packrs-teal">Back to sign in</Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
