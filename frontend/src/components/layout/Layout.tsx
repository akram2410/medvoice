import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/auth';
import { Role } from '../../types';

const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Admin',
  DOCTOR: 'Doctor',
  RECEPTIONIST: 'Receptionist',
};

const navItems: { to: string; label: string; icon: string; exact?: boolean; roles: Role[] }[] = [
  { to: '/',                  label: 'Dashboard',       icon: '⊞', exact: true, roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { to: '/patients',          label: 'Patients',         icon: '👥',             roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { to: '/patients/register', label: 'Register patient', icon: '➕',             roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST'] },
  { to: '/visits/new',        label: 'New visit',        icon: '＋',             roles: ['ADMIN', 'DOCTOR'] },
  { to: '/reports',           label: 'Reports',          icon: '📄',             roles: ['ADMIN', 'DOCTOR'] },
];

export function Layout() {
  const { doctor, logout } = useAuth();
  const navigate = useNavigate();
  const role = doctor?.role;

  function handleLogout() { logout(); navigate('/login'); }

  const visibleNav = navItems.filter(item => role && item.roles.includes(role));

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
          {visibleNav.map(item => (
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
              <div className="text-white/70 text-xs font-medium">
                {role === 'DOCTOR' || role === 'ADMIN' ? 'Dr. ' : ''}{doctor?.lastName}
              </div>
              <div className="text-white/30 text-xs flex items-center gap-1.5">
                <span>{doctor?.specialty}</span>
                {role && role !== 'DOCTOR' && (
                  <span className="bg-teal-400/20 text-teal-400 rounded px-1 py-0.5 text-[10px] font-medium">
                    {ROLE_LABELS[role]}
                  </span>
                )}
              </div>
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
