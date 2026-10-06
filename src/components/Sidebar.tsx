import Link from 'next/link';
import { MessageSquare, MapPin, Settings } from 'lucide-react';

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen flex flex-col">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-xl font-bold">ReviewApp</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/reviews" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors">
          <MessageSquare size={20} />
          <span>Reviews</span>
        </Link>
        <Link href="/locations" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors">
          <MapPin size={20} />
          <span>Locations</span>
        </Link>
        <Link href="/settings" className="flex items-center gap-3 px-3 py-2 rounded hover:bg-slate-800 transition-colors">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
