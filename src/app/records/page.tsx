'use client';

import { useState, useEffect } from 'react';
import { MedicalRecord, Patient } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { RecordForm } from '@/components/records/RecordForm';
import { formatDate } from '@/lib/utils';
import { Plus, Search, FileText, Sparkles, Pencil, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function RecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<MedicalRecord | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiSummary, setAiSummary] = useState<Record<string, string>>({});
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const load = async () => {
    const [recordsRes, patientsRes] = await Promise.all([
      fetch('/api/records'),
      fetch('/api/patients'),
    ]);
    setRecords(await recordsRes.json());
    setPatients(await patientsRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = records.filter(
    (r) => r.patientName.includes(search) || r.diagnosis.includes(search)
  );

  const handleCreate = async (data: Partial<MedicalRecord>) => {
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    load();
  };

  const handleUpdate = async (data: Partial<MedicalRecord>) => {
    if (!editing) return;
    await fetch(`/api/records/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 진료 기록을 삭제하시겠습니까?')) return;
    await fetch(`/api/records/${id}`, { method: 'DELETE' });
    load();
  };

  const handleAISummary = async (record: MedicalRecord) => {
    setAiLoading(record.id);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'summary',
          data: {
            diagnosis: record.diagnosis,
            treatment: record.treatment,
            prescription: record.prescription,
            notes: record.notes,
          },
        }),
      });
      const data = await res.json();
      setAiSummary((prev) => ({ ...prev, [record.id]: data.result }));
    } catch {
      alert('AI 요약 생성 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(null);
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">진료 기록</h1>
          <p className="text-sm text-gray-500 mt-1">총 {records.length}건의 기록</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          진료 기록 작성
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="환자명 또는 진단명으로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <FileText size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">진료 기록이 없습니다.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div
                className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold text-sm">
                    {r.patientName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.patientName}</p>
                    <p className="text-xs text-gray-500">{r.diagnosis}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-400">{formatDate(r.visitDate)}</span>
                  <span className="text-xs text-gray-400">{r.doctorName} 의사</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); setEditing(r); }}
                      className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {expanded === r.id ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                </div>
              </div>

              {expanded === r.id && (
                <div className="border-t border-gray-100 px-6 py-5 bg-gray-50">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <InfoItem label="주요 증상" value={r.chiefComplaint} />
                      <InfoItem label="상세 증상" value={r.symptoms} />
                      <InfoItem label="진단" value={`${r.diagnosis}${r.diagnosisCode ? ` (${r.diagnosisCode})` : ''}`} />
                      <InfoItem label="치료 내용" value={r.treatment} />
                    </div>
                    <div className="space-y-4">
                      <InfoItem label="처방" value={r.prescription || '-'} />
                      <InfoItem label="특이 사항" value={r.notes || '-'} />
                      {r.followUpDate && <InfoItem label="재진 예정" value={formatDate(r.followUpDate)} />}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    {aiSummary[r.id] ? (
                      <div className="bg-blue-50 rounded-lg p-4">
                        <p className="text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1.5">
                          <Sparkles size={13} /> AI 요약
                        </p>
                        <p className="text-sm text-gray-700">{aiSummary[r.id]}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleAISummary(r)}
                        disabled={aiLoading === r.id}
                        className="flex items-center gap-2 text-blue-600 text-sm font-medium hover:text-blue-700 disabled:opacity-50"
                      >
                        <Sparkles size={14} />
                        {aiLoading === r.id ? 'AI 요약 생성 중...' : 'AI 환자 설명 요약 생성'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="진료 기록 작성" size="xl">
        <RecordForm patients={patients} onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="진료 기록 수정" size="xl">
        {editing && (
          <RecordForm
            patients={patients}
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm text-gray-700">{value}</p>
    </div>
  );
}
