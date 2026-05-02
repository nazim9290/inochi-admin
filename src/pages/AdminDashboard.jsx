import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInterceptor from '../axios/axiosInterceptor';

const ICONS = {
  edit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 113 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  ),
  blog: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  ),
  team: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zm14 10v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  course: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10l9-5 9 5-9 5-9-5z" />
      <path d="M6 12v5a6 6 0 0012 0v-5" />
    </svg>
  ),
  story: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 9V5a3 3 0 00-6 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  faq: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" />
    </svg>
  ),
  inbox: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
    </svg>
  ),
};

const Card = ({ title, value, hint, to, accent = 'teal' }) => (
  <Link
    to={to}
    className={`block bg-white border rounded-xl p-5 hover:shadow-md transition-all hover:-translate-y-0.5 ${
      accent === 'navy' ? 'border-brand-navy/20 hover:border-brand-navy/50' : 'border-brand-tealLight/40 hover:border-brand-teal/60'
    }`}
  >
    <p className="text-xs text-brand-slate uppercase tracking-wide font-semibold">{title}</p>
    <p className="text-3xl font-extrabold text-brand-navy mt-2">{value}</p>
    {hint && <p className="text-xs text-brand-slate mt-1">{hint}</p>}
  </Link>
);

const QuickAction = ({ to, icon, title, description }) => (
  <Link
    to={to}
    className="flex items-start gap-4 bg-white border border-brand-tealLight/40 rounded-xl p-4 hover:border-brand-teal/60 hover:shadow-md transition-all group"
  >
    <div className="bg-brand-teal/10 text-brand-teal p-3 rounded-lg group-hover:bg-brand-teal group-hover:text-white transition-colors">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-bold text-brand-navy text-sm">{title}</p>
      <p className="text-xs text-brand-slate mt-0.5 leading-relaxed">{description}</p>
    </div>
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-brand-slate flex-shrink-0 self-center">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  </Link>
);

const AdminDashboard = () => {
  const api = axiosInterceptor();
  const [stats, setStats] = useState({
    blogs: 0,
    team: 0,
    courses: 0,
    stories: 0,
    contacts: 0,
    bookings: 0,
    subscribers: 0,
  });

  useEffect(() => {
    let alive = true;
    const fetchAll = async () => {
      try {
        const [blogs, team, courses, stories] = await Promise.all([
          api.get('/published-blogs').catch(() => ({ data: {} })),
          api.get('/team-member').catch(() => ({ data: {} })),
          api.get('/jlpt-courses').catch(() => ({ data: {} })),
          api.get('/success-stories?all=true').catch(() => ({ data: {} })),
        ]);
        if (!alive) return;
        setStats({
          blogs: (blogs.data?.publishedBlogs || []).length,
          team: (team.data?.team || []).length,
          courses: (courses.data?.courses || []).length,
          stories: (stories.data?.stories || []).length,
          contacts: 0,
          bookings: 0,
          subscribers: 0,
        });
      } catch {}
    };
    fetchAll();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-brand-navy">স্বাগতম 👋</h1>
        <p className="text-sm text-brand-slate mt-1">
          Inochi Global Education-এর Admin Dashboard। নিচের কার্ডগুলো থেকে দ্রুত সাইটের content ম্যানেজ করুন।
        </p>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-3">সাইট পরিসংখ্যান</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card title="Blog Posts" value={stats.blogs} hint="প্রকাশিত" to="/blogs-manage" />
          <Card title="Team Members" value={stats.team} hint="সাইটে দৃশ্যমান" to="/team-create" />
          <Card title="JLPT Courses" value={stats.courses} hint="N5 / N4 / N3 / N2" to="/jlpt-courses" />
          <Card title="Success Stories" value={stats.stories} hint="শিক্ষার্থীদের গল্প" to="/success-stories" />
        </div>
      </div>

      {/* Quick actions — content */}
      <div>
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-3">দ্রুত পরিবর্তন</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickAction
            to="/site-settings"
            icon={ICONS.edit}
            title="Site Settings"
            description="Hero, ঠিকানা, WhatsApp, social link — সব সাইট-ব্যাপী সেটিংস।"
          />
          <QuickAction
            to="/how-it-works"
            icon={ICONS.course}
            title="How It Works"
            description="ছাত্র-যাত্রার ৬ ধাপ — title ও description এডিট করুন।"
          />
          <QuickAction
            to="/jlpt-courses"
            icon={ICONS.course}
            title="JLPT Courses"
            description="N5/N4/N3/N2 — দাম, সময়সূচি, ফিচার, পরবর্তী ব্যাচ।"
          />
          <QuickAction
            to="/success-stories"
            icon={ICONS.story}
            title="Success Stories"
            description="শিক্ষার্থীর ছবি, ইউনিভার্সিটি ও গল্প যোগ/সম্পাদনা করুন।"
          />
          <QuickAction
            to="/faqs"
            icon={ICONS.faq}
            title="FAQs"
            description="যে প্রশ্নগুলো বার বার আসে — সেগুলো এখানে যোগ করুন।"
          />
          <QuickAction
            to="/team-create"
            icon={ICONS.team}
            title="Team Members"
            description="কাউন্সেলর / শিক্ষকদের তথ্য, ছবি, social link এডিট করুন।"
          />
          <QuickAction
            to="/create-blog"
            icon={ICONS.blog}
            title="নতুন Blog"
            description="ব্লগ পোস্ট তৈরি করুন — দুই ভাষায় বিষয়বস্তু লিখুন।"
          />
          <QuickAction
            to="/create-crusel"
            icon={ICONS.edit}
            title="Home Carousel"
            description="হোম পেজের carousel slide গুলো ম্যানেজ করুন।"
          />
          <QuickAction
            to="/create-service"
            icon={ICONS.edit}
            title="Services"
            description="আমরা যা যা সেবা দিই — সেগুলো এডিট করুন।"
          />
        </div>
      </div>

      {/* Inbox */}
      <div>
        <h2 className="text-sm font-bold text-brand-navy uppercase tracking-wide mb-3">ইনবক্স</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <QuickAction
            to="/contact-list"
            icon={ICONS.inbox}
            title="Contacts"
            description="যারা contact form-এ message দিয়েছেন তাদের list।"
          />
          <QuickAction
            to="/semmenr-booklist"
            icon={ICONS.inbox}
            title="Seminar Bookings"
            description="যারা seminar বুক করেছেন তাদের তালিকা।"
          />
          <QuickAction
            to="/subscriber-list"
            icon={ICONS.inbox}
            title="Subscribers"
            description="যারা newsletter subscribe করেছেন তাদের list।"
          />
        </div>
      </div>

      {/* Help */}
      <div className="bg-brand-tealLight/15 border border-brand-tealLight/50 rounded-xl p-5 text-sm">
        <p className="font-bold text-brand-navy mb-2">💡 সাহায্য চাই?</p>
        <ul className="space-y-1 text-brand-slate">
          <li>• প্রতিটা ফর্মে দুই ভাষার (BN + EN) আলাদা ঘর আছে — দুটোই পূরণ করুন।</li>
          <li>• ছবি upload হলে কয়েক সেকেন্ড অপেক্ষা করুন — preview দেখা গেলে save করুন।</li>
          <li>• কোন কিছু ভুল হলে &quot;Edit&quot; ক্লিক করে সংশোধন করতে পারবেন।</li>
          <li>• Delete করার আগে confirmation আসবে — না হলে বুঝে confirm করুন।</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;
