import { useState } from 'react';
import { Plus, X, Zap, RefreshCw } from 'lucide-react';
import { useAccountingStore } from '../store/accountingStore';
import { AutoRule, Category, TransactionType } from '../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES } from '../utils/formatters';

export default function Automation() {
  const { autoRules, addAutoRule, toggleAutoRule, deleteAutoRule, generateRecurring } = useAccountingStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ keyword: '', category: '식비' as Category, type: 'expense' as TransactionType });
  const [generated, setGenerated] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.keyword.trim()) return;
    addAutoRule({ keyword: form.keyword.trim(), category: form.category, type: form.type, isActive: true });
    setForm({ keyword: '', category: '식비', type: 'expense' });
    setShowForm(false);
  };

  const handleGenerateRecurring = () => {
    generateRecurring();
    setGenerated(true);
    setTimeout(() => setGenerated(false), 3000);
  };

  const categories = form.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">자동화 규칙</h2>
          <p className="text-sm text-gray-500 mt-1">거래 설명을 분석해 카테고리를 자동으로 분류합니다</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          <Plus size={16} /> 규칙 추가
        </button>
      </div>

      {/* Recurring auto-generate */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RefreshCw size={20} className="text-blue-600" />
            <div>
              <h3 className="font-semibold text-blue-800">정기 거래 자동 생성</h3>
              <p className="text-xs text-blue-600 mt-0.5">매월 정기 거래를 자동으로 이번 달에 생성합니다</p>
            </div>
          </div>
          <button
            onClick={handleGenerateRecurring}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              generated
                ? 'bg-green-500 text-white'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {generated ? '✓ 생성 완료' : '지금 실행'}
          </button>
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">자동 분류 규칙 추가</h3>
              <button onClick={() => setShowForm(false)}><X size={20} className="text-gray-400" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">키워드 (거래 설명에 포함된 단어)</label>
                <input
                  type="text"
                  value={form.keyword}
                  onChange={(e) => setForm((f) => ({ ...f, keyword: e.target.value }))}
                  placeholder="예: 스타벅스, 지하철, 마트"
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">유형</label>
                <div className="flex rounded-lg overflow-hidden border">
                  {(['expense', 'income'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: t, category: t === 'income' ? '급여' : '식비' }))}
                      className={`flex-1 py-2 text-sm font-medium transition-colors ${
                        form.type === t
                          ? t === 'income' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {t === 'income' ? '수입' : '지출'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">카테고리</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm outline-none"
                >
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
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

      {/* Rules list */}
      <div className="bg-white rounded-xl border overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="grid grid-cols-4 gap-4 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span>키워드</span>
            <span>유형</span>
            <span>카테고리</span>
            <span className="text-right">상태 / 삭제</span>
          </div>
        </div>
        <div className="divide-y">
          {autoRules.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">등록된 자동화 규칙이 없습니다</div>
          ) : (
            autoRules.map((rule) => (
              <RuleRow key={rule.id} rule={rule} onToggle={() => toggleAutoRule(rule.id)} onDelete={() => deleteAutoRule(rule.id)} />
            ))
          )}
        </div>
      </div>

      <div className="bg-gray-50 rounded-xl border p-5">
        <div className="flex items-center gap-2 mb-3">
          <Zap size={16} className="text-blue-500" />
          <h3 className="font-semibold text-gray-700 text-sm">자동화 작동 방식</h3>
        </div>
        <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
          <li>거래 추가 시 설명란에 키워드가 포함되면 자동으로 카테고리와 유형을 제안합니다</li>
          <li>키워드는 대소문자를 구분하지 않습니다</li>
          <li>여러 규칙 중 첫 번째로 매칭되는 규칙이 적용됩니다</li>
          <li>규칙을 비활성화하면 자동 분류에서 제외됩니다</li>
        </ul>
      </div>
    </div>
  );
}

function RuleRow({ rule, onToggle, onDelete }: { rule: AutoRule; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className={`grid grid-cols-4 gap-4 p-4 items-center ${!rule.isActive ? 'opacity-50' : ''}`}>
      <div className="flex items-center gap-2">
        <Zap size={14} className="text-blue-400 flex-shrink-0" />
        <span className="text-sm font-medium text-gray-800">{rule.keyword}</span>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full w-fit ${
        rule.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {rule.type === 'income' ? '수입' : '지출'}
      </span>
      <span className="text-sm text-gray-600">{rule.category}</span>
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onToggle}
          className={`w-10 h-5 rounded-full transition-colors relative ${rule.isActive ? 'bg-blue-500' : 'bg-gray-300'}`}
          title={rule.isActive ? '비활성화' : '활성화'}
        >
          <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${rule.isActive ? 'left-5' : 'left-0.5'}`} />
        </button>
        <button onClick={onDelete} className="text-gray-300 hover:text-red-400">
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
