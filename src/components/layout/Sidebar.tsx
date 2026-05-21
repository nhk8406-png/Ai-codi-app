'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Calendar,
  Stethoscope,
} from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();
  const [todayCount, setTodayCount] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    fetch(`/api/appointments?date=${today}`)
      .then((r) => r.json())
      .then((data) => setTodayCount(Array.isArray(data) ? data.length : 0))
      .catch(() => {});
  }, [pathname]);

  const navItems = [
    { href: '/', label: '대시보드', icon: LayoutDashboard, badge: null },
    { href: '/patients', label: '환자 관리', icon: Users, badge: null },
    { href: '/records', label: '진료 기록', icon: FileText, badge: null },
    { href: '/appointments', label: '예약 관리', icon: Calendar, badge: todayCount > 0 ? todayCount : null },
  ];

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
        {navItems.map(({ href, label, icon: Icon, badge }) => {
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
              <span className="flex-1">{label}</span>
              {badge !== null && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {badge}
                </span>
              )}
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
