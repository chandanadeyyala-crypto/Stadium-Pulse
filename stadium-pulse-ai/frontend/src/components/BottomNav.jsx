import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Map, 
  MessageSquare, 
  Bell, 
  Settings 
} from 'lucide-react';

export default function BottomNav() {
  const navItems = [
    { name: 'Home', path: '/fan-home', icon: Home },
    { name: 'Map', path: '/smart-navigation', icon: Map },
    { name: 'AI Help', path: '/ai-assistant', icon: MessageSquare },
    { name: 'Alerts', path: '/live-alerts', icon: Bell },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass-panel md:hidden border-t border-slate-800 z-40 flex justify-around py-1 pb-2 shadow-2xl">
      {navItems.map((item) => (
        <NavLink
          key={item.name}
          to={item.path}
          className={({ isActive }) => 
            `flex flex-col items-center justify-center flex-1 py-1 text-center transition-all ${
              isActive 
                ? 'text-electricBlue scale-105' 
                : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <item.icon size={20} className="mb-0.5" />
          <span className="text-[10px] font-semibold tracking-wide uppercase">
            {item.name}
          </span>
        </NavLink>
      ))}
    </nav>
  );
}
