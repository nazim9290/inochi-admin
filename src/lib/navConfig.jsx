/**
 * EN: Single source of truth for the admin navigation.
 *     Top-level tabs (sections) and the sub-routes that belong inside each one.
 *     TopNav renders the main tabs; SubNav renders the contextual sub-tabs
 *     based on which main tab is active.
 * BN: Admin navigation-এর single source of truth।
 *     উপরের মূল tab (section) এবং প্রতিটার ভিতরের sub-route।
 *     TopNav মূল tab render করে; SubNav active main tab অনুযায়ী
 *     contextual sub-tab দেখায়।
 */

const Icon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
    {children}
  </svg>
);

const ICONS = {
  dashboard: (
    <Icon>
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </Icon>
  ),
  content: (
    <Icon>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </Icon>
  ),
  pages: (
    <Icon>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <line x1="3" y1="9" x2="21" y2="9" />
    </Icon>
  ),
  people: (
    <Icon>
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </Icon>
  ),
  inbox: (
    <Icon>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </Icon>
  ),
  certificate: (
    <Icon>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </Icon>
  ),
};

// EN: Each section has a key, label (Bangla + English), an icon, and sub-routes.
//     The home/dashboard tab has no sub-routes — clicking it just goes to "/".
// BN: প্রতিটা section-এর একটা key, label (Bangla + English), icon ও sub-route আছে।
//     হোম/dashboard tab-এ কোনো sub-route নাই — click করলে শুধু "/"-এ যায়।
export const NAV_SECTIONS = [
  {
    key: 'dashboard',
    label: 'হোম',
    labelEn: 'Dashboard',
    icon: ICONS.dashboard,
    home: '/',
    routes: [],
  },
  {
    key: 'content',
    label: 'কনটেন্ট',
    labelEn: 'Content',
    icon: ICONS.content,
    home: '/site-settings',
    routes: [
      { path: '/site-settings', label: 'সাইট সেটিংস', labelEn: 'Site Settings' },
      { path: '/how-it-works', label: 'কীভাবে কাজ করে', labelEn: 'How It Works' },
      { path: '/jlpt-courses', label: 'JLPT কোর্স', labelEn: 'JLPT Courses' },
      { path: '/success-stories', label: 'সফলতার গল্প', labelEn: 'Success Stories' },
      { path: '/faqs', label: 'প্রশ্নোত্তর', labelEn: 'FAQs' },
    ],
  },
  {
    key: 'pages',
    label: 'পেজ',
    labelEn: 'Pages',
    icon: ICONS.pages,
    home: '/team-create',
    routes: [
      { path: '/team-create', label: 'টিম', labelEn: 'Team' },
      { path: '/create-blog', label: 'ব্লগ', labelEn: 'Blog' },
      { path: '/create-crusel', label: 'হোম ক্যারোসেল', labelEn: 'Home Carousel' },
      { path: '/create-service', label: 'সার্ভিস', labelEn: 'Services' },
      { path: '/create-brand', label: 'ব্র্যান্ড', labelEn: 'Brands' },
      { path: '/update-session', label: 'সেমিনার', labelEn: 'Sessions' },
      { path: '/create-video', label: 'ভিডিও', labelEn: 'Videos' },
      { path: '/create-question', label: 'কুইজ', labelEn: 'Quizzes' },
    ],
  },
  {
    key: 'people',
    label: 'ব্যবহারকারী',
    labelEn: 'People',
    icon: ICONS.people,
    home: '/students',
    routes: [
      { path: '/students', label: 'ছাত্র-ছাত্রী', labelEn: 'Students' },
      { path: '/users', label: 'একাউন্ট', labelEn: 'Users' },
      { path: '/branch', label: 'ব্রাঞ্চ', labelEn: 'Branches' },
      { path: '/accounts', label: 'পুরাতন একাউন্ট', labelEn: 'Old Accounts' },
    ],
  },
  {
    key: 'inbox',
    label: 'ইনবক্স',
    labelEn: 'Inbox',
    icon: ICONS.inbox,
    home: '/applications',
    routes: [
      { path: '/applications', label: 'আবেদন', labelEn: 'Applications' },
      { path: '/reviews', label: 'রিভিউ', labelEn: 'Reviews' },
      { path: '/contact-list', label: 'যোগাযোগ', labelEn: 'Contacts' },
      { path: '/semmenr-booklist', label: 'বুকিং', labelEn: 'Bookings' },
      { path: '/subscriber-list', label: 'সাবস্ক্রাইবার', labelEn: 'Subscribers' },
      { path: '/newsletter', label: 'নিউজলেটার', labelEn: 'Newsletter' },
    ],
  },
  {
    key: 'certificates',
    label: 'সার্টিফিকেট',
    labelEn: 'Certificates',
    icon: ICONS.certificate,
    home: '/create-certificate',
    routes: [
      { path: '/create-certificate', label: 'নতুন তৈরি', labelEn: 'Create' },
      { path: '/certsec', label: 'প্রদানকৃত', labelEn: 'Issued' },
    ],
  },
];

// EN: Map every concrete pathname back to its parent section key. Used by
//     SubNav and TopNav to highlight the right active tab.
// BN: প্রতিটা concrete pathname থেকে parent section key খুঁজে বের করার map।
//     SubNav আর TopNav ব্যবহার করে কোন tab active তা highlight করতে।
export function findActiveSection(pathname) {
  if (pathname === '/' || pathname === '') {
    return NAV_SECTIONS[0]; // dashboard
  }
  for (const section of NAV_SECTIONS) {
    if (section.home === pathname) return section;
    if (section.routes.some((r) => r.path === pathname)) return section;
  }
  return NAV_SECTIONS[0];
}
