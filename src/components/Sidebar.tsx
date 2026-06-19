import { LayoutDashboard, ArrowLeftRight, PieChart, Target, Settings, Zap, BookOpen } from 'lucide-react';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: '대시보드', icon: LayoutDashboard },
  { id: 'transactions', label: '거래 내역', icon: ArrowLeftRight },
  { id: 'budget', label: '예산 관리', icon: Target },
  { id: 'reports', label: '보고서', icon: PieChart },
  { id: 'automation', label: '자동화 규칙', icon: Zap },
  { id: 'accounts', label: '계좌 관리', icon: BookOpen },
  { id: 'settings', label: '설정', icon: Settings },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">회계 관리</h1>
            <p className="text-gray-400 text-xs">자동화 시스템</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              currentPage === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <Icon size={18} />
            {label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-700">
        <p className="text-xs text-gray-500 text-center">AI 회계 v1.0.0</p>
      </div>
    </aside>
  );
}
