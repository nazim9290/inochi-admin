import NavigationLink from './NavigationLink';

const groups = [
  {
    title: 'Dashboard',
    routes: [
      { name: 'হোম', path: '/' },
    ],
  },
  {
    title: 'Site Content',
    routes: [
      { name: 'Site Settings', path: '/site-settings' },
      { name: 'How It Works', path: '/how-it-works' },
      { name: 'JLPT Courses', path: '/jlpt-courses' },
      { name: 'Success Stories', path: '/success-stories' },
      { name: 'FAQs', path: '/faqs' },
    ],
  },
  {
    title: 'Pages',
    routes: [
      { name: 'Home Carousel', path: '/create-crusel' },
      { name: 'Team', path: '/team-create' },
      { name: 'Services', path: '/create-service' },
      { name: 'Blog', path: '/create-blog' },
      { name: 'Brands', path: '/create-brand' },
      { name: 'Sessions', path: '/update-session' },
      { name: 'Videos', path: '/create-video' },
      { name: 'Quizzes', path: '/create-question' },
    ],
  },
  {
    title: 'People',
    routes: [
      { name: 'Students', path: '/students' },
      { name: 'Branches', path: '/branch' },
      { name: 'Account', path: '/accounts' },
    ],
  },
  {
    title: 'Inbox',
    routes: [
      { name: 'Bookings', path: '/semmenr-booklist' },
      { name: 'Contacts', path: '/contact-list' },
      { name: 'Subscribers', path: '/subscriber-list' },
    ],
  },
  {
    title: 'Certificates',
    routes: [
      { name: 'Create', path: '/create-certificate' },
      { name: 'Issued', path: '/certsec' },
    ],
  },
];

const SideBar = () => {
  return (
    <aside className="w-64 min-h-screen bg-white border-r border-brand-tealLight/30">
      <div className="flex flex-col items-center px-4 pt-6 pb-4 border-b border-brand-tealLight/30">
        <img
          src="/Inochi_logo.png"
          alt="Inochi Global Education"
          className="w-24 h-24 object-contain"
        />
        <div className="text-center mt-3">
          <h5 className="font-semibold text-brand-navy m-0">Inochi Admin</h5>
          <p className="text-sm text-brand-slate mt-1">Dhaka, Bangladesh</p>
        </div>
      </div>

      <nav className="py-2">
        {groups.map((group) => (
          <div key={group.title} className="mb-3">
            <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wider text-brand-slate/70 font-bold">
              {group.title}
            </p>
            <ul className="list-none m-0 p-0">
              {group.routes.map((route) => (
                <NavigationLink key={route.path} path={route.path}>
                  {route.name}
                </NavigationLink>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default SideBar;
