import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  BellRing, 
  Map, 
  CheckSquare, 
  Database, 
  Settings, 
  UserCircle 
} from 'lucide-react';

export default function Sidebar() {
  const { user } = useAuth();
  const userRole = user?.role || 'staff';

  const menuItems = [
    { name: 'Dashboard', path: '/staff-dashboard', icon: LayoutDashboard },
    { name: 'Reports', path: '/staff-report', icon: FileText, role: ['volunteer', 'staff', 'organizer'] },
    { name: 'Alerts', path: '/alert-approval', icon: BellRing, role: ['staff', 'organizer'] },
    { name: 'Map', path: '/organizer-command', icon: Map, role: ['organizer'] },
    { name: 'Tasks', path: '/staff-dashboard#tasks', icon: CheckSquare }, // Shared task list
    { name: 'Venue Data', path: '/admin-venue', icon: Database, role: ['organizer'] },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-stadiumNavy border-r border-slate-800 flex flex-col h-[calc(100vh-64px)] sticky top-16 hidden md:flex">
      {/* Staff profile badge */}
      <div className="p-4 border-b border-slate-800 flex items-center space-x-3 bg-black bg-opacity-25">
        <UserCircle size={36} className="text-electricBlue" />
        <div>
          <h4 className="text-sm font-semibold text-white leading-tight">
            {user?.displayName || 'Operations Staff'}
          </h4>
          <span className="text-xs text-slate-400 capitalize">
            {userRole} Mode
          </span>
        </div>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          // Role matching checks
          if (item.role && !item.role.includes(userRole)) return null;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-electricBlue text-white shadow-lg shadow-blue-500/20' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Operations notice */}
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500">
        <p>FIFA WC 2026 Operations</p>
        <p className="font-mono mt-1 text-[10px]">Secure connection v1.0.2</p>
      </div>
    </aside>
  );
}
