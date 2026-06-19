import { useState, useMemo } from 'react';
import { Plus, Search, Trash2, X, Check, Zap } from 'lucide-react';
import { useAccountingStore } from '../store/accountingStore';
import { Transaction, Category, TransactionType } from '../types';
import { formatCurrency, INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/formatters';
import { format } from 'date-fns';

const EMPTY_FORM = {
  type: 'expense' as TransactionType,
  category: '식비' as Category,
  amount: '',
  description: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  isRecurring: false,
  recurringPeriod: 'monthly' as const,
  tags: '',
};

export default function Transactions() {
  const { transactions, addTransaction, deleteTransaction, applyAutoRules } = useAccountingStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | TransactionType>('all');
  const [filterMonth, setFilterMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [autoDetected, setAutoDetected] = useState<{ category: Category; type: TransactionType } | null>(null);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) ||
          t.category.includes(search);
        const matchType = filterType === 'all' || t.type === filterType;
        const matchMonth = !filterMonth || t.date.startsWith(filterMonth);
        return matchSearch && matchType && matchMonth;
      })
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, search, filterType, filterMonth]);

  const totals = useMemo(() => {
    const income = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = filtered.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [filtered]);

  const handleDescriptionChange = (desc: string) => {
    setForm((f) => ({ ...f, description: desc }));
    if (desc.length >= 2) {
      const detected = applyAutoRules(desc);
      if (detected) {
        setAutoDetected(detected);
      } else {
        setAutoDetected(null);
      }
    } else {
      setAutoDetected(null);
    }
  };

  const applyAutoDetected = () => {
    if (autoDetected) {
      setForm((f) => ({ ...f, category: autoDetected.category, type: autoDetected.type }));
      setAutoDetected(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.description) return;
    addTransaction({
      type: form.type,
      category: form.category,
      amount: parseInt(form.amount.replace(/,/g, '')),
      description: form.description,
      date: form.date,
      isRecurring: form.isRecurring,
      recurringPeriod: form.isRecurring ? form.recurringPeriod : undefined,
      tags: form.tags ? form.tags.split(',').map((t) => t.trim()) : [],
    });
    setForm(EMPTY_FORM);
    setShowForm(false);
    setAutoDetected(null);
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">거래 내역</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Plus size={16} /> 거래 추가
        </button>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">새 거래 추가</h3>
              <button onClick={() => { setShowForm(false); setAutoDetected(null); }}>
                <X size={20} className="text-gray-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type toggle */}
              <div className="flex rounded-lg overflow-hidden border">
                {(['expense', 'income'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: t, category: t === 'income' ? '급여' : '식비' }))}
                    className={`flex-1 py-2 text-sm font-medium transition-colors ${
                      form.type === t
                        ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {t === 'income' ? '수입' : '지출'}
                  </button>
                ))}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">설명</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => handleDescriptionChange(e.target.value)}
                  placeholder="거래 내용을 입력하세요"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {autoDetected && (
                  <div className="mt-1 flex items-center gap-2 text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                    <Zap size={12} />
                    <span>자동 감지: <strong>{autoDetected.category}</strong> ({autoDetected.type === 'income' ? '수입' : '지출'})</span>
                    <button type="button" onClick={applyAutoDetected} className="ml-auto flex items-center gap-1 font-semibold">
                      <Check size={12} /> 적용
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">금액 (원)</label>
                  <input
                    type="number"
                    value={form.amount}
                    onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                    placeholder="0"
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">날짜</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">카테고리</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={form.isRecurring}
                  onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))}
                  className="rounded"
                />
                <label htmlFor="recurring" className="text-sm text-gray-600">정기 거래</label>
                {form.isRecurring && (
                  <select
                    value={form.recurringPeriod}
                    onChange={(e) => setForm((f) => ({ ...f, recurringPeriod: e.target.value as typeof form.recurringPeriod }))}
                    className="ml-2 border rounded px-2 py-1 text-xs"
                  >
                    <option value="monthly">매월</option>
                    <option value="weekly">매주</option>
                    <option value="yearly">매년</option>
                  </select>
                )}
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">태그 (쉼표로 구분)</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                  placeholder="예: 카드, 개인"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowForm(false); setAutoDetected(null); }}
                  className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">
                  취소
                </button>
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">
                  추가
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 border rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="거래 검색..."
            className="text-sm outline-none flex-1"
          />
        </div>
        <input
          type="month"
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm outline-none"
        />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as typeof filterType)}
          className="border rounded-lg px-3 py-2 text-sm outline-none"
        >
          <option value="all">전체</option>
          <option value="income">수입</option>
          <option value="expense">지출</option>
        </select>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-xl p-4 text-center">
          <p className="text-xs text-green-600 font-medium">수입</p>
          <p className="text-lg font-bold text-green-700 mt-1">{formatCurrency(totals.income)}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4 text-center">
          <p className="text-xs text-red-600 font-medium">지출</p>
          <p className="text-lg font-bold text-red-700 mt-1">{formatCurrency(totals.expense)}</p>
        </div>
        <div className={`${totals.income - totals.expense >= 0 ? 'bg-blue-50' : 'bg-orange-50'} rounded-xl p-4 text-center`}>
          <p className={`text-xs font-medium ${totals.income - totals.expense >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>순수익</p>
          <p className={`text-lg font-bold mt-1 ${totals.income - totals.expense >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
            {formatCurrency(totals.income - totals.expense)}
          </p>
        </div>
      </div>

      {/* Transaction list */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="divide-y">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400 text-sm">거래 내역이 없습니다</div>
          ) : (
            filtered.map((t) => (
              <TransactionRow key={t.id} transaction={t} onDelete={() => deleteTransaction(t.id)} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionRow({ transaction: t, onDelete }: { transaction: Transaction; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-4 p-4 hover:bg-gray-50 group">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold ${
        t.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {t.type === 'income' ? '수' : '지'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-gray-800 truncate">{t.description}</p>
          {t.isRecurring && (
            <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">정기</span>
          )}
        </div>
        <p className="text-xs text-gray-400">{t.category} · {t.date}</p>
      </div>
      <div className="text-right">
        <p className={`font-semibold text-sm ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
        </p>
      </div>
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}
