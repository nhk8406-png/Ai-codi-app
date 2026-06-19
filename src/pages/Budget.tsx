import { useState, useMemo } from 'react';
import { Plus, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';
import { useAccountingStore } from '../store/accountingStore';
import { Category } from '../types';
import { formatCurrency, EXPENSE_CATEGORIES } from '../utils/formatters';

export default function Budget() {
  const { budgets, addBudget, deleteBudget, transactions } = useAccountingStore();
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ category: '식비' as Category, limit: '' });

  const monthBudgets = useMemo(
    () => budgets.filter((b) => b.month === selectedMonth),
    [budgets, selectedMonth]
  );

  const budgetWithSpend = useMemo(() =>
    monthBudgets.map((b) => {
      const spent = transactions
        .filter((t) => t.date.startsWith(selectedMonth) && t.type === 'expense' && t.category === b.category)
        .reduce((s, t) => s + t.amount, 0);
      const ratio = Math.min((spent / b.limit) * 100, 100);
      const remaining = b.limit - spent;
      return { ...b, spent, ratio, remaining };
    }),
    [monthBudgets, transactions, selectedMonth]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.limit) return;
    const existing = monthBudgets.find((b) => b.category === form.category);
    if (existing) {
      alert('이미 해당 카테고리의 예산이 설정되어 있습니다.');
      return;
    }
    addBudget({ category: form.category, limit: parseInt(form.limit), month: selectedMonth });
    setForm({ category: '식비', limit: '' });
    setShowForm(false);
  };

  const usedCategories = monthBudgets.map((b) => b.category);
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !usedCategories.includes(c));

  const totalBudget = monthBudgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgetWithSpend.reduce((s, b) => s + b.spent, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">예산 관리</h2>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm outline-none"
          />
          {availableCategories.length > 0 && (
            <button
              onClick={() => { setForm({ category: availableCategories[0], limit: '' }); setShowForm(true); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
            >
              <Plus size={16} /> 예산 추가
            </button>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">예산 설정</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">카테고리</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                >
                  {availableCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">예산 금액 (원)</label>
                <input
                  type="number"
                  value={form.limit}
                  onChange={(e) => setForm((f) => ({ ...f, limit: e.target.value }))}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required min="1"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">취소</button>
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">설정</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">총 예산</p>
          <p className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(totalBudget)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">총 지출</p>
          <p className="text-xl font-bold text-red-600 mt-1">{formatCurrency(totalSpent)}</p>
        </div>
        <div className="bg-white rounded-xl border p-4">
          <p className="text-xs text-gray-500">남은 예산</p>
          <p className={`text-xl font-bold mt-1 ${totalBudget - totalSpent >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {formatCurrency(totalBudget - totalSpent)}
          </p>
        </div>
      </div>

      {/* Budget cards */}
      {budgetWithSpend.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-400 text-sm">이 달에 설정된 예산이 없습니다</p>
          {availableCategories.length > 0 && (
            <button
              onClick={() => { setForm({ category: availableCategories[0], limit: '' }); setShowForm(true); }}
              className="mt-3 text-blue-600 text-sm hover:underline"
            >
              예산 추가하기
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {budgetWithSpend.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold text-gray-800">{b.category}</span>
                <button onClick={() => deleteBudget(b.id)} className="text-gray-300 hover:text-red-400">
                  <Trash2 size={15} />
                </button>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{formatCurrency(b.spent)}</span>
                  <span>{formatCurrency(b.limit)}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all ${
                      b.ratio >= 100 ? 'bg-red-500' : b.ratio >= 80 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${b.ratio}%` }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className={`text-sm font-medium ${b.ratio >= 100 ? 'text-red-600' : 'text-gray-600'}`}>
                  {b.ratio.toFixed(0)}% 사용
                </span>
                <span className={`text-sm ${b.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {b.remaining >= 0 ? `${formatCurrency(b.remaining)} 남음` : `${formatCurrency(-b.remaining)} 초과`}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
