/**
 * EN: Reusable bilingual input — Bangla on the left, English on the right, each
 *     with a clear language chip ABOVE the input (not overlapping the parent label).
 *     Used across every site-content form so admins can see both languages at once.
 * BN: Reusable bilingual input — বাঁয়ে বাংলা, ডানে English, প্রতিটার উপরে স্পষ্ট
 *     ভাষা চিপ (parent label-এর সাথে overlap করে না)। সব site-content form-এ
 *     ব্যবহৃত যাতে admin একসাথে দুই ভাষা দেখতে পারে।
 */

const baseInput =
  'w-full rounded-md border border-brand-tealLight/60 bg-white px-3 py-2.5 text-sm text-brand-navy placeholder:text-brand-slate/50 focus:outline-none focus:ring-2 focus:ring-brand-teal/40 focus:border-brand-teal';

const labelClass = 'mb-2 block text-sm font-semibold text-brand-navy';

const chipClass =
  'inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider';

const BilingualField = ({
  label,
  hint,
  name,
  value,
  valueEn,
  onChange,
  type = 'input',
  rows = 3,
  placeholderBn = '',
  placeholderEn = '',
}) => {
  // EN: Render either an input or textarea based on the `type` prop.
  // BN: `type` prop অনুযায়ী input বা textarea রেন্ডার করে।
  const renderInput = (n, v, ph, lang) => {
    const dir = lang === 'bn' ? 'auto' : 'ltr';
    const cls = baseInput;
    if (type === 'textarea') {
      return (
        <textarea
          name={n}
          value={v || ''}
          onChange={onChange}
          placeholder={ph}
          dir={dir}
          rows={rows}
          className={cls + ' min-h-[88px] resize-y'}
        />
      );
    }
    return (
      <input
        type="text"
        name={n}
        value={v || ''}
        onChange={onChange}
        placeholder={ph}
        dir={dir}
        className={cls}
      />
    );
  };

  return (
    <div>
      <label className={labelClass}>{label}</label>
      {hint && <p className="-mt-1 mb-2 text-xs text-brand-slate">{hint}</p>}

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* EN: Bangla column — uses brand teal chip + bn-friendly font hint. */}
        {/* BN: বাংলা column — brand teal chip + bn-friendly font hint। */}
        <div>
          <span className={`${chipClass} mb-1.5 bg-brand-teal/10 text-brand-teal`}>
            বাংলা
          </span>
          {renderInput(name, value, placeholderBn, 'bn')}
        </div>

        {/* EN: English column — navy chip to visually distinguish from Bangla. */}
        {/* BN: English column — Bangla থেকে আলাদা করতে navy chip। */}
        <div>
          <span className={`${chipClass} mb-1.5 bg-brand-navy/10 text-brand-navy`}>
            English
          </span>
          {renderInput(`${name}En`, valueEn, placeholderEn, 'en')}
        </div>
      </div>
    </div>
  );
};

export default BilingualField;
