'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { MedicalRecord, Patient } from '@/types';
import { formatDate } from '@/lib/utils';

function PrintContent() {
  const searchParams = useSearchParams();
  const recordId = searchParams.get('id');
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (!recordId) return;
    Promise.all([
      fetch(`/api/records/${recordId}`).then((r) => r.json()),
    ]).then(([rec]) => {
      setRecord(rec);
      fetch(`/api/patients/${rec.patientId}`).then((r) => r.json()).then(setPatient);
    });
  }, [recordId]);

  useEffect(() => {
    if (record && patient) {
      setTimeout(() => window.print(), 500);
    }
  }, [record, patient]);

  if (!record || !patient) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">불러오는 중...</div>;
  }

  return (
    <div className="print-page">
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .print-page { padding: 20mm; font-family: 'Malgun Gothic', sans-serif; }
        }
        .print-page { max-width: 210mm; margin: 0 auto; padding: 40px; font-size: 14px; color: #111; }
      `}</style>

      {/* 헤더 */}
      <div className="no-print mb-6 flex justify-end">
        <button
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          인쇄하기
        </button>
      </div>

      {/* 진료 기록지 */}
      <div className="border-2 border-gray-800 p-8">
        <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
          <h1 className="text-2xl font-bold tracking-widest">진 료 기 록 지</h1>
          <p className="text-sm text-gray-500 mt-1">MediRecord 의료기록 자동화 시스템</p>
        </div>

        {/* 환자 정보 */}
        <div className="border border-gray-300 mb-6">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
            <h2 className="font-bold text-sm">환자 정보</h2>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-300">
            <Cell label="성명" value={patient.name} />
            <Cell label="생년월일" value={formatDate(patient.birthDate)} />
            <Cell label="보험번호" value={patient.insuranceNumber || '-'} />
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-300 border-t border-gray-300">
            <Cell label="성별" value={patient.gender === 'male' ? '남성' : patient.gender === 'female' ? '여성' : '기타'} />
            <Cell label="혈액형" value={patient.bloodType ? `${patient.bloodType}형` : '-'} />
            <Cell label="전화번호" value={patient.phone} />
          </div>
          {(patient.allergies?.length || patient.chronicDiseases?.length) ? (
            <div className="grid grid-cols-2 divide-x divide-gray-300 border-t border-gray-300">
              <Cell label="알레르기" value={patient.allergies?.join(', ') || '없음'} />
              <Cell label="기저 질환" value={patient.chronicDiseases?.join(', ') || '없음'} />
            </div>
          ) : null}
        </div>

        {/* 진료 정보 */}
        <div className="border border-gray-300 mb-6">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-300">
            <h2 className="font-bold text-sm">진료 내용</h2>
          </div>
          <div className="grid grid-cols-3 divide-x divide-gray-300">
            <Cell label="진료일" value={formatDate(record.visitDate)} />
            <Cell label="담당 의사" value={`${record.doctorName} 의사`} />
            <Cell label="재진 예정일" value={record.followUpDate ? formatDate(record.followUpDate) : '-'} />
          </div>
          <div className="border-t border-gray-300">
            <LargeCell label="주요 증상 (Chief Complaint)" value={record.chiefComplaint} />
          </div>
          <div className="border-t border-gray-300">
            <LargeCell label="상세 증상" value={record.symptoms} />
          </div>
          <div className="grid grid-cols-2 divide-x divide-gray-300 border-t border-gray-300">
            <LargeCell label="진단명" value={record.diagnosis} />
            <Cell label="진단 코드 (ICD-10)" value={record.diagnosisCode || '-'} />
          </div>
          <div className="border-t border-gray-300">
            <LargeCell label="치료 내용" value={record.treatment} />
          </div>
          {record.prescription && (
            <div className="border-t border-gray-300">
              <LargeCell label="처방" value={record.prescription} />
            </div>
          )}
          {record.notes && (
            <div className="border-t border-gray-300">
              <LargeCell label="특이 사항" value={record.notes} />
            </div>
          )}
        </div>

        {/* 서명 */}
        <div className="flex justify-end mt-8">
          <div className="text-center">
            <p className="text-sm">담당 의사</p>
            <p className="font-semibold mt-1">{record.doctorName}</p>
            <div className="border-b border-gray-800 w-32 mt-8 mb-1" />
            <p className="text-xs text-gray-500">서명</p>
          </div>
        </div>

        <p className="text-xs text-gray-400 text-center mt-4">
          발행일: {new Date().toLocaleDateString('ko-KR')} · MediRecord 의료기록 자동화 시스템
        </p>
      </div>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-2.5">
      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

function LargeCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-4 py-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm whitespace-pre-wrap min-h-[2rem]">{value}</p>
    </div>
  );
}

export default function PrintPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">불러오는 중...</div>}>
      <PrintContent />
    </Suspense>
  );
}
