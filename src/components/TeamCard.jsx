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

import {
  FacebookOutlined,
  GoogleOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  YoutubeOutlined,
} from '@ant-design/icons';

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
