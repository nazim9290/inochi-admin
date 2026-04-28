import { useMemo } from 'react';

// EN: Branch admin frequently pastes the wrong URL — they grab the regular
//     "share" link or the long URL bar copy instead of the iframe `src` from
//     "Embed a map". This component validates the URL shape and renders a
//     live preview so the admin sees immediately whether it's correct.
// BN: Admin প্রায়ই ভুল URL paste করেন — সাধারণ "share" link বা URL bar
//     থেকে copy করা long URL দেন, কিন্তু আসলে দরকার "Embed a map" থেকে
//     iframe-এর `src`। এই component URL shape validate করে আর live preview
//     দেখায় যাতে admin সাথে সাথে বুঝতে পারে ঠিক হয়েছে কিনা।

const inputClass =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy placeholder:text-brand-slate/50 focus:border-brand-teal focus:outline-none focus:ring-2 focus:ring-brand-teal/40';

// EN: A valid embed URL is from google.com/maps/embed (the `pb=` variant) OR
//     a maps.app.goo.gl share link (we let those through but warn since they
//     don't render in an iframe).
// BN: Valid embed URL google.com/maps/embed (`pb=` variant) থেকে আসা।
//     maps.app.goo.gl link allow করি কিন্তু warning দেই — iframe-এ render হয় না।
function classifyUrl(raw) {
  const url = String(raw || '').trim();
  if (!url) return { kind: 'empty' };
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return { kind: 'invalid', reason: 'URL ফরম্যাট ভুল।' };
  }
  const host = parsed.hostname.toLowerCase();
  const path = parsed.pathname.toLowerCase();
  if (host === 'www.google.com' || host === 'google.com') {
    if (path.startsWith('/maps/embed')) return { kind: 'embed', src: url };
    if (path.startsWith('/maps')) {
      return {
        kind: 'wrong',
        reason: 'এটা সাধারণ Maps URL — "Share → Embed a map" থেকে iframe code-এর src copy করুন।',
      };
    }
  }
  if (host === 'maps.app.goo.gl') {
    return {
      kind: 'wrong',
      reason: 'এটা Mobile share link — Desktop Google Maps খুলে "Share → Embed a map" নিন।',
    };
  }
  return {
    kind: 'invalid',
    reason: 'Google Maps domain না — শুধু google.com/maps/embed... use করুন।',
  };
}

export default function MapEmbedField({ name, value, onChange, placeholder, label }) {
  const status = useMemo(() => classifyUrl(value), [value]);

  // EN: Admin sometimes pastes the entire `<iframe ... src="..."></iframe>`
  //     block. Auto-extract the src so the field stays clean.
  // BN: Admin মাঝে মাঝে পুরা `<iframe ... src="..."></iframe>` paste করেন।
  //     Auto-extract src যাতে field clean থাকে।
  const handleChange = (e) => {
    const raw = e.target.value;
    const match = raw.match(/<iframe[^>]+src=["']([^"']+)["']/i);
    if (match) {
      onChange({ target: { name, value: match[1] } });
    } else {
      onChange(e);
    }
  };

  return (
    <div>
      {label && (
        <label className="mb-2 block text-sm font-semibold text-brand-navy">{label}</label>
      )}
      <input
        type="text"
        name={name}
        value={value || ''}
        onChange={handleChange}
        placeholder={placeholder || 'https://www.google.com/maps/embed?pb=...'}
        className={inputClass}
      />

      {status.kind === 'embed' && (
        <div className="mt-3 overflow-hidden rounded-md border border-brand-tealLight/40">
          <iframe
            src={status.src}
            title="Map preview"
            width="100%"
            height="240"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <p className="bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700">
            ✓ Valid embed URL — public site-এ এই map-ই দেখাবে।
          </p>
        </div>
      )}

      {(status.kind === 'wrong' || status.kind === 'invalid') && (
        <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          ⚠ {status.reason}
          <br />
          <strong>সঠিক URL পাওয়ার নিয়ম:</strong> Google Maps-এ আপনার office খুঁজুন →
          "Share" → "Embed a map" tab → "COPY HTML" → শুধু{' '}
          <code className="rounded bg-amber-100 px-1">src="..."</code> অংশটা paste করুন,
          পুরা iframe paste করলেও auto-extract হবে।
        </div>
      )}

      {status.kind === 'empty' && (
        <p className="mt-1 text-[11px] text-brand-slate/70">
          Optional — দিলে branch page-এ live map embed হবে।
        </p>
      )}
    </div>
  );
}
