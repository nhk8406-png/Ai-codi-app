import { useState } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAccountingStore } from '../store/accountingStore';

export default function Settings() {
  const { transactions, budgets, accounts, autoRules } = useAccountingStore();
  const [confirmReset, setConfirmReset] = useState(false);

  const stats = [
    { label: '총 거래 수', value: transactions.length },
    { label: '예산 항목', value: budgets.length },
    { label: '등록 계좌', value: accounts.length },
    { label: '자동화 규칙', value: autoRules.length },
  ];

  const exportData = () => {
    const data = { transactions, budgets, accounts, autoRules, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `accounting_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    localStorage.removeItem('accounting-storage');
    window.location.reload();
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">설정</h2>

      {/* Stats */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-700 mb-4">데이터 현황</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center p-3 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Export */}
      <div className="bg-white rounded-xl border p-5">
        <h3 className="font-semibold text-gray-700 mb-2">데이터 백업</h3>
        <p className="text-sm text-gray-500 mb-4">모든 거래, 예산, 계좌, 자동화 규칙을 JSON 파일로 내보냅니다.</p>
        <button
          onClick={exportData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          JSON 백업 다운로드
        </button>
      </div>

      {/* Reset */}
      <div className="bg-white rounded-xl border border-red-100 p-5">
        <h3 className="font-semibold text-red-600 mb-2 flex items-center gap-2">
          <AlertTriangle size={16} /> 데이터 초기화
        </h3>
        <p className="text-sm text-gray-500 mb-4">모든 데이터가 삭제되고 초기 상태로 돌아갑니다. 이 작업은 되돌릴 수 없습니다.</p>
        {!confirmReset ? (
          <button
            onClick={() => setConfirmReset(true)}
            className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm hover:bg-red-50"
          >
            <Trash2 size={14} className="inline mr-1" /> 데이터 초기화
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-sm text-red-600 font-medium">정말 초기화하시겠습니까?</span>
            <button onClick={handleReset} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700">
              확인
            </button>
            <button onClick={() => setConfirmReset(false)} className="px-3 py-1.5 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              취소
            </button>
          </div>
        )}
      </div>

      <div className="bg-gray-50 rounded-xl p-5 text-xs text-gray-400 space-y-1">
        <p>• 모든 데이터는 브라우저 로컬 스토리지에 저장됩니다</p>
        <p>• 브라우저 캐시 삭제 시 데이터가 손실될 수 있습니다. 정기적으로 백업하세요</p>
        <p>• AI 회계 관리 시스템 v1.0.0</p>
      </div>
    </div>
  );
}
