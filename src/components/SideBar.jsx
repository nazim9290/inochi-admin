import NavigationLink from './NavigationLink';

const routes = [
  { name: 'Home', path: '/' },
  { name: 'Students', path: '/students' },
  { name: 'Create Blog', path: '/create-blog' },
  { name: 'Account', path: '/accounts' },
  { name: 'Student Certificate', path: '/certsec' },
  { name: 'Question', path: '/create-question' },
  { name: 'Branch', path: '/branch' },
  { name: 'Video Create', path: '/create-video' },
  { name: 'Create Certificate', path: '/create-certificate' },
  { name: 'Update Session', path: '/update-session' },
  { name: 'Team Create', path: '/team-create' },
  { name: 'Create Service', path: '/create-service' },
  { name: 'Create Carousel', path: '/create-crusel' },
  { name: 'Booking List', path: '/semmenr-booklist' },
  { name: 'Contact List', path: '/contact-list' },
  { name: 'Subscriber List', path: '/subscriber-list' },
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
        <ul className="list-none m-0 p-0">
          {routes.map((route) => (
            <NavigationLink key={route.path} path={route.path}>
              {route.name}
            </NavigationLink>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SideBar;
