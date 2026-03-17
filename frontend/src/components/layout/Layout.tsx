import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '⊞', exact: true },
  { to: '/patients', label: 'Patients', icon: '👥' },
  { to: '/visits/new', label: 'New visit', icon: '＋' },
  { to: '/reports', label: 'Reports', icon: '📄' },
  { to: '/patients/register', label: 'Register patient', icon: '➕' },
];

export function Layout() {
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/login'); }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <nav className="w-56 bg-teal-900 flex flex-col flex-shrink-0">
        <div className="px-4 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-400 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              </svg>
            </div>
            <div>
              <div className="text-white font-semibold text-sm">MedVoice</div>
              <div className="text-white/30 text-xs">Clinical docs</div>
            </div>
          </div>
        </div>

        <div className="flex-1 px-3 py-3 space-y-0.5">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-teal-400/20 text-teal-400'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-teal-400/30 flex items-center justify-center text-teal-400 text-xs font-semibold">
              {doctor?.firstName[0]}{doctor?.lastName[0]}
            </div>
            <div>
              <div className="text-white/70 text-xs font-medium">Dr. {doctor?.lastName}</div>
              <div className="text-white/30 text-xs">{doctor?.specialty}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="text-white/30 text-xs hover:text-white/50 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
