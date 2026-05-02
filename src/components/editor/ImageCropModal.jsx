/**
 * EN: Modal that lets the admin crop an image before upload. Uses react-image-crop
 *     to pick a free-form rectangle, then renders the cropped area to a canvas
 *     and POSTs the resulting JPEG blob to /upload-image-file. Returns the
 *     Cloudinary URL via onUploaded callback so callers (cover image picker,
 *     in-editor image insert) get a ready-to-use src.
 * BN: Upload-এর আগে ছবি crop করার modal। react-image-crop দিয়ে free rectangle
 *     বেছে নেয়, canvas-এ render করে JPEG blob /upload-image-file-এ পাঠায়।
 *     onUploaded callback-এ Cloudinary URL ফেরত — caller (cover image picker,
 *     editor-এর image insert) সরাসরি src হিসেবে use করতে পারে।
 */

import { useEffect, useRef, useState } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import axiosInterceptor from '../../axios/axiosInterceptor';

// EN: Helper — make an initial crop centered on the image (no aspect lock by default).
// BN: Helper — শুরুতে image-এর মাঝখানে একটা crop area দেয় (default-এ aspect lock নাই)।
const buildInitialCrop = (mediaWidth, mediaHeight, aspect) => {
  if (aspect) {
    return centerCrop(
      makeAspectCrop(
        { unit: '%', width: 80 },
        aspect,
        mediaWidth,
        mediaHeight,
      ),
      mediaWidth,
      mediaHeight,
    );
  }
  return { unit: '%', x: 10, y: 10, width: 80, height: 80 };
};

// EN: Render the user-selected pixel crop to a canvas, return a JPEG blob.
// BN: User-এর selected pixel crop canvas-এ এঁকে JPEG blob ফেরত দেয়।
const cropToBlob = (image, crop) =>
  new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    canvas.width = Math.round(crop.width * scaleX);
    canvas.height = Math.round(crop.height * scaleY);
    const ctx = canvas.getContext('2d');
    if (!ctx) return reject(new Error('Canvas not supported'));
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Crop failed'))),
      'image/jpeg',
      0.92,
    );
  });

const ImageCropModal = ({ file, aspect, onCancel, onUploaded }) => {
  const [src, setSrc] = useState(null);
  const [crop, setCrop] = useState(null);
  const [completedCrop, setCompletedCrop] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const imgRef = useRef(null);
  const api = axiosInterceptor();

  // EN: Read the picked file as a data URL so <img> can show it for cropping.
  // BN: Picked file-টা data URL হিসেবে read — <img>-এ crop করার জন্য দেখাবে।
  useEffect(() => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setSrc(reader.result);
    reader.readAsDataURL(file);
  }, [file]);

  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    setCrop(buildInitialCrop(width, height, aspect));
  };

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return;
    setBusy(true);
    setError(null);
    try {
      const blob = await cropToBlob(imgRef.current, completedCrop);
      const formData = new FormData();
      formData.append('image', blob, 'cropped.jpg');
      const { data } = await api.post('/upload-image-file', formData);
      onUploaded({ url: data.url, public_id: data.public_id });
    } catch (err) {
      console.error('Crop upload error:', err);
      setError('ছবি upload হয়নি — আবার চেষ্টা করুন।');
    } finally {
      setBusy(false);
    }
  };

  if (!file) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-brand-tealLight/40 px-5 py-3">
          <h3 className="text-base font-bold text-brand-navy">
            ছবি Crop করুন
          </h3>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-sm text-brand-slate hover:text-brand-navy"
          >
            ✕ বন্ধ
          </button>
        </div>

        <div className="max-h-[70vh] overflow-auto p-5">
          {src ? (
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                src={src}
                alt="Crop preview"
                onLoad={onImageLoad}
                className="max-h-[60vh] w-auto"
              />
            </ReactCrop>
          ) : (
            <p className="text-sm text-brand-slate">Loading…</p>
          )}
          {error && (
            <p className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-brand-tealLight/40 px-5 py-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded border border-brand-tealLight/60 bg-white px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-brand-tealLight/20"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={busy || !completedCrop?.width}
            className="rounded bg-brand-teal px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? 'Uploading…' : 'Crop ও Upload'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;
