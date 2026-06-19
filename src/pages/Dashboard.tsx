import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAccountingStore } from '../store/accountingStore';
import { formatCurrency, CATEGORY_COLORS } from '../utils/formatters';

export default function Dashboard() {
  const { transactions, budgets, accounts } = useAccountingStore();

  const currentMonth = format(new Date(), 'yyyy-MM');

  const stats = useMemo(() => {
    const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
    const totalIncome = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
    return { totalIncome, totalExpense, totalBalance, savingsRate, net: totalIncome - totalExpense };
  }, [transactions, accounts, currentMonth]);

  const last6Months = useMemo(() => {
    const result = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const month = format(d, 'yyyy-MM');
      const label = format(d, 'M월', { locale: ko });
      const monthTx = transactions.filter((t) => t.date.startsWith(month));
      const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      result.push({ month: label, 수입: income, 지출: expense });
    }
    return result;
  }, [transactions]);

  const expensePieData = useMemo(() => {
    const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth) && t.type === 'expense');
    const byCategory: Record<string, number> = {};
    monthTx.forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [transactions, currentMonth]);

  const budgetAlerts = useMemo(() => {
    return budgets
      .filter((b) => b.month === currentMonth)
      .map((b) => {
        const spent = transactions
          .filter((t) => t.date.startsWith(currentMonth) && t.type === 'expense' && t.category === b.category)
          .reduce((s, t) => s + t.amount, 0);
        const ratio = (spent / b.limit) * 100;
        return { ...b, spent, ratio };
      })
      .filter((b) => b.ratio >= 70)
      .sort((a, b) => b.ratio - a.ratio);
  }, [budgets, transactions, currentMonth]);

  const recentTx = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5),
    [transactions]
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">대시보드</h2>
        <p className="text-gray-500 text-sm">{format(new Date(), 'yyyy년 M월 d일 EEEE', { locale: ko })}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="총 자산"
          value={formatCurrency(stats.totalBalance)}
          icon={<Wallet className="text-blue-500" size={22} />}
          bg="bg-blue-50"
        />
        <StatCard
          title="이번 달 수입"
          value={formatCurrency(stats.totalIncome)}
          icon={<TrendingUp className="text-green-500" size={22} />}
          bg="bg-green-50"
          sub={`저축률 ${stats.savingsRate.toFixed(1)}%`}
        />
        <StatCard
          title="이번 달 지출"
          value={formatCurrency(stats.totalExpense)}
          icon={<TrendingDown className="text-red-500" size={22} />}
          bg="bg-red-50"
        />
        <StatCard
          title="이번 달 순수익"
          value={formatCurrency(stats.net)}
          icon={<PiggyBank className="text-purple-500" size={22} />}
          bg="bg-purple-50"
          valueColor={stats.net >= 0 ? 'text-green-600' : 'text-red-600'}
        />
      </div>

      {/* Budget alerts */}
      {budgetAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <span className="font-semibold text-amber-700">예산 경고</span>
          </div>
          <div className="space-y-2">
            {budgetAlerts.map((b) => (
              <div key={b.id} className="flex items-center gap-3">
                <span className="text-sm text-gray-700 w-20">{b.category}</span>
                <div className="flex-1 bg-amber-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${b.ratio >= 100 ? 'bg-red-500' : 'bg-amber-500'}`}
                    style={{ width: `${Math.min(b.ratio, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-medium ${b.ratio >= 100 ? 'text-red-600' : 'text-amber-600'}`}>
                  {b.ratio.toFixed(0)}%
                </span>
                <span className="text-xs text-gray-500">{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly trend chart */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-gray-700 mb-4">월별 수입/지출 추이</h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={last6Months}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="수입" stroke="#10b981" fill="#d1fae5" strokeWidth={2} />
              <Area type="monotone" dataKey="지출" stroke="#ef4444" fill="#fee2e2" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Expense pie chart */}
        <div className="bg-white rounded-xl shadow-sm border p-5">
          <h3 className="font-semibold text-gray-700 mb-4">이번 달 지출 비율</h3>
          {expensePieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={expensePieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {expensePieData.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">
              이번 달 지출 내역이 없습니다
            </div>
          )}
        </div>
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-xl shadow-sm border p-5">
        <h3 className="font-semibold text-gray-700 mb-4">최근 거래</h3>
        <div className="space-y-3">
          {recentTx.map((t) => (
            <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-3">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: CATEGORY_COLORS[t.category] || '#94a3b8' }}
                />
                <div>
                  <p className="text-sm font-medium text-gray-800">{t.description}</p>
                  <p className="text-xs text-gray-400">{t.category} · {t.date}</p>
                </div>
              </div>
              <span className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title, value, icon, bg, sub, valueColor = 'text-gray-800'
}: {
  title: string; value: string; icon: React.ReactNode; bg: string; sub?: string; valueColor?: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-gray-500">{title}</p>
        <div className={`${bg} p-2 rounded-lg`}>{icon}</div>
      </div>
      <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
