/**
 * EN: Shared helpers for the Inbox screens (Contacts, Bookings, Subscribers).
 *     Kept in one place so date formatting and CSV export behave identically
 *     across all three lists.
 * BN: Inbox screen গুলোর (Contacts, Bookings, Subscribers) shared helper।
 *     এক জায়গায় রাখা — যাতে date format আর CSV export তিনটাতেই same আচরণ করে।
 */

// EN: Bangla number digit map for friendly date formatting.
// BN: Bangla digit map — friendly date formatting-এর জন্য।
const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const toBnDigits = (n) => String(n).replace(/\d/g, (d) => BN_DIGITS[+d]);

// EN: Returns a short Bangla relative-time string ("৩ ঘণ্টা আগে") for ISO dates.
//     Falls back to the absolute Bangla date when older than ~1 month.
// BN: ISO date থেকে Bangla relative-time string ("৩ ঘণ্টা আগে") return করে।
//     ১ মাসের পুরাতন হলে absolute Bangla date দেখায়।
export function relativeTimeBn(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 30) return 'এইমাত্র';
  if (seconds < 60) return `${toBnDigits(seconds)} সেকেন্ড আগে`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${toBnDigits(minutes)} মিনিট আগে`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${toBnDigits(hours)} ঘণ্টা আগে`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${toBnDigits(days)} দিন আগে`;
  if (days < 30) return `${toBnDigits(Math.floor(days / 7))} সপ্তাহ আগে`;
  return date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' });
}

// EN: Returns full date+time in Bangla locale for the modal/detail view.
// BN: Modal/detail view-এর জন্য পূর্ণ Bangla date+time।
export function formatFullDateBn(dateInput) {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// EN: Trigger a CSV download in the browser. `rows` is an array of objects;
//     `headers` controls the column order and labels. Auto-handles quoting
//     for values that contain commas, quotes, or newlines.
// BN: Browser-এ CSV download trigger করে। `rows` হলো object array; `headers`
//     column order আর label control করে। Comma / quote / newline-যুক্ত value
//     auto-quote করে।
export function downloadCsv(filename, headers, rows) {
  const headerLine = headers.map((h) => csvCell(h.label)).join(',');
  const bodyLines = rows.map((r) => headers.map((h) => csvCell(r[h.key] ?? '')).join(','));
  const csv = '﻿' + [headerLine, ...bodyLines].join('\n'); // BOM for Excel UTF-8
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// EN: Quote a CSV cell only when needed (presence of comma / quote / newline).
// BN: CSV cell quote — শুধু দরকারের সময় (comma / quote / newline থাকলে)।
function csvCell(value) {
  const s = String(value);
  if (/[,"\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// EN: Strip non-digits — useful for building tel: links from "+880 1784-889646".
// BN: Non-digit strip — "+880 1784-889646" থেকে tel: link বানাতে কাজে আসে।
export const phoneDigits = (raw) => String(raw || '').replace(/\D/g, '');

// EN: Build a wa.me deep link from a raw phone string.
// BN: Raw phone string থেকে wa.me deep link বানায়।
export const waLink = (raw) => `https://wa.me/${phoneDigits(raw)}`;
