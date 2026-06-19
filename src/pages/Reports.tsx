import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { useAccountingStore } from '../store/accountingStore';
import { formatCurrency, CATEGORY_COLORS } from '../utils/formatters';
import { Download } from 'lucide-react';

export default function Reports() {
  const { transactions } = useAccountingStore();
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));

  const monthlyData = useMemo(() => {
    const result = [];
    for (let m = 1; m <= 12; m++) {
      const month = `${selectedYear}-${String(m).padStart(2, '0')}`;
      const monthTx = transactions.filter((t) => t.date.startsWith(month));
      const income = monthTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
      const expense = monthTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
      result.push({
        month: `${m}월`,
        수입: income,
        지출: expense,
        순수익: income - expense,
      });
    }
    return result;
  }, [transactions, selectedYear]);

  const yearlyStats = useMemo(() => {
    const yearTx = transactions.filter((t) => t.date.startsWith(selectedYear));
    const totalIncome = yearTx.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = yearTx.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

    const byCategory: Record<string, number> = {};
    yearTx.filter((t) => t.type === 'expense').forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });

    const topCategories = Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return { totalIncome, totalExpense, savingsRate, topCategories, net: totalIncome - totalExpense };
  }, [transactions, selectedYear]);

  const currentMonth = format(new Date(), 'yyyy-MM');
  const monthStats = useMemo(() => {
    const monthTx = transactions.filter((t) => t.date.startsWith(currentMonth));
    const byCategory: Record<string, number> = {};
    monthTx.filter((t) => t.type === 'expense').forEach((t) => {
      byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
    });
    return Object.entries(byCategory)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [transactions, currentMonth]);

  const exportCSV = () => {
    const headers = ['날짜', '유형', '카테고리', '금액', '설명', '태그'];
    const rows = transactions
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((t) => [
        t.date,
        t.type === 'income' ? '수입' : '지출',
        t.category,
        t.amount,
        t.description,
        t.tags.join(', '),
      ]);
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `회계보고서_${format(new Date(), 'yyyyMMdd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const years = Array.from(new Set(transactions.map((t) => t.date.substring(0, 4)))).sort().reverse();
  if (!years.includes(selectedYear)) years.unshift(selectedYear);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">보고서</h2>
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none"
          >
            {years.map((y) => <option key={y} value={y}>{y}년</option>)}
          </select>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
          >
            <Download size={16} /> CSV 내보내기
          </button>
        </div>
      </div>

      {/* Annual stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: '연간 수입', value: formatCurrency(yearlyStats.totalIncome), color: 'text-green-600' },
          { label: '연간 지출', value: formatCurrency(yearlyStats.totalExpense), color: 'text-red-600' },
          { label: '연간 순수익', value: formatCurrency(yearlyStats.net), color: yearlyStats.net >= 0 ? 'text-blue-600' : 'text-red-600' },
          { label: '연간 저축률', value: `${yearlyStats.savingsRate.toFixed(1)}%`, color: yearlyStats.savingsRate >= 20 ? 'text-green-600' : 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`text-lg font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Monthly bar chart */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-700 mb-4">{selectedYear}년 월별 수입/지출</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={monthlyData} barSize={20}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Bar dataKey="수입" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="지출" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Net income trend */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-700 mb-4">순수익 추이</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 10000).toFixed(0)}만`} />
            <Tooltip formatter={(value: number) => formatCurrency(value)} />
            <Line type="monotone" dataKey="순수익" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly pie */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-700 mb-4">이번 달 카테고리별 지출</h3>
          {monthStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={monthStats} cx="50%" cy="45%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {monthStats.map((entry) => (
                    <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-60 flex items-center justify-center text-gray-400 text-sm">데이터 없음</div>}
        </div>

        {/* Top categories */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-semibold text-gray-700 mb-4">{selectedYear}년 지출 카테고리 TOP</h3>
          {yearlyStats.topCategories.length === 0 ? (
            <div className="h-60 flex items-center justify-center text-gray-400 text-sm">데이터 없음</div>
          ) : (
            <div className="space-y-3">
              {yearlyStats.topCategories.slice(0, 8).map((c, i) => {
                const maxVal = yearlyStats.topCategories[0].value;
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="text-xs text-gray-400 w-4">{i + 1}</span>
                    <span className="text-sm text-gray-700 w-20">{c.name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{ width: `${(c.value / maxVal) * 100}%`, backgroundColor: CATEGORY_COLORS[c.name] || '#94a3b8' }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700 w-28 text-right">{formatCurrency(c.value)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
