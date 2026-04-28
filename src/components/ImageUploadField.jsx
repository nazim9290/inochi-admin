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

export default function ImageUploadField({ label, value, onChange, hint }) {
  const api = axiosInterceptor();
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

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

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-brand-navy">{label}</label>
      {hint && <p className="-mt-1 mb-2 text-xs text-brand-slate">{hint}</p>}

      <div className="flex flex-col gap-3 rounded-lg border border-dashed border-brand-tealLight/60 bg-brand-tealLight/5 p-4 sm:flex-row sm:items-start">
        <ImagePreview url={value} />

        <div className="flex-1 space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={uploading}
            className="block w-full text-sm text-brand-slate file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-brand-teal file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white file:transition-colors hover:file:bg-brand-navy"
          />

          {uploading && (
            <p className="text-xs text-brand-teal">Uploading… কয়েক সেকেন্ড অপেক্ষা করুন।</p>
          )}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {value && !uploading && (
            <div className="flex items-center justify-between text-xs">
              <p className="truncate text-brand-slate" title={value}>
                ✓ Uploaded — {shorten(value)}
              </p>
              <button
                type="button"
                onClick={clearImage}
                className="ml-2 text-red-600 hover:text-red-800 font-semibold"
              >
                Remove
              </button>
            </div>
          )}

          <p className="text-[11px] text-brand-slate/80">
            JPG / PNG / WebP — সর্বোচ্চ ৫ MB। ছবি upload হলে নিচে preview দেখাবে।
          </p>
        </div>
      </div>
    </div>
  );
}

// EN: Square preview thumbnail; placeholder icon when no image set.
// BN: চৌকো preview thumbnail; image না থাকলে placeholder icon।
function ImagePreview({ url }) {
  if (!url) {
    return (
      <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-md border border-brand-tealLight/40 bg-white text-brand-tealLight">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      </div>
    );
  }
  return (
    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-brand-tealLight/40 bg-white">
      {/* eslint-disable-next-line jsx-a11y/alt-text */}
      <img src={url} className="h-full w-full object-cover" />
    </div>
  );
}

// EN: Shorten long URLs for display so the layout doesn't break.
// BN: লম্বা URL সংক্ষিপ্ত করে display-এর জন্য, যাতে layout না ভাঙে।
function shorten(s) {
  if (!s) return '';
  if (s.length < 60) return s;
  return s.slice(0, 30) + '…' + s.slice(-25);
}
