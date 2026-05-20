'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Stethoscope,
} from 'lucide-react';

const navItems = [
  { href: '/', label: '대시보드', icon: LayoutDashboard },
  { href: '/patients', label: '환자 관리', icon: Users },
  { href: '/records', label: '진료 기록', icon: FileText },
  { href: '/appointments', label: '예약 관리', icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
            <Stethoscope size={20} />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">MediRecord</h1>
            <p className="text-xs text-slate-400">의료기록 자동화</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <p className="text-xs text-slate-500 text-center">AI 기반 의료기록 시스템 v1.0</p>
      </div>
    </aside>
  );
}
