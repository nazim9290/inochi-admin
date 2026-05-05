/**
 * EN: Bulk image upload page. Drop / select many files at once, each one
 *     fires the existing `/upload-image-file` endpoint sequentially so
 *     Cloudinary doesn't get rate-limited. Per-file status (pending /
 *     uploading / done / failed) renders inline; on done we show the URL
 *     with a copy button so admin can paste it into other forms.
 *     Doesn't replace ImageUploadField — that stays the per-field workflow.
 *     This page is the "import a folder of school photos in one shot"
 *     workflow.
 * BN: Bulk image upload page। একসাথে অনেক file drop / select; প্রতিটা
 *     existing `/upload-image-file` endpoint sequentially hit করি যাতে
 *     Cloudinary rate-limit-এ না পড়ে। প্রতি file-এর status (pending /
 *     uploading / done / failed) inline; done হলে URL + copy button —
 *     admin অন্য form-এ paste করতে পারে। ImageUploadField সরায় না —
 *     ওটা per-field workflow। এই page "এক ব্যাচে অনেক school photo
 *     import"-এর জন্য।
 */

import { useRef, useState } from 'react';
import axiosInterceptor from '../axios/axiosInterceptor';

const STATUS = {
  pending: { label: 'Queued', tone: 'bg-gray-100 text-gray-700' },
  uploading: { label: 'Uploading…', tone: 'bg-amber-100 text-amber-800' },
  done: { label: '✓ Uploaded', tone: 'bg-emerald-100 text-emerald-800' },
  failed: { label: '✕ Failed', tone: 'bg-red-100 text-red-700' },
};

