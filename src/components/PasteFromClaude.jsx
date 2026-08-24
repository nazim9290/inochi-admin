/**
 * EN: "Paste from Claude" — one paste fills the whole form. The inochi-content
 *     skill (claude.ai) ends its answer with a single fenced JSON block whose
 *     `paste` key names the content type ("blog" / "event" / "success-story" /
 *     "achievement") and whose other keys are the form's own field names
 *     (content fields carry HTML — the TipTap editors sync automatically).
 *     This component parses that block, checks it is for THIS form, and merges
 *     the fields into the parent's form state. Images cannot travel in a
 *     paste — the admin still uploads those, then saves.
 * BN: "Claude থেকে পেস্ট" — এক পেস্টে পুরো form ভরে যায়। claude.ai-এর
 *     inochi-content skill উত্তরের শেষে একটাই JSON block দেয় — `paste` key-তে
 *     content type, বাকি key গুলো form-এর field নাম (content field-এ HTML;
 *     TipTap editor নিজেই sync হয়)। এই component সেটা parse করে, এই form-এর
 *     জন্যই কি না মিলিয়ে দেখে, তারপর field গুলো form state-এ বসিয়ে দেয়।
 *     ছবি পেস্টে আসে না — admin ছবি আলাদা upload করে Save চাপবেন।
 */

import { useState } from 'react';
import { ClipboardPaste, ChevronDown, ChevronUp } from 'lucide-react';

// EN: Pull the first {...} JSON object out of pasted text (tolerates ```json
//     fences and explanation text around the block).
// BN: পেস্ট করা টেক্সট থেকে প্রথম {...} JSON object বের করা (```json fence আর
//     আশেপাশের ব্যাখ্যা-টেক্সট থাকলেও চলে)।
const extractJson = (text) => {
  const cleaned = String(text || '').replace(/```(?:json)?/gi, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end <= start) return null;
  try {
    return JSON.parse(cleaned.slice(start, end + 1));
  } catch {
    return null;
  }
};

// EN: A value like {bn:"…", en:"…", ja:"…"} flattens to key/keyEn/keyJa so the
//     skill may use either flat or nested naming.
// BN: {bn, en, ja} object পেলে key/keyEn/keyJa-তে flatten — skill flat বা
//     nested যেভাবেই দিক, কাজ করবে।
const LANG_KEYS = ['bn', 'en', 'ja'];
const flatten = (obj) => {
  const out = {};
  for (const [key, value] of Object.entries(obj)) {
    const isLangObject =
      value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0 &&
      Object.keys(value).every((k) => LANG_KEYS.includes(k));
    if (isLangObject) {
      if (value.bn !== undefined) out[key] = value.bn;
      if (value.en !== undefined) out[`${key}En`] = value.en;
      if (value.ja !== undefined) out[`${key}Ja`] = value.ja;
    } else {
      out[key] = value;
    }
  }
  return out;
};

const TYPE_LABELS = {
  blog: 'Blog',
  event: 'Event',
  'success-story': 'Success story',
  achievement: 'Achievement',
};

const PasteFromClaude = ({ type, onApply }) => {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [status, setStatus] = useState(null); // {ok, msg}

  const apply = () => {
    const obj = extractJson(text);
    if (!obj) {
      setStatus({
        ok: false,
        msg: 'JSON পড়া গেল না — Claude-এর দেওয়া block-টা পুরোটা পেস্ট করুন।',
      });
      return;
    }
    const pasteType = obj.paste || obj.type_of_content;
    if (pasteType && pasteType !== type) {
      setStatus({
        ok: false,
        msg: `এটা "${TYPE_LABELS[pasteType] || pasteType}" content — এই form-টা ${TYPE_LABELS[type] || type}-এর। সঠিক পেজে গিয়ে পেস্ট করুন।`,
      });
      return;
    }
    const { paste, type_of_content, ...fields } = obj;
    const flat = flatten(fields);
    if (Object.keys(flat).length === 0) {
      setStatus({ ok: false, msg: 'Block-এ কোনো field পাওয়া গেল না।' });
      return;
    }
    onApply(flat);
    setStatus({
      ok: true,
      msg: `✅ ${Object.keys(flat).length}টা field বসে গেছে। ছবি থাকলে আলাদা upload করুন, তারপর নিচে গিয়ে Save চাপুন।`,
    });
    setText('');
  };

  return (
    <div className="mb-4 rounded-lg border border-brand-tealLight/60 bg-brand-tealLight/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-semibold text-brand-navy"
      >
        <ClipboardPaste size={16} className="text-brand-teal" />
        Claude থেকে পেস্ট করুন (এক পেস্টে পুরো form)
        {open ? (
          <ChevronUp size={14} className="ml-auto" />
        ) : (
          <ChevronDown size={14} className="ml-auto" />
        )}
      </button>
      {open && (
        <div className="space-y-2 px-4 pb-4">
          <p className="text-xs text-brand-slate">
            claude.ai-তে <strong>inochi-content</strong> skill দিয়ে লেখা তৈরি করুন — উত্তরের শেষে
            যে JSON block আসবে, সেটা পুরোটা কপি করে নিচে পেস্ট করুন।
          </p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder='{"paste": "blog", "title": "…", …}'
            className="w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2 font-mono text-xs text-brand-navy focus:border-brand-teal focus:outline-none"
          />
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={apply}
              className="rounded-md bg-brand-teal px-4 py-1.5 text-sm font-bold text-white hover:bg-brand-navy"
            >
              বসিয়ে দিন
            </button>
            {status && (
              <span
                className={`text-xs font-semibold ${status.ok ? 'text-green-700' : 'text-red-600'}`}
              >
                {status.msg}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PasteFromClaude;
