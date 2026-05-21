import { db } from '@/lib/db';
import { formatDate, calculateAge, GENDER_LABELS, APPOINTMENT_STATUS_LABELS, APPOINTMENT_STATUS_COLORS, APPOINTMENT_TYPE_LABELS } from '@/lib/utils';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, MapPin, Heart, AlertTriangle, FileText, Calendar, Clock } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function PatientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = db.patients.findById(id);
  if (!patient) notFound();

  const records = db.records.findByPatient(id).sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  const appointments = db.appointments.findAll()
    .filter((a) => a.patientId === id)
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));

  const upcomingAppointments = appointments.filter(
    (a) => a.date >= new Date().toISOString().split('T')[0] && a.status !== 'cancelled'
  );

  return (
    <div className="p-8 max-w-5xl">
      <Link href="/patients" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft size={16} /> 환자 목록으로
      </Link>

      {/* 환자 기본 정보 */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-start gap-5">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold shrink-0">
            {patient.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {GENDER_LABELS[patient.gender]}
              </span>
            </div>
            <p className="text-gray-500 text-sm">{formatDate(patient.birthDate)} · {calculateAge(patient.birthDate)}세</p>

            <div className="grid grid-cols-2 gap-x-8 gap-y-2 mt-4">
              <InfoRow icon={<Phone size={14} />} label="전화" value={patient.phone} />
              {patient.email && <InfoRow icon={<Mail size={14} />} label="이메일" value={patient.email} />}
              {patient.address && <InfoRow icon={<MapPin size={14} />} label="주소" value={patient.address} />}
              {patient.bloodType && <InfoRow icon={<Heart size={14} />} label="혈액형" value={`${patient.bloodType}형`} />}
              {patient.insuranceNumber && <InfoRow icon={<User size={14} />} label="보험번호" value={patient.insuranceNumber} />}
            </div>

            <div className="flex gap-4 mt-4">
              {patient.chronicDiseases && patient.chronicDiseases.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1.5">기저 질환</p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.chronicDiseases.map((d) => (
                      <span key={d} className="text-xs px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full">{d}</span>
                    ))}
                  </div>
                </div>
              )}
              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 mb-1.5 flex items-center gap-1">
                    <AlertTriangle size={11} className="text-red-400" /> 알레르기
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {patient.allergies.map((a) => (
                      <span key={a} className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full">{a}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 shrink-0">
            <div className="text-center bg-blue-50 rounded-xl p-3 min-w-16">
              <p className="text-2xl font-bold text-blue-600">{records.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">진료 기록</p>
            </div>
            <div className="text-center bg-purple-50 rounded-xl p-3 min-w-16">
              <p className="text-2xl font-bold text-purple-600">{upcomingAppointments.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">예정 예약</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* 진료 기록 */}
        <div className="col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={16} className="text-green-500" /> 진료 기록
            </h2>
            <Link href="/records" className="text-blue-600 text-sm hover:underline">+ 기록 작성</Link>
          </div>

          {records.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
              진료 기록이 없습니다.
            </div>
          ) : (
            <div className="space-y-3">
              {records.map((r) => (
                <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{r.diagnosis}</p>
                      {r.diagnosisCode && (
                        <span className="text-xs text-blue-600 font-mono">{r.diagnosisCode}</span>
                      )}
                    </div>
                    <span className="text-sm text-gray-400 shrink-0 ml-4">{formatDate(r.visitDate)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <MiniInfo label="주요 증상" value={r.chiefComplaint} />
                    <MiniInfo label="치료" value={r.treatment} />
                    {r.prescription && <MiniInfo label="처방" value={r.prescription} />}
                    {r.notes && <MiniInfo label="특이 사항" value={r.notes} />}
                  </div>
                  {r.followUpDate && (
                    <p className="text-xs text-purple-600 mt-2">
                      재진 예정: {formatDate(r.followUpDate)}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 예약 이력 */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={16} className="text-purple-500" /> 예약 이력
            </h2>
            <Link href="/appointments" className="text-blue-600 text-sm hover:underline">+ 예약</Link>
          </div>

          {appointments.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm">
              예약 이력이 없습니다.
            </div>
          ) : (
            <div className="space-y-2">
              {appointments.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {APPOINTMENT_TYPE_LABELS[a.type]}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${APPOINTMENT_STATUS_COLORS[a.status]}`}>
                      {APPOINTMENT_STATUS_LABELS[a.status]}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-800 mt-1">{a.reason}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                    <Clock size={11} /> {formatDate(a.date)} {a.time}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-gray-400">{icon}</span>
      <span className="text-gray-400 text-xs">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function MiniInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm text-gray-700 leading-snug">{value}</p>
    </div>
  );
}