export default function BulkImageUpload() {
  const api = axiosInterceptor();
  const fileRef = useRef(null);
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [copyToast, setCopyToast] = useState('');

  const onPick = (e) => {
    const files = Array.from(e.target.files || []);
    queueFiles(files);
    if (fileRef.current) fileRef.current.value = '';
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith('image/'));
    queueFiles(files);
  };

  const queueFiles = (files) => {
    if (files.length === 0) return;
    setItems((prev) => [
      ...prev,
      ...files.map((f, i) => ({
        id: `${Date.now()}-${i}-${f.name}`,
        file: f,
        name: f.name,
        size: f.size,
        status: 'pending',
        url: '',
        error: '',
      })),
    ]);
  };

  // EN: Sequential upload — Cloudinary plays nicer than parallel bursts.
  //     Pulls pending items as they appear in state, one at a time.
  // BN: Sequential upload — parallel burst-এর চেয়ে Cloudinary-র সাথে ভাল।
  //     state-এ pending থাকা item একে একে তোলে।
  const startUpload = async () => {
    setBusy(true);
    try {
      const queue = items.filter((it) => it.status === 'pending');
      for (const item of queue) {
        setItems((prev) => prev.map((p) => (p.id === item.id ? { ...p, status: 'uploading' } : p)));
        try {
          const fd = new FormData();
          fd.append('image', item.file);
          const { data } = await api.post('/upload-image-file', fd);
          const url = data?.url || data?.secure_url || '';
          if (!url) throw new Error('No URL returned');
          setItems((prev) =>
            prev.map((p) => (p.id === item.id ? { ...p, status: 'done', url } : p))
          );
        } catch (err) {
          setItems((prev) =>
            prev.map((p) =>
              p.id === item.id ? { ...p, status: 'failed', error: err?.message || 'Upload error' } : p
            )
          );
        }
      }
    } finally {
      setBusy(false);
    }
  };

  const remove = (id) => setItems((prev) => prev.filter((p) => p.id !== id));
  const clearAll = () => setItems([]);
  const clearDone = () => setItems((prev) => prev.filter((p) => p.status !== 'done'));

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopyToast('Copied!');
      setTimeout(() => setCopyToast(''), 1500);
    } catch {
      setCopyToast('Copy failed');
      setTimeout(() => setCopyToast(''), 1500);
    }
  };

  const copyAllUrls = async () => {
    const urls = items.filter((p) => p.status === 'done').map((p) => p.url).join('\n');
    if (!urls) return;
    try {
      await navigator.clipboard.writeText(urls);
      setCopyToast('All URLs copied!');
      setTimeout(() => setCopyToast(''), 1500);
    } catch {}
  };

  const total = items.length;
  const done = items.filter((p) => p.status === 'done').length;
  const failed = items.filter((p) => p.status === 'failed').length;
  const pending = items.filter((p) => p.status === 'pending').length;

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-bold text-brand-navy">Bulk image upload / এক সাথে অনেক ছবি</h1>
        <p className="mt-1 text-sm text-brand-slate">
          একসাথে অনেক ছবি drop করুন বা select করুন। সব Cloudinary-তে যাবে এবং library থেকে পাওয়া যাবে।
        </p>
      </header>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          dragOver
            ? 'border-brand-teal bg-brand-tealLight/20'
            : 'border-brand-tealLight/60 bg-brand-tealLight/5'
        }`}
      >
        <p className="text-sm text-brand-slate">
          এখানে file drop করুন অথবা
        </p>
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="mt-3 rounded-md bg-brand-teal px-5 py-2 text-sm font-semibold text-white hover:bg-brand-navy"
        >
          📁 Files বাছাই করুন
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          onChange={onPick}
          className="hidden"
        />
        <p className="mt-3 text-xs text-brand-slate/70">
          JPG / PNG / WebP — একসাথে অনেক select করতে Ctrl/Cmd ধরে click করুন
        </p>
      </div>

      {total > 0 && (
        <>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-brand-tealLight/20 px-3 py-1 font-semibold text-brand-navy">
              মোট: {total}
            </span>
            <span className="rounded-full bg-emerald-100 px-3 py-1 font-semibold text-emerald-800">
              Done: {done}
            </span>
            {failed > 0 && (
              <span className="rounded-full bg-red-100 px-3 py-1 font-semibold text-red-700">
                Failed: {failed}
              </span>
            )}
            {pending > 0 && (
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-800">
                Pending: {pending}
              </span>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={startUpload}
                disabled={busy || pending === 0}
                className="rounded-md bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:opacity-40"
              >
                {busy ? 'Uploading…' : `Start upload (${pending})`}
              </button>
              {done > 0 && (
                <button
                  type="button"
                  onClick={copyAllUrls}
                  className="rounded-md border border-brand-navy bg-white px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/10"
                >
                  📋 Copy all URLs
                </button>
              )}
              {done > 0 && (
                <button
                  type="button"
                  onClick={clearDone}
                  className="rounded-md border border-emerald-300 bg-white px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  Clear done
                </button>
              )}
              <button
                type="button"
                onClick={clearAll}
                disabled={busy}
                className="rounded-md border border-red-300 bg-white px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-40"
              >
                Clear all
              </button>
            </div>
          </div>

          <ul className="divide-y divide-brand-tealLight/40 rounded-lg border border-brand-tealLight/40 bg-white">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3 p-3">
                <Thumb file={it.file} url={it.url} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-brand-navy">{it.name}</p>
                  <p className="text-xs text-brand-slate/70">{(it.size / 1024).toFixed(0)} KB</p>
                  {it.error && <p className="mt-0.5 text-xs text-red-600">{it.error}</p>}
                  {it.url && (
                    <p className="mt-0.5 truncate text-[11px] text-brand-slate" title={it.url}>
                      {it.url}
                    </p>
                  )}
                </div>
                <span
                  className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${STATUS[it.status].tone}`}
                >
                  {STATUS[it.status].label}
                </span>
                {it.status === 'done' && (
                  <button
                    type="button"
                    onClick={() => copyUrl(it.url)}
                    className="flex-shrink-0 rounded-md border border-brand-navy bg-white px-2 py-1 text-xs font-semibold text-brand-navy hover:bg-brand-tealLight/10"
                  >
                    Copy
                  </button>
                )}
                {it.status !== 'uploading' && (
                  <button
                    type="button"
                    onClick={() => remove(it.id)}
                    className="flex-shrink-0 text-red-600 hover:text-red-800"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      {copyToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-brand-navy px-4 py-2 text-xs font-semibold text-white shadow-lg">
          {copyToast}
        </div>
      )}
    </div>
  );
}

// EN: Local-file preview while upload is pending; once uploaded we show the
//     real Cloudinary URL so admin sees what landed in the library.
// BN: Upload pending থাকলে local file preview; uploaded হলে real Cloudinary
//     URL দেখাই — library-তে কী landed admin দেখুক।
function Thumb({ file, url }) {
  const src = url || (file ? URL.createObjectURL(file) : '');
  if (!src) {
    return <div className="h-12 w-12 flex-shrink-0 rounded-md bg-brand-tealLight/20" />;
  }
  return (
    /* eslint-disable-next-line jsx-a11y/alt-text */
    <img src={src} className="h-12 w-12 flex-shrink-0 rounded-md object-cover" />
  );
}
