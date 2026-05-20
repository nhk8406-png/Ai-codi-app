'use client';

import { useState, useEffect } from 'react';
import { Patient } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { PatientForm } from '@/components/patients/PatientForm';
import { formatDate, calculateAge, GENDER_LABELS } from '@/lib/utils';
import { Plus, Search, User, Phone, Pencil, Trash2 } from 'lucide-react';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const res = await fetch('/api/patients');
    const data = await res.json();
    setPatients(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = patients.filter((p) =>
    p.name.includes(search) || p.phone.includes(search)
  );

  const handleCreate = async (data: Partial<Patient>) => {
    await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    load();
  };

  const handleUpdate = async (data: Partial<Patient>) => {
    if (!editing) return;
    await fetch(`/api/patients/${editing.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`${name} 환자를 삭제하시겠습니까?`)) return;
    await fetch(`/api/patients/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">환자 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {patients.length}명의 환자</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          환자 등록
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="이름 또는 전화번호로 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {loading ? (
        <div className="text-center py-16 text-gray-400">불러오는 중...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-100">
          <User size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400">환자가 없습니다.</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 text-blue-600 text-sm font-medium hover:underline"
          >
            첫 환자 등록하기
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['이름', '생년월일 / 나이', '성별', '연락처', '기저 질환', '등록일', ''].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-sm font-medium">
                        {p.name[0]}
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    {formatDate(p.birthDate)} <span className="text-gray-400">({calculateAge(p.birthDate)}세)</span>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600">{GENDER_LABELS[p.gender]}</td>
                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Phone size={13} className="text-gray-400" />
                      {p.phone}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {p.chronicDiseases?.length ? p.chronicDiseases.join(', ') : '-'}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-400">{formatDate(p.createdAt)}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-400"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="환자 등록" size="lg">
        <PatientForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
      </Modal>

      <Modal isOpen={!!editing} onClose={() => setEditing(null)} title="환자 정보 수정" size="lg">
        {editing && (
          <PatientForm
            initial={editing}
            onSubmit={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        )}
      </Modal>
    </div>
  );
}
