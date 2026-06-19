import { useState } from 'react';
import { Plus, X, CreditCard, Building2, PiggyBank } from 'lucide-react';
import { useAccountingStore } from '../store/accountingStore';
import { Account } from '../types';
import { formatCurrency } from '../utils/formatters';

const ACCOUNT_ICONS = {
  checking: Building2,
  savings: PiggyBank,
  credit: CreditCard,
};

const ACCOUNT_LABELS = { checking: '입출금', savings: '저축', credit: '신용카드' };

export default function Accounts() {
  const { accounts, addAccount, deleteAccount } = useAccountingStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', balance: '', type: 'checking' as Account['type'] });

  const totalAsset = accounts
    .filter((a) => a.type !== 'credit')
    .reduce((s, a) => s + a.balance, 0);
  const totalCredit = accounts
    .filter((a) => a.type === 'credit')
    .reduce((s, a) => s + a.balance, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addAccount({ name: form.name, balance: parseInt(form.balance), type: form.type });
    setForm({ name: '', balance: '', type: 'checking' });
    setShowForm(false);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">계좌 관리</h2>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} /> 계좌 추가
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-5">
          <p className="text-blue-200 text-sm">총 자산</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalAsset)}</p>
        </div>
        <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-2xl p-5">
          <p className="text-red-200 text-sm">카드 사용액</p>
          <p className="text-2xl font-bold mt-1">{formatCurrency(totalCredit)}</p>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">계좌 추가</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">계좌명</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="예: 국민은행 통장"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">잔액 (원)</label>
                <input
                  type="number"
                  value={form.balance}
                  onChange={(e) => setForm((f) => ({ ...f, balance: e.target.value }))}
                  placeholder="0"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">계좌 유형</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as Account['type'] }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                >
                  <option value="checking">입출금</option>
                  <option value="savings">저축</option>
                  <option value="credit">신용카드</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border rounded-lg py-2 text-sm text-gray-600 hover:bg-gray-50">취소</button>
                <button type="submit"
                  className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700">추가</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => {
          const Icon = ACCOUNT_ICONS[account.type];
          const bgColors = { checking: 'bg-blue-50', savings: 'bg-green-50', credit: 'bg-red-50' };
          const textColors = { checking: 'text-blue-600', savings: 'text-green-600', credit: 'text-red-600' };
          return (
            <div key={account.id} className="bg-white rounded-xl border p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${bgColors[account.type]} p-2.5 rounded-xl`}>
                    <Icon size={20} className={textColors[account.type]} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{account.name}</p>
                    <p className="text-xs text-gray-400">{ACCOUNT_LABELS[account.type]}</p>
                  </div>
                </div>
                <button onClick={() => deleteAccount(account.id)} className="text-gray-200 hover:text-red-400">
                  <X size={16} />
                </button>
              </div>
              <p className={`text-xl font-bold ${account.type === 'credit' ? 'text-red-600' : 'text-gray-800'}`}>
                {formatCurrency(account.balance)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
