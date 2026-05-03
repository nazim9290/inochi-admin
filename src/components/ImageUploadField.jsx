/**
 * EN: Reusable image upload field — file picker + live preview + auto-upload to
 *     backend `/upload-image-file`. On success the parent gets a URL string back
 *     via onChange (same shape as a plain text input — drop-in replacement for
 *     the old "paste image URL" inputs).
 * BN: Reusable image upload field — file picker + live preview + auto-upload
 *     backend-এর `/upload-image-file`-এ। Success-এ parent onChange দিয়ে URL
 *     string পায় (plain text input-এর মতই — পুরাতন "paste image URL" input-এর
 *     drop-in replacement)।
 *
 *     Props:
 *       label   — visible label above the field (Bangla recommended)
 *       value   — current image URL (string)
 *       onChange(url: string) — called with the uploaded URL or '' to clear
 *       hint    — optional small helper line below the label
 */

import { useRef, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';
import ImageLibraryPicker from './ImageLibraryPicker';

// EN: `compact` mode forces a narrower vertical stack — needed when the field
//     lives inside a multi-column grid (e.g. the success-story 5-phase journey
//     form) where the default row layout would push the Library button outside
//     the parent card. Compact mode also drops the long bilingual hint and
//     uses smaller preview/file-input footprints.
// BN: `compact` mode narrower vertical stack force করে — multi-column grid-এ
//     (যেমন success-story-র 5-phase journey form) যেখানে default row layout
//     Library button parent card-এর বাইরে ঠেলে দেয়। Compact mode-এ লম্বা
//     bilingual hint বাদ + preview/file-input-ও ছোট।
export default function ImageUploadField({ label, value, onChange, hint, compact = false }) {
  const api = axiosInterceptor();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [libraryOpen, setLibraryOpen] = useState(false);

  // EN: Upload selected file to backend; on success bubble the URL up via onChange.
  // BN: Selected file backend-এ upload করে; success-এ onChange দিয়ে URL parent-কে পাঠায়।
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const { data } = await api.post('/upload-image-file', fd);
      const url = data?.url || data?.secure_url;
      if (url) {
        onChange(url);
      } else {
        setError('Upload failed — কোনো URL পাওয়া যায়নি।');
      }
    } catch (err) {
      console.error('Image upload error:', err);
      setError('Upload failed — please try again.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const clearImage = () => {
    onChange('');
    setError('');
  };

  // EN: Layout & sizing tokens flip on `compact` so the same component fits
  //     both the wide settings forms and the narrow journey grid cells.
  // BN: `compact` দিলে layout ও size token বদলায় — same component-ই wide
  //     settings form ও narrow journey grid cell-এ মানিয়ে যায়।
  const containerClass = compact
    ? 'flex flex-col gap-2 rounded-lg border border-dashed border-brand-tealLight/60 bg-brand-tealLight/5 p-3'
    : 'flex flex-col gap-3 rounded-lg border border-dashed border-brand-tealLight/60 bg-brand-tealLight/5 p-4 sm:flex-row sm:items-start';

  return (
    <div className={compact ? 'min-w-0' : ''}>
      {label && <label className="mb-2 block text-sm font-semibold text-brand-navy">{label}</label>}
      {hint && !compact && <p className="-mt-1 mb-2 text-xs text-brand-slate">{hint}</p>}

      <div className={containerClass}>
        <ImagePreview url={value} compact={compact} />

        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={handleFile}
              className={
                compact
                  ? 'block w-full min-w-0 text-xs text-brand-slate file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-teal file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-brand-navy'
                  : 'block flex-1 min-w-[200px] text-sm text-brand-slate file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-teal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition-colors hover:file:bg-brand-navy'
              }
            />
            <button
              type="button"
              onClick={() => setLibraryOpen(true)}
              disabled={uploading}
              className={
                compact
                  ? 'inline-flex items-center gap-1 rounded-md border border-brand-navy bg-white px-2 py-1 text-[11px] font-semibold text-brand-navy hover:bg-brand-tealLight/10 disabled:opacity-50'
                  : 'inline-flex items-center gap-1.5 rounded-md border border-brand-navy bg-white px-3 py-2 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10 disabled:opacity-50'
              }
              title="আগে upload করা ছবি থেকে বাছাই"
            >
              📚 Library
            </button>
          </div>

          {uploading && (
            <p className="text-xs text-brand-teal">Uploading… কয়েক সেকেন্ড অপেক্ষা করুন।</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {value && !uploading && (
            <div className="flex items-center justify-between gap-2 text-xs min-w-0">
              <p className="min-w-0 flex-1 truncate text-brand-slate" title={value}>
                ✓ Uploaded
              </p>
              <button
                type="button"
                onClick={clearImage}
                className="flex-shrink-0 text-red-600 hover:text-red-800 font-semibold"
              >
                Remove
              </button>
            </div>
          )}

          {!compact && (
            <p className="text-[11px] text-brand-slate/80">
              JPG / PNG / WebP — সর্বোচ্চ ৫ MB। ছবি upload হলে নিচে preview দেখাবে।
              অথবা <strong>Library</strong> থেকে আগের upload করা ছবি বাছাই করুন।
            </p>
          )}
        </div>
      </div>

      <ImageLibraryPicker
        open={libraryOpen}
        onClose={() => setLibraryOpen(false)}
        onPick={(url) => {
          onChange(url);
          setError('');
        }}
      />
    </div>
  );
}

// EN: Square preview thumbnail; placeholder icon when no image set. `compact`
//     drops the size so the cell fits beside the file input on narrow grids.
// BN: চৌকো preview thumbnail; image না থাকলে placeholder icon। `compact`
//     mode-এ ছোট size — narrow grid-এ file input-এর পাশে এঁটে যায়।
function ImagePreview({ url, compact = false }) {
  const sizeClass = compact ? 'h-16 w-16' : 'h-24 w-24';
  const iconSize = compact ? 'h-6 w-6' : 'h-8 w-8';
  if (!url) {
    return (
      <div className={`flex ${sizeClass} flex-shrink-0 items-center justify-center rounded-md border border-brand-tealLight/40 bg-white text-brand-tealLight`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={iconSize}>
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }
  return (
    <div className={`${sizeClass} flex-shrink-0 overflow-hidden rounded-md border border-brand-tealLight/40 bg-white`}>
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={url} className="h-full w-full object-cover" />
    </div>
  );
}

