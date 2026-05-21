import { db } from '@/lib/db';
import { formatDate, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS } from '@/lib/utils';
import { Users, FileText, Calendar, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const patients = db.patients.findAll();
  const records = db.records.findAll();
  const appointments = db.appointments.findAll();

  const today = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === today);
  const upcomingAppointments = appointments
    .filter((a) => a.date >= today && a.status === 'scheduled')
    .slice(0, 5);

  const recentRecords = records.slice(0, 5);

  // 최근 6개월 월별 진료 통계
  const monthlyStats = Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (11 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const label = `${d.getMonth() + 1}월`;
    const count = records.filter((r) => r.visitDate.startsWith(key)).length;
    return { label, count, key };
  });
  const maxCount = Math.max(...monthlyStats.map((m) => m.count), 1);

  const stats = [
    { label: '총 환자 수', value: patients.length, icon: Users, color: 'bg-blue-500', href: '/patients' },
    { label: '진료 기록', value: records.length, icon: FileText, color: 'bg-green-500', href: '/records' },
    { label: '오늘 예약', value: todayAppointments.length, icon: Calendar, color: 'bg-purple-500', href: '/appointments' },
    { label: '이번 달 진료', value: records.filter((r) => r.visitDate.startsWith(today.slice(0, 7))).length, icon: TrendingUp, color: 'bg-orange-500', href: '/records' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
        <p className="text-gray-500 text-sm mt-1">{formatDate(today)} 기준</p>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-8">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link key={label} href={href} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
              </div>
              <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                <Icon size={22} className="text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">오늘 예약</h2>
            <Link href="/appointments" className="text-blue-600 text-sm hover:underline">전체 보기</Link>
          </div>
          {todayAppointments.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">오늘 예약이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {todayAppointments.map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{a.patientName}</p>
                    <p className="text-xs text-gray-500">{a.time} · {a.reason}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${APPOINTMENT_STATUS_COLORS[a.status]}`}>
                    {APPOINTMENT_STATUS_LABELS[a.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">최근 진료 기록</h2>
            <Link href="/records" className="text-blue-600 text-sm hover:underline">전체 보기</Link>
          </div>
          {recentRecords.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">진료 기록이 없습니다.</p>
          ) : (
            <div className="space-y-3">
              {recentRecords.map((r) => (
                <div key={r.id} className="py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-900">{r.patientName}</p>
                    <p className="text-xs text-gray-500">{formatDate(r.visitDate)}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{r.diagnosis}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 월별 진료 통계 */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
        <h2 className="font-semibold text-gray-900 mb-4">월별 진료 현황 (최근 12개월)</h2>
        <div className="flex items-end gap-3 h-32">
          {monthlyStats.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-xs font-semibold text-gray-600">{m.count > 0 ? m.count : ''}</span>
              <div className="w-full relative flex items-end" style={{ height: '88px' }}>
                <div
                  className="w-full bg-blue-500 rounded-t-md transition-all"
                  style={{ height: `${Math.max((m.count / maxCount) * 88, m.count > 0 ? 8 : 2)}px`, opacity: m.count === 0 ? 0.2 : 1 }}
                />
              </div>
              <span className="text-xs text-gray-400">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      {upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">예정된 예약</h2>
            <Link href="/appointments" className="text-blue-600 text-sm hover:underline">전체 보기</Link>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {upcomingAppointments.map((a) => (
              <div key={a.id} className="border border-gray-100 rounded-lg p-4">
                <p className="font-medium text-sm text-gray-900">{a.patientName}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(a.date)} {a.time}</p>
                <p className="text-xs text-gray-400 mt-0.5">{a.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
