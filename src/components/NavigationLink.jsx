import { Link, useLocation } from 'react-router-dom';

const NavigationLink = ({ children, path }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  const base = 'block px-4 py-2 font-medium no-underline transition-colors';
  const active = 'bg-brand-teal/15 text-brand-navy border-l-4 border-brand-teal';
  const inactive = 'text-brand-slate hover:bg-brand-tealLight/20 hover:text-brand-navy border-l-4 border-transparent';

  return (
    <li>
      <Link to={path} className={`${base} ${isActive ? active : inactive}`}>
        {children}
      </Link>
    </li>
  );
};

export default NavigationLink;
