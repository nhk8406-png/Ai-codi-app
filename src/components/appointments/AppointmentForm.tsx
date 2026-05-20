'use client';

import { useState } from 'react';
import { Appointment, Patient } from '@/types';

interface AppointmentFormProps {
  patients: Patient[];
  initial?: Partial<Appointment>;
  onSubmit: (data: Partial<Appointment>) => Promise<void>;
  onCancel: () => void;
}

const TIMES = Array.from({ length: 22 }, (_, i) => {
  const h = Math.floor(i / 2) + 9;
  const m = i % 2 === 0 ? '00' : '30';
  return `${String(h).padStart(2, '0')}:${m}`;
});

export function AppointmentForm({ patients, initial = {}, onSubmit, onCancel }: AppointmentFormProps) {
  const [form, setForm] = useState({
    patientId: initial.patientId ?? '',
    date: initial.date ?? new Date().toISOString().split('T')[0],
    time: initial.time ?? '09:00',
    duration: initial.duration ?? 30,
    type: initial.type ?? 'initial',
    reason: initial.reason ?? '',
    doctorName: initial.doctorName ?? '',
    notes: initial.notes ?? '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const patient = patients.find((p) => p.id === form.patientId);
      await onSubmit({
        ...form,
        duration: Number(form.duration),
        type: form.type as Appointment['type'],
        patientName: patient?.name ?? '',
        patientPhone: patient?.phone ?? '',
      });
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            날짜 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            시간 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.time}
            onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className={inputCls}
          >
            {TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">진료 유형</label>
          <select
            value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as 'initial' | 'followup' | 'checkup' | 'emergency' }))}
            className={inputCls}
          >
            <option value="initial">초진</option>
            <option value="followup">재진</option>
            <option value="checkup">검진</option>
            <option value="emergency">응급</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">예상 소요시간(분)</label>
          <select
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: Number(e.target.value) }))}
            className={inputCls}
          >
            <option value={15}>15분</option>
            <option value={30}>30분</option>
            <option value={45}>45분</option>
            <option value={60}>60분</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          내원 사유 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          required
          value={form.reason}
          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
          className={inputCls}
        />
      </div>

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
        <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
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
          {loading ? '저장 중...' : '예약 저장'}
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
