/**
 * EN: Single team-member visual card. Clean grid-friendly layout — square photo
 *     on top, name + designation below, position badge, social link icons.
 *     Edit/Delete buttons are passed in by the parent so behaviour stays in one
 *     place (the TeamCreate page).
 *     ⚠ Replaces a legacy bootstrap table-per-member component that rendered
 *     a full <table> with header row inside every grid cell — caused the tile
 *     overlap bug visible in the screenshot.
 * BN: একটি team member visual card। Clean grid-friendly layout — উপরে square
 *     photo, নিচে name + designation, position badge, social link icon।
 *     Edit/Delete button parent থেকে passed (যাতে behaviour এক জায়গায় থাকে)।
 *     ⚠ পুরাতন bootstrap table-per-member component-এর জায়গায় — যেটা প্রতি
 *     grid cell-এ full <table> header সহ render করত আর screenshot-এর tile
 *     overlap bug ঘটাত।
 */

import { Mail } from 'lucide-react';

// EN: Inline brand SVGs — lucide-react 1.x dropped brand icons (Facebook,
//     Twitter, LinkedIn, YouTube) over trademark concerns. We hand-roll
//     minimal currentColor SVGs so the social row keeps the same look
//     without an extra dependency. Each icon inherits text color so the
//     existing brand-color classes (text-[#1877F2] etc.) still tint them.
// BN: Inline brand SVG — lucide-react 1.x ব্রান্ড আইকন (Facebook, Twitter,
//     LinkedIn, YouTube) trademark কারণে সরিয়ে দিয়েছে। অতিরিক্ত
//     dependency ছাড়াই আগের চেহারা ধরে রাখতে hand-rolled minimal
//     currentColor SVG ব্যবহার করি — text color inherit করায় আগের
//     brand-color class (text-[#1877F2] ইত্যাদি) এখনও কাজ করে।
const iconCls = 'h-4 w-4';
const svgProps = {
  className: iconCls,
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  'aria-hidden': 'true',
};

const FacebookOutlined = () => (
  <svg {...svgProps}>
    <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95z" />
  </svg>
);
const TwitterOutlined = () => (
  <svg {...svgProps}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);
const LinkedinOutlined = () => (
  <svg {...svgProps}>
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.5 18v-9H6v9h2.5zm-1.25-10.25a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18 18v-5.5c0-2.6-1.5-4-3.4-4-1.4 0-2.1.7-2.6 1.5h-.05V9H10v9h2.5v-4.5c0-1.2.5-1.95 1.5-1.95s1.5.75 1.5 1.95V18z" />
  </svg>
);
const YoutubeOutlined = () => (
  <svg {...svgProps}>
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);
const GoogleOutlined = (p) => <Mail className={iconCls} {...p} />;

export default function TeamCard({ data, onEdit, onDelete }) {
  return (
    <article className="group relative overflow-hidden rounded-xl border border-brand-tealLight/40 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <PhotoOrPlaceholder image={data.image} name={data.name} />

      <div className="space-y-1 px-4 pb-4 pt-3">
        <PositionBadge position={data.position} />
        <h3 className="text-sm font-bold leading-tight text-brand-navy">
          {data.name}
        </h3>
        <p className="text-xs leading-snug text-brand-slate line-clamp-2">
          {data.designation}
        </p>

        <SocialIcons data={data} />
      </div>

      {/* EN: Hover-revealed action bar with Edit + Delete buttons. */}
      {/* BN: Hover-এ দেখা যাওয়া action bar — Edit + Delete button সহ। */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-end gap-1 p-2 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-brand-navy shadow hover:bg-brand-teal hover:text-white"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="rounded-md bg-white/95 px-2.5 py-1 text-xs font-semibold text-red-600 shadow hover:bg-red-600 hover:text-white"
          >
            Delete
          </button>
        )}
      </div>
    </article>
  );
}

// EN: Square photo (1:1) at the top of the card; falls back to initials circle.
// BN: Card-এর উপরে square photo (1:1); image না থাকলে initials circle।
function PhotoOrPlaceholder({ image, name }) {
  if (image && image.url) {
    return (
      <div className="aspect-square w-full overflow-hidden bg-brand-tealLight/20">
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          src={image.url}
          alt={name || 'Team member'}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }
  const initials = (name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
  return (
    <div className="flex aspect-square w-full items-center justify-center bg-brand-navy text-2xl font-bold text-white">
      {initials}
    </div>
  );
}

// EN: Small chip showing the sort-order number (helps admins reorder visually).
// BN: ছোট chip যা sort-order সংখ্যা দেখায় (admin-কে reorder করতে সাহায্য করে)।
function PositionBadge({ position }) {
  if (position === undefined || position === null) return null;
  return (
    <span className="inline-block rounded bg-brand-tealLight/30 px-1.5 py-0.5 text-[10px] font-bold text-brand-navy">
      #{position}
    </span>
  );
}

// EN: Social link icon row — only icons whose URL is set will render.
// BN: Social link icon row — শুধু সেই icon যেগুলোর URL দেওয়া আছে।
function SocialIcons({ data }) {
  const links = [
    { url: data.facebook, Icon: FacebookOutlined, color: 'text-[#1877F2]' },
    { url: data.twiter, Icon: TwitterOutlined, color: 'text-[#1DA1F2]' },
    { url: data.linkdin, Icon: LinkedinOutlined, color: 'text-[#0A66C2]' },
    { url: data.youtube, Icon: YoutubeOutlined, color: 'text-[#FF0000]' },
    { url: data.email ? `mailto:${data.email}` : '', Icon: GoogleOutlined, color: 'text-brand-slate' },
  ].filter((l) => !!l.url);

  if (links.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1.5 text-base">
      {links.map(({ url, Icon, color }, i) => (
        <a
          key={i}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${color} hover:opacity-70`}
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}
