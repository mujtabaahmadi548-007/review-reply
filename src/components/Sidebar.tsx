'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageSquare, MapPin, Settings } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/reviews', label: 'Reviews', icon: MessageSquare },
    { href: '/locations', label: 'Locations', icon: MapPin },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white min-h-screen flex-col sticky top-0">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold">ReviewApp</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname.startsWith(link.href);
            return (
              <Link 
                key={link.href}
                href={link.href} 
                className={`flex items-center gap-3 px-3 py-2 rounded transition-colors ${
                  isActive ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-2 z-50 safe-area-pb">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          return (
            <Link 
              key={link.href}
              href={link.href}
              className={`flex flex-col items-center p-2 min-w-[64px] transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icon size={20} className="mb-1" />
              <span className="text-[10px] font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 left-0 right-0 bg-slate-900 text-white p-4 z-40 shadow-sm flex items-center justify-between">
        <h1 className="text-lg font-bold">ReviewApp</h1>
      </header>
    </>
  );
}
