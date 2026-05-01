import { useEffect, useState } from 'react';
import { MessageSquare as SlackIcon, Send, ToggleLeft, ToggleRight, CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import { adminApi } from './api.js';
import AdminPageShell from './AdminPageShell.jsx';

export default function AdminSlack() {
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  const [test, setTest] = useState(null);
  const [testInfo, setTestInfo] = useState(null);

  useEffect(() => { adminApi.slack.show().then((r) => setS(r.data)).catch(() => {}); }, []);

  async function save(patch) {
    setBusy(true);
    try {
      const r = await adminApi.slack.update(patch);
      setS(r.data);
    } finally { setBusy(false); }
  }

  async function sendTest() {
    setTest('sending');
    setTestInfo(null);
    try {
      const r = await adminApi.slack.test();
      setTest(r.ok ? 'ok' : 'fail');
      setTestInfo({ blockers: r.blockers ?? [], willPostRealEvents: !!r.will_post_real_events });
    } catch { setTest('fail'); }
  }

  if (!s) return <AdminPageShell title="Slack"><p className="text-sm text-slate-500">Loading…</p></AdminPageShell>;

  return (
    <AdminPageShell
      title="Slack notifications"
      description="Pings your Slack channel whenever a pickup is booked or other events fire."
    >
      <div className="max-w-2xl space-y-6">
        {s.webhook_url && (!s.enabled || !s.notify_bookings) && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300 mt-0.5" />
            <div className="flex-1 text-sm">
              <div className="font-semibold text-amber-200">Slack is configured but new pickups won't notify.</div>
              <p className="mt-1 text-xs text-amber-200/80">
                The "Send test" button works because it only checks the webhook URL.
                Real booking events also require the master toggle and the
                "Notify on new pickup booking" switch to both be on.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {!s.enabled && (
                  <button
                    onClick={() => save({ enabled: true })}
                    disabled={busy}
                    className="rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
                  >
                    Enable Slack integration
                  </button>
                )}
                {!s.notify_bookings && (
                  <button
                    onClick={() => save({ notify_bookings: true })}
                    disabled={busy}
                    className="rounded-md bg-amber-400 px-3 py-1 text-xs font-semibold text-slate-950 hover:bg-amber-300 disabled:opacity-50"
                  >
                    Turn on booking notifications
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <Field label="Incoming Webhook URL" hint="Create an Incoming Webhook in your Slack workspace and paste the URL here.">
          <input
            type="url"
            value={s.webhook_url ?? ''}
            onChange={(e) => setS({ ...s, webhook_url: e.target.value })}
            onBlur={(e) => save({ webhook_url: e.target.value })}
            placeholder="https://hooks.slack.com/services/T.../B.../..."
            className="w-full rounded-lg bg-slate-950 px-3 py-2 text-sm ring-1 ring-slate-800 outline-none focus:ring-packrs-teal/60"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Channel override" hint="Optional. Defaults to the channel the webhook was created for.">
            <input
              type="text"
              value={s.channel ?? ''}
              onChange={(e) => setS({ ...s, channel: e.target.value })}
              onBlur={(e) => save({ channel: e.target.value })}
              placeholder="#new-pickups"
              className="w-full rounded-lg bg-slate-950 px-3 py-2 text-sm ring-1 ring-slate-800 outline-none focus:ring-packrs-teal/60"
            />
          </Field>
          <Field label="Bot username">
            <input
              type="text"
              value={s.username ?? ''}
              onChange={(e) => setS({ ...s, username: e.target.value })}
              onBlur={(e) => save({ username: e.target.value })}
              className="w-full rounded-lg bg-slate-950 px-3 py-2 text-sm ring-1 ring-slate-800 outline-none focus:ring-packrs-teal/60"
            />
          </Field>
        </div>

        <Field label="Icon emoji">
          <input
            type="text"
            value={s.icon_emoji ?? ''}
            onChange={(e) => setS({ ...s, icon_emoji: e.target.value })}
            onBlur={(e) => save({ icon_emoji: e.target.value })}
            placeholder=":package:"
            className="w-40 rounded-lg bg-slate-950 px-3 py-2 text-sm ring-1 ring-slate-800 outline-none focus:ring-packrs-teal/60"
          />
        </Field>

        <div className="space-y-2">
          <Toggle label="Notify on new pickup booking" checked={s.notify_bookings} onChange={(v) => save({ notify_bookings: v })} />
          <Toggle label="Notify on tracking lookup" checked={s.notify_tracking_lookup} onChange={(v) => save({ notify_tracking_lookup: v })} />
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
          <div>
            <div className="font-semibold text-white flex items-center gap-2">
              <SlackIcon className="h-4 w-4" />
              Slack integration
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {s.enabled ? 'Active — events are being sent.' : 'Disabled — no events are sent.'}
            </div>
            {s.last_sent_at && (
              <div className="text-[11px] text-slate-500 mt-2">
                Last sent {new Date(s.last_sent_at).toLocaleString()} · total {s.total_sent}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => save({ enabled: !s.enabled })}
              disabled={busy || !s.webhook_url}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50
                ${s.enabled ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
            >
              {s.enabled ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
              {s.enabled ? 'Enabled' : 'Disabled'}
            </button>
            <button
              onClick={sendTest}
              disabled={!s.webhook_url || test === 'sending'}
              className="inline-flex items-center gap-1.5 rounded-lg bg-packrs-teal px-3 py-1.5 text-sm font-semibold text-slate-950 hover:bg-packrs-yellow disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
              {test === 'sending' ? 'Sending…' : 'Send test'}
            </button>
          </div>
        </div>

        {test === 'ok' && testInfo && (
          testInfo.willPostRealEvents ? (
            <p className="inline-flex items-center gap-1.5 text-xs text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" /> Test sent — and real booking events will notify Slack too.
            </p>
          ) : (
            <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-200 ring-1 ring-amber-500/30">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
              <span>
                Test sent — but real bookings still won't notify because{' '}
                {testInfo.blockers.includes('enabled') && <code className="rounded bg-amber-500/20 px-1">enabled</code>}
                {testInfo.blockers.length > 1 && ' and '}
                {testInfo.blockers.includes('notify_bookings') && <code className="rounded bg-amber-500/20 px-1">notify_bookings</code>}
                {' '}{testInfo.blockers.length > 1 ? 'are' : 'is'} off. Use the warning above to fix.
              </span>
            </div>
          )
        )}
        {test === 'fail' && (
          <p className="inline-flex items-center gap-1.5 text-xs text-rose-300"><AlertCircle className="h-3.5 w-3.5" /> Test failed — verify the webhook URL is correct.</p>
        )}
      </div>
    </AdminPageShell>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-300">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-slate-500">{hint}</p>}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-center gap-3">
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition ${checked ? 'bg-packrs-teal' : 'bg-slate-700'}`}>
        <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition ${checked ? 'translate-x-5' : 'translate-x-1'}`} />
      </span>
      <span className="text-sm text-slate-300">{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only" />
    </label>
  );
}
