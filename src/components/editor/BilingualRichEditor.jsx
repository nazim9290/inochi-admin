/**
 * EN: Bilingual rich-text editor — Bangla on the left, English on the right,
 *     mirroring BilingualField's layout. Each side has an "অটো ট্রান্সলেট"
 *     button that pushes the source content through MyMemory and writes the
 *     result into the other side. Auto-translate is "draft quality" — admin
 *     should review before saving.
 * BN: Bilingual rich-text editor — বাঁয়ে বাংলা, ডানে English (BilingualField-এর
 *     মতো layout)। প্রত্যেক side-এ একটা "অটো ট্রান্সলেট" button — source
 *     content MyMemory দিয়ে translate করে অপর side-এ বসায়। Auto-translate
 *     "draft quality" — save-এর আগে admin review করবে।
 */

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Languages } from 'lucide-react';
import RichTextEditor from './RichTextEditor';
import { translateHtml } from './translate';

const chipClass =
  'inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider';

const BilingualRichEditor = ({
  label,
  hint,
  value,
  valueEn,
  onChange,
  onChangeEn,
  placeholderBn = '',
  placeholderEn = '',
  minHeight = 240,
}) => {
  const [translating, setTranslating] = useState(null); // 'bn-to-en' | 'en-to-bn' | null
  const [error, setError] = useState(null);

  const runTranslate = async (direction) => {
    const source = direction === 'bn-to-en' ? value : valueEn;
    if (!source || !source.trim()) {
      setError(
        direction === 'bn-to-en'
          ? 'প্রথমে বাংলায় কিছু লিখুন।'
          : 'Write something in English first.',
      );
      return;
    }
    setError(null);
    setTranslating(direction);
    try {
      const out = await translateHtml(source, direction);
      if (direction === 'bn-to-en') {
        onChangeEn(out);
      } else {
        onChange(out);
      }
    } catch (err) {
      console.error('Translate error:', err);
      setError('Auto-translate fail হয়েছে — আবার চেষ্টা করুন।');
    } finally {
      setTranslating(null);
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-brand-navy">
        {label}
      </label>
      {hint && <p className="-mt-1 mb-2 text-xs text-brand-slate">{hint}</p>}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* EN: Bangla column with "translate to English" trigger above. */}
        {/* BN: বাংলা column — উপরে "ইংরেজিতে অনুবাদ" button। */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={`${chipClass} bg-brand-teal/10 text-brand-teal`}>
              বাংলা
            </span>
            <button
              type="button"
              onClick={() => runTranslate('bn-to-en')}
              disabled={translating !== null}
              title="বাংলা থেকে English-এ অনুবাদ"
              className="flex items-center gap-1 rounded border border-brand-tealLight/60 bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-navy hover:bg-brand-tealLight/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {translating === 'bn-to-en' ? (
                <>
                  <Languages size={12} className="animate-pulse" />
                  অনুবাদ হচ্ছে…
                </>
              ) : (
                <>
                  EN <ArrowRight size={12} />
                </>
              )}
            </button>
          </div>
          <RichTextEditor
            value={value}
            onChange={onChange}
            placeholder={placeholderBn}
            dir="auto"
            minHeight={minHeight}
          />
        </div>

        {/* EN: English column with "translate to Bangla" trigger above. */}
        {/* BN: English column — উপরে "বাংলায় অনুবাদ" button। */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <span className={`${chipClass} bg-brand-navy/10 text-brand-navy`}>
              English
            </span>
            <button
              type="button"
              onClick={() => runTranslate('en-to-bn')}
              disabled={translating !== null}
              title="English থেকে বাংলায় অনুবাদ"
              className="flex items-center gap-1 rounded border border-brand-tealLight/60 bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-navy hover:bg-brand-tealLight/20 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {translating === 'en-to-bn' ? (
                <>
                  <Languages size={12} className="animate-pulse" />
                  অনুবাদ হচ্ছে…
                </>
              ) : (
                <>
                  <ArrowLeft size={12} /> BN
                </>
              )}
            </button>
          </div>
          <RichTextEditor
            value={valueEn}
            onChange={onChangeEn}
            placeholder={placeholderEn}
            dir="ltr"
            minHeight={minHeight}
          />
        </div>
      </div>

      {error && (
        <p className="mt-2 rounded border border-red-200 bg-red-50 px-3 py-1.5 text-xs text-red-700">
          {error}
        </p>
      )}
      <p className="mt-1.5 text-[11px] text-brand-slate">
        💡 Auto-translate draft quality — save-এর আগে অনুবাদ একবার পড়ে নিন।
      </p>
    </div>
  );
};

export default BilingualRichEditor;
