/**
 * EN: Reusable beautiful confirm dialog. Replaces native window.confirm()
 *     across the admin panel. Use the imperative `confirmDialog()` helper
 *     from anywhere — it resolves to true on confirm, false on cancel.
 *     Mount <ConfirmDialogHost /> once at the app root (already done in
 *     main.jsx) so the popup can render via portal.
 * BN: পুরা admin panel-এর জন্য সুন্দর reusable confirm dialog।
 *     `confirmDialog()` helper যেকোনো জায়গা থেকে call করা যায় — confirm
 *     হলে true, cancel হলে false return করে। main.jsx-এ
 *     <ConfirmDialogHost /> একবার mount করা থাকলেই হবে।
 */

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

// EN: Module-level refs so imperative API can talk to the mounted host.
// BN: Module-level reference — imperative API থেকে mounted host-এ message পাঠানোর জন্য।
let resolverRef = null;
let setStateRef = null;

const DEFAULTS = {
  title: 'নিশ্চিত করুন',
  message: 'আপনি কি এই কাজটি করতে চান?',
  confirmText: 'হ্যাঁ, নিশ্চিত',
  cancelText: 'বাতিল',
  danger: true,
  icon: null,
};

/**
 * EN: Show the popup. Accepts a string (used as message) or an options object.
 *     Returns Promise<boolean>.
 * BN: Popup দেখায়। String (message হিসেবে) বা options object accept করে।
 *     Promise<boolean> return করে।
 */
export const confirmDialog = (input) => {
  const opts =
    typeof input === 'string' ? { message: input } : input || {};

  return new Promise((resolve) => {
    // EN: Fallback to native confirm if host hasn't mounted yet.
    // BN: Host এখনও mount না হলে native confirm fallback।
    if (!setStateRef) {
      const ok = window.confirm(opts.message || DEFAULTS.message);
      resolve(ok);
      return;
    }
    resolverRef = resolve;
    setStateRef({ ...DEFAULTS, ...opts, open: true });
  });
};

export const ConfirmDialogHost = () => {
  const [state, setState] = useState({ ...DEFAULTS, open: false });

  useEffect(() => {
    setStateRef = setState;
    return () => {
      setStateRef = null;
    };
  }, []);

  // EN: Close popup and resolve the pending promise.
  // BN: Popup বন্ধ করে pending promise resolve করে।
  const close = (result) => {
    if (resolverRef) {
      resolverRef(result);
      resolverRef = null;
    }
    setState((prev) => ({ ...prev, open: false }));
  };

  // EN: Esc closes (cancel), Enter confirms — feels native.
  // BN: Esc cancel, Enter confirm — native feel।
  useEffect(() => {
    if (!state.open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') close(false);
      else if (e.key === 'Enter') close(true);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.open]);

  if (!state.open) return null;

  const { title, message, confirmText, cancelText, danger, icon } = state;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      {/* EN: Dim backdrop — click to cancel.
          BN: ম্লান backdrop — click করলে cancel। */}
      <div
        className="absolute inset-0 bg-brand-navy/50 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
        onClick={() => close(false)}
      />

      {/* EN: Card — pops in with subtle scale.
          BN: Card — হালকা scale animation দিয়ে আসে। */}
      <div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-brand-tealLight/40 overflow-hidden animate-[popIn_0.18s_ease-out]"
      >
        <div className={`h-1.5 ${danger ? 'bg-red-500' : 'bg-brand-teal'}`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                danger
                  ? 'bg-red-50 text-red-600'
                  : 'bg-brand-tealLight/30 text-brand-teal'
              }`}
            >
              {icon ? (
                <span className="text-2xl leading-none">{icon}</span>
              ) : danger ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <h3
                id="confirm-dialog-title"
                className="text-lg font-semibold text-brand-navy"
              >
                {title}
              </h3>
              <p className="mt-2 text-sm text-brand-slate leading-relaxed whitespace-pre-line">
                {message}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <button
              type="button"
              onClick={() => close(false)}
              className="px-4 py-2 rounded-lg border border-brand-navy/20 bg-white text-brand-navy font-medium hover:bg-brand-tealLight/15 transition"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={() => close(true)}
              autoFocus
              className={`px-4 py-2 rounded-lg font-medium text-white shadow-sm transition ${
                danger
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-brand-teal hover:bg-brand-teal/90'
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default ConfirmDialogHost;
