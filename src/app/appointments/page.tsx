'use client';

import { useState, useEffect } from 'react';
import { Appointment, Patient } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { formatDate, APPOINTMENT_TYPE_LABELS, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/lib/utils';
import { Plus, Calendar, ChevronLeft, ChevronRight, Clock, User } from 'lucide-react';

const STATUS_OPTIONS: Appointment['status'][] = ['scheduled', 'confirmed', 'completed', 'cancelled', 'noshow'];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [appRes, patRes] = await Promise.all([
      fetch('/api/appointments'),
      fetch('/api/patients'),
    ]);
    setAppointments(await appRes.json());
    setPatients(await patRes.json());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const dateAppointments = appointments.filter((a) => a.date === selectedDate);

  const moveDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleCreate = async (data: Partial<Appointment>) => {
    await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    setShowModal(false);
    load();
  };

  const handleStatusChange = async (id: string, status: Appointment['status']) => {
    await fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('예약을 삭제하시겠습니까?')) return;
    await fetch(`/api/appointments/${id}`, { method: 'DELETE' });
    load();
  };

  const upcomingByDate = appointments
    .filter((a) => a.date >= new Date().toISOString().split('T')[0] && a.status === 'scheduled')
    .reduce<Record<string, Appointment[]>>((acc, a) => {
      acc[a.date] = [...(acc[a.date] ?? []), a];
      return acc;
    }, {});

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">예약 관리</h1>
          <p className="text-sm text-gray-500 mt-1">총 {appointments.length}건의 예약</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          예약 등록
        </button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <button onClick={() => moveDate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <p className="font-semibold text-gray-900">{formatDate(selectedDate)}</p>
                <p className="text-xs text-gray-400">{dateAppointments.length}건의 예약</p>
              </div>
              <button onClick={() => moveDate(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-400">불러오는 중...</div>
            ) : dateAppointments.length === 0 ? (
              <div className="text-center py-12">
                <Calendar size={36} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-400 text-sm">이 날짜에 예약이 없습니다.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {dateAppointments.map((a) => (
                  <div key={a.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-sm mt-0.5">
                          {a.patientName[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-gray-900 text-sm">{a.patientName}</p>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                              {APPOINTMENT_TYPE_LABELS[a.type]}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock size={12} /> {a.time} ({a.duration}분)
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <User size={12} /> {a.doctorName}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{a.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={a.status}
                          onChange={(e) => handleStatusChange(a.id, e.target.value as Appointment['status'])}
                          className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${APPOINTMENT_STATUS_COLORS[a.status]}`}
                        >
                          {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{APPOINTMENT_STATUS_LABELS[s]}</option>
                          ))}
                        </select>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">예정된 예약</h3>
            {Object.keys(upcomingByDate).length === 0 ? (
              <p className="text-gray-400 text-xs text-center py-4">예정된 예약이 없습니다.</p>
            ) : (
              <div className="space-y-3">
                {Object.entries(upcomingByDate)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .slice(0, 7)
                  .map(([date, apps]) => (
                    <button
                      key={date}
                      onClick={() => setSelectedDate(date)}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        selectedDate === date ? 'border-blue-300 bg-blue-50' : 'border-gray-100 hover:bg-gray-50'
                      }`}
                    >
                      <p className="text-xs font-semibold text-gray-700">{formatDate(date)}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{apps.length}건</p>
                    </button>
                  ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
            <h3 className="font-semibold text-gray-900 mb-3 text-sm">현황 요약</h3>
            {(['scheduled', 'confirmed', 'completed', 'cancelled'] as Appointment['status'][]).map((s) => {
              const count = appointments.filter((a) => a.status === s).length;
              return (
                <div key={s} className="flex items-center justify-between py-1.5">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${APPOINTMENT_STATUS_COLORS[s]}`}>
                    {APPOINTMENT_STATUS_LABELS[s]}
                  </span>
                  <span className="text-sm font-semibold text-gray-700">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="예약 등록" size="lg">
        <AppointmentForm patients={patients} onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
      </Modal>
    </div>
  );
}
