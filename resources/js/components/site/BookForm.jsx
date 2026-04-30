import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { site } from '../../lib/site.js';

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1').replace(/\/$/, '');

export default function BookForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [done, setDone] = useState(false);
  const [registered, setRegistered] = useState('no');

  async function onSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const data = new FormData(e.currentTarget);
    const payload = {
      name: (data.get('name') || '').toString().trim(),
      phone: (data.get('phone') || '').toString().trim(),
      address: (data.get('address') || '').toString().trim(),
      business_registered: data.get('business_registered') === 'yes',
      business_type: data.get('business_type'),
      avg_volume: data.get('volume'),
      notes: (data.get('notes') || '').toString().trim() || null,
    };
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.message || j.errors?.[Object.keys(j.errors || {})[0]]?.[0] || `HTTP ${res.status}`);
      setDone(true);
    } catch (e) {
      // Graceful fallback — open the email client so the user is never stranded.
      setError(`${e.message}. Opening email as fallback…`);
      const body = [
        `Name: ${payload.name}`,
        `Phone: ${payload.phone}`,
        `Address: ${payload.address}`,
        `Business registered: ${payload.business_registered ? 'Yes' : 'No'}`,
        `Business type: ${payload.business_type}`,
        `Avg volume: ${payload.avg_volume}`,
        `Notes: ${payload.notes || '—'}`,
      ].join('\n');
      const subject = `Pickup partner request — ${payload.name}`;
      window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-packrs-teal/30 bg-packrs-teal/[0.06] p-8 text-center">
        <CheckCircle2 className="h-10 w-10 mx-auto text-packrs-teal" />
        <h2 className="mt-4 font-display text-2xl font-bold">Request received</h2>
        <p className="mt-2 text-sm text-white/70">
          Thanks — we'll call you on the number you provided to confirm pickup details and pricing.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="name" label="Your name" placeholder="Full name" required />
        <Field name="phone" label="Phone number" type="tel" placeholder="98XXXXXXXX" required />
      </div>
      <Field name="address" label="Address" placeholder="Pickup address — street, area, city" required />

      <RadioGroup
        name="business_registered" label="Is your business registered?"
        value={registered} onChange={setRegistered}
        options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          name="business_type" label="Business type" required
          options={[
            'Individual / personal', 'E-commerce / online seller', 'Instagram / social commerce',
            'Daraz seller', 'Restaurant / cloud kitchen', 'Retail shop', 'Wholesale / distributor', 'Other',
          ]}
        />
        <Select
          name="volume" label="Average parcel volume" required
          options={[
            'Just trying it out (1–5 / month)', 'Up to 50 parcels / month',
            '50 – 200 parcels / month', '200 – 500 parcels / month', '500+ parcels / month',
          ]}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Notes</label>
        <textarea
          name="notes" rows={4}
          placeholder="Anything we should know — fragile items, special hours, recurring schedule, etc."
          className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-orange"
        />
      </div>

      {error && (
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">{error}</p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className="inline-flex items-center gap-2 btn-glow disabled:opacity-60">
          {busy ? 'Submitting…' : 'Submit request'}
          <ArrowRight className="h-4 w-4" />
        </button>
        <a href={`tel:${site.phone}`} className="btn-ghost">Call {site.phoneDisplay}</a>
      </div>
      <p className="text-xs text-white/50">
        We'll call you to confirm logistics. Submitting this form sends the details to our team
        (and a Slack ping if our admin has Slack notifications turned on).
      </p>
    </form>
  );
}

function Field({ name, label, type = 'text', placeholder, required }) {
  return (
    <div>
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-packrs-orange">*</span>}
      </label>
      <input
        name={name} type={type} placeholder={placeholder} required={required}
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-orange"
      />
    </div>
  );
}

function Select({ name, label, options, required }) {
  return (
    <div>
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-packrs-orange">*</span>}
      </label>
      <select
        name={name} required={required} defaultValue=""
        className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-packrs-orange"
      >
        <option value="" disabled>Select…</option>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function RadioGroup({ name, label, options, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-packrs-orange">*</span>}
      </label>
      <div className="mt-2 flex gap-3">
        {options.map((o) => {
          const selected = value === o.value;
          return (
            <label
              key={o.value}
              className={[
                'flex-1 cursor-pointer rounded-xl border px-4 py-3 text-sm transition',
                selected ? 'border-packrs-orange bg-packrs-orange/10 text-white'
                         : 'border-white/10 bg-black/20 text-white/70 hover:border-white/30',
              ].join(' ')}
            >
              <input type="radio" name={name} value={o.value} checked={selected} onChange={() => onChange(o.value)} className="sr-only" required={required} />
              <span className="inline-flex items-center gap-2">
                <span className={['inline-block h-3 w-3 rounded-full border', selected ? 'border-packrs-orange bg-packrs-orange' : 'border-white/40'].join(' ')} />
                {o.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
