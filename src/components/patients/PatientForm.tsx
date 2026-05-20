'use client';

import { useState } from 'react';
import { Patient } from '@/types';

interface PatientFormProps {
  initial?: Partial<Patient>;
  onSubmit: (data: Partial<Patient>) => Promise<void>;
  onCancel: () => void;
}

export function PatientForm({ initial = {}, onSubmit, onCancel }: PatientFormProps) {
  const [form, setForm] = useState({
    name: initial.name ?? '',
    birthDate: initial.birthDate ?? '',
    gender: initial.gender ?? 'male',
    phone: initial.phone ?? '',
    email: initial.email ?? '',
    address: initial.address ?? '',
    bloodType: initial.bloodType ?? '',
    allergies: initial.allergies?.join(', ') ?? '',
    chronicDiseases: initial.chronicDiseases?.join(', ') ?? '',
    insuranceNumber: initial.insuranceNumber ?? '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit({
        ...form,
        gender: form.gender as Patient['gender'],
        allergies: form.allergies ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean) : [],
        chronicDiseases: form.chronicDiseases
          ? form.chronicDiseases.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      });
    } finally {
      setLoading(false);
    }
  };

  const field = (label: string, key: keyof typeof form, type = 'text', required = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {field('이름', 'name', 'text', true)}
        {field('생년월일', 'birthDate', 'date', true)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            성별 <span className="text-red-500">*</span>
          </label>
          <select
            value={form.gender}
            onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value as 'male' | 'female' | 'other' }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </div>
        {field('혈액형', 'bloodType')}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {field('전화번호', 'phone', 'tel', true)}
        {field('이메일', 'email', 'email')}
      </div>
      {field('주소', 'address')}
      {field('보험번호', 'insuranceNumber')}
      {field('알레르기 (쉼표로 구분)', 'allergies')}
      {field('기저 질환 (쉼표로 구분)', 'chronicDiseases')}

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
