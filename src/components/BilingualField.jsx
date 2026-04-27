// Reusable bilingual input — renders BN + EN field side-by-side with a small
// flag chip for clarity. Used across all admin forms that edit translatable
// content.

const baseInput =
  'w-full px-3 py-2 text-sm border border-brand-tealLight/60 rounded focus:outline-none focus:ring-2 focus:ring-brand-teal/40';
const labelClass = 'block text-xs font-semibold text-brand-navy mb-1';

const BilingualField = ({
  label,
  name,
  value,
  valueEn,
  onChange,
  type = 'input',
  rows = 3,
  placeholderBn = '',
  placeholderEn = '',
}) => {
  const renderInput = (n, v, ph, lang) => {
    const dir = lang === 'bn' ? 'auto' : 'ltr';
    if (type === 'textarea') {
      return (
        <textarea
          name={n}
          value={v || ''}
          onChange={onChange}
          placeholder={ph}
          dir={dir}
          rows={rows}
          className={baseInput + ' min-h-[80px]'}
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
        className={baseInput}
      />
    );
  };

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
        <div className="relative">
          <span className="absolute -top-2 left-2 bg-white text-[9px] font-bold text-brand-teal px-1.5 z-10 leading-none rounded">
            🇧🇩 BN
          </span>
          {renderInput(name, value, placeholderBn, 'bn')}
        </div>
        <div className="relative">
          <span className="absolute -top-2 left-2 bg-white text-[9px] font-bold text-brand-navy px-1.5 z-10 leading-none rounded">
            🇺🇸 EN
          </span>
          {renderInput(`${name}En`, valueEn, placeholderEn, 'en')}
        </div>
      </div>
    </div>
  );
};

export default BilingualField;
