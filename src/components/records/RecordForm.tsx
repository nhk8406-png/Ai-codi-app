'use client';

import { useState } from 'react';
import { MedicalRecord, Patient } from '@/types';
import { Sparkles, Loader2 } from 'lucide-react';
import { calculateAge, GENDER_LABELS } from '@/lib/utils';

interface RecordFormProps {
  patients: Patient[];
  initial?: Partial<MedicalRecord>;
  onSubmit: (data: Partial<MedicalRecord>) => Promise<void>;
  onCancel: () => void;
}

export function RecordForm({ patients, initial = {}, onSubmit, onCancel }: RecordFormProps) {
  const [form, setForm] = useState({
    patientId: initial.patientId ?? '',
    visitDate: initial.visitDate ?? new Date().toISOString().split('T')[0],
    chiefComplaint: initial.chiefComplaint ?? '',
    symptoms: initial.symptoms ?? '',
    diagnosis: initial.diagnosis ?? '',
    diagnosisCode: initial.diagnosisCode ?? '',
    treatment: initial.treatment ?? '',
    prescription: initial.prescription ?? '',
    notes: initial.notes ?? '',
    doctorName: initial.doctorName ?? '',
    followUpDate: initial.followUpDate ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState('');

  const selectedPatient = patients.find((p) => p.id === form.patientId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const patient = patients.find((p) => p.id === form.patientId);
      await onSubmit({ ...form, patientName: patient?.name ?? '' });
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!selectedPatient || !form.chiefComplaint) {
      alert('환자와 주요 증상을 먼저 입력해주세요.');
      return;
    }
    setAiLoading(true);
    setAiResult('');
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'diagnosis',
          data: {
            patientName: selectedPatient.name,
            age: calculateAge(selectedPatient.birthDate),
            gender: GENDER_LABELS[selectedPatient.gender],
            chiefComplaint: form.chiefComplaint,
            symptoms: form.symptoms,
            allergies: selectedPatient.allergies?.join(', '),
            chronicDiseases: selectedPatient.chronicDiseases?.join(', '),
          },
        }),
      });
      const data = await res.json();
      setAiResult(data.result);
    } catch {
      alert('AI 생성 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  const applyAIResult = () => {
    const lines = aiResult.split('\n');
    const getValue = (prefix: string) => {
      const line = lines.find((l) => l.includes(prefix));
      return line ? line.replace(/^\d+\.\s*[^:]+:\s*/, '').trim() : '';
    };
    setForm((f) => ({
      ...f,
      diagnosis: getValue('추정 진단') || f.diagnosis,
      diagnosisCode: getValue('진단 코드') || f.diagnosisCode,
      treatment: getValue('치료 계획') || f.treatment,
      prescription: getValue('처방 제안') || f.prescription,
      notes: getValue('주의사항') || f.notes,
    }));
    setAiResult('');
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            환자 <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={form.patientId}
            onChange={(e) => setForm((f) => ({ ...f, patientId: e.target.value }))}
            className={inputCls}
          >
            <option value="">환자 선택</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.name} ({p.phone})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            진료일 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={form.visitDate}
            onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          주요 증상 (Chief Complaint) <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="예: 3일 전부터 발열, 기침"
          value={form.chiefComplaint}
          onChange={(e) => setForm((f) => ({ ...f, chiefComplaint: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">상세 증상</label>
        <textarea
          rows={3}
          placeholder="증상을 자세히 기술해주세요"
          value={form.symptoms}
          onChange={(e) => setForm((f) => ({ ...f, symptoms: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div className="border border-blue-200 bg-blue-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-blue-900 flex items-center gap-2">
            <Sparkles size={16} />
            AI 진료 기록 자동 작성
          </h3>
          <button
            type="button"
            onClick={handleAIGenerate}
            disabled={aiLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {aiLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {aiLoading ? 'AI 생성 중...' : 'AI로 자동 작성'}
          </button>
        </div>
        {aiResult && (
          <div className="mt-3">
            <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-wrap border border-blue-200 max-h-48 overflow-y-auto">
              {aiResult}
            </div>
            <button
              type="button"
              onClick={applyAIResult}
              className="mt-2 w-full bg-blue-100 text-blue-700 py-2 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
            >
              위 내용을 양식에 적용
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            진단명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.diagnosis}
            onChange={(e) => setForm((f) => ({ ...f, diagnosis: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">진단 코드 (ICD-10)</label>
          <input
            type="text"
            placeholder="예: J06.9"
            value={form.diagnosisCode}
            onChange={(e) => setForm((f) => ({ ...f, diagnosisCode: e.target.value }))}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          치료 내용 <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={2}
          required
          value={form.treatment}
          onChange={(e) => setForm((f) => ({ ...f, treatment: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">처방</label>
        <textarea
          rows={2}
          value={form.prescription}
          onChange={(e) => setForm((f) => ({ ...f, prescription: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            담당 의사 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={form.doctorName}
            onChange={(e) => setForm((f) => ({ ...f, doctorName: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">재진 예정일</label>
          <input
            type="date"
            value={form.followUpDate}
            onChange={(e) => setForm((f) => ({ ...f, followUpDate: e.target.value }))}
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">특이 사항</label>
        <textarea
          rows={2}
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
          className={inputCls}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {loading ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
      </div>
    </form>
  );
}
