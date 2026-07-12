import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  BellRing, 
  Map, 
  Database, 
  Settings, 
  UserCircle,
  HelpCircle,
  X,
  Shield,
  MessageSquare
} from 'lucide-react';

export default function Sidebar({ mobileOpen = false, onClose }) {
  const { user } = useAuth();
  const userRole = user?.role || 'staff';

  const menuItems = [
    { name: 'Dashboard', path: '/staff-dashboard', icon: LayoutDashboard },
    { name: 'Reports', path: '/staff-report', icon: FileText, role: ['volunteer', 'staff', 'organizer'] },
    { name: 'Alerts', path: '/alert-approval', icon: BellRing, role: ['staff', 'organizer'] },
    { name: 'Command Center', path: '/organizer-command', icon: Map, role: ['organizer'] },
    { name: 'Venue Data', path: '/admin-venue', icon: Database, role: ['organizer'] },
    { name: 'Query Assistant', path: '/tell-problem', icon: HelpCircle },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const filteredItems = menuItems.filter(item => !item.role || item.role.includes(userRole));

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Staff profile badge */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-electricBlue/20 border border-electricBlue/30 flex items-center justify-center flex-shrink-0">
            <UserCircle size={20} className="text-electricBlue" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-white leading-tight truncate">
              {user?.displayName || 'Operations Staff'}
            </h4>
            <span className="text-[10px] text-slate-400 capitalize font-mono">
              {userRole} · Active
            </span>
          </div>
        </div>
        {/* Close button (mobile only) */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex-shrink-0"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav label */}
      <div className="px-3 pt-3 pb-1">
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest font-mono">Navigation</span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 px-2 pb-2 space-y-0.5 overflow-y-auto">
        {filteredItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => 
              `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-electricBlue/15 text-white border border-electricBlue/30' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <item.icon size={17} className="flex-shrink-0" />
            <span className="truncate">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Operations notice */}
      <div className="p-3 border-t border-white/5">
        <div className="flex items-center space-x-2 px-1">
          <Shield size={12} className="text-slate-500 flex-shrink-0" />
          <div>
            <p className="text-[10px] text-slate-500 font-mono">FIFA WC 2026 Ops</p>
            <p className="text-[9px] text-slate-600 font-mono">Secure v1.0.2</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: persistent sidebar */}
      <aside className="hidden md:flex w-56 lg:w-64 bg-stadiumNavy border-r border-white/5 flex-col h-[calc(100vh-56px)] sticky top-14">
        <NavContent />
      </aside>

      {/* Mobile: slide-over drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-[var(--bg-primary)] border-r border-white/8 z-40 flex flex-col transition-transform duration-300 ease-in-out md:hidden shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <NavContent />
      </aside>
    </>
  );
}
