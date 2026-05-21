'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import { MedicalRecord, Patient } from '@/types';
import { formatDate, calculateAge } from '@/lib/utils';

function CertificateContent() {
  const searchParams = useSearchParams();
  const recordId = searchParams.get('id');
  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [certNo] = useState(() => `CERT-${Date.now().toString().slice(-8)}`);

  useEffect(() => {
    if (!recordId) return;
    fetch(`/api/records/${recordId}`)
      .then((r) => r.json())
      .then((rec) => {
        setRecord(rec);
        fetch(`/api/patients/${rec.patientId}`).then((r) => r.json()).then(setPatient);
      });
  }, [recordId]);

  useEffect(() => {
    if (record && patient) setTimeout(() => window.print(), 500);
  }, [record, patient]);

  if (!record || !patient) {
    return <div className="flex items-center justify-center min-h-screen text-gray-400">불러오는 중...</div>;
  }

  const issueDate = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="certificate-page">
      <style>{`
        @media print {
          body { margin: 0; }
          .no-print { display: none !important; }
          .certificate-page { padding: 20mm; font-family: 'Malgun Gothic', sans-serif; }
        }
        .certificate-page { max-width: 210mm; margin: 0 auto; padding: 40px; color: #111; }
      `}</style>

      <div className="no-print mb-6 flex justify-end">
        <button onClick={() => window.print()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
          인쇄하기
        </button>
      </div>

      <div className="border-2 border-gray-800 p-10 min-h-[240mm]">
        {/* 상단 */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-[0.5em] mb-2">진 단 서</h1>
          <p className="text-sm text-gray-500">증명서 번호: {certNo}</p>
        </div>

        {/* 환자 정보 */}
        <table className="w-full border-collapse mb-8 text-sm">
          <tbody>
            <tr className="border border-gray-400">
              <td className="bg-gray-50 px-4 py-3 font-semibold w-28 border-r border-gray-400">성 명</td>
              <td className="px-4 py-3 w-48">{patient.name}</td>
              <td className="bg-gray-50 px-4 py-3 font-semibold w-28 border-l border-r border-gray-400">생년월일</td>
              <td className="px-4 py-3">{formatDate(patient.birthDate)} ({calculateAge(patient.birthDate)}세)</td>
            </tr>
            <tr className="border border-gray-400">
              <td className="bg-gray-50 px-4 py-3 font-semibold border-r border-gray-400">성 별</td>
              <td className="px-4 py-3">{patient.gender === 'male' ? '남성' : patient.gender === 'female' ? '여성' : '기타'}</td>
              <td className="bg-gray-50 px-4 py-3 font-semibold border-l border-r border-gray-400">보험번호</td>
              <td className="px-4 py-3">{patient.insuranceNumber || '-'}</td>
            </tr>
            <tr className="border border-gray-400">
              <td className="bg-gray-50 px-4 py-3 font-semibold border-r border-gray-400">주 소</td>
              <td className="px-4 py-3" colSpan={3}>{patient.address || '-'}</td>
            </tr>
          </tbody>
        </table>

        {/* 진단 내용 */}
        <table className="w-full border-collapse mb-8 text-sm">
          <tbody>
            <tr className="border border-gray-400">
              <td className="bg-gray-50 px-4 py-3 font-semibold w-28 border-r border-gray-400">병 명</td>
              <td className="px-4 py-3">
                {record.diagnosis}
                {record.diagnosisCode && <span className="ml-2 text-gray-500 font-mono text-xs">({record.diagnosisCode})</span>}
              </td>
            </tr>
            <tr className="border border-gray-400">
              <td className="bg-gray-50 px-4 py-3 font-semibold border-r border-gray-400">발병일</td>
              <td className="px-4 py-3">{formatDate(record.visitDate)} 경</td>
            </tr>
            <tr className="border border-gray-400">
              <td className="bg-gray-50 px-4 py-3 font-semibold border-r border-gray-400">진료일</td>
              <td className="px-4 py-3">{formatDate(record.visitDate)}</td>
            </tr>
            <tr className="border border-gray-400">
              <td className="bg-gray-50 px-4 py-3 font-semibold border-r border-gray-400 align-top">주요 증상</td>
              <td className="px-4 py-3 whitespace-pre-wrap">{record.chiefComplaint}{record.symptoms ? `\n${record.symptoms}` : ''}</td>
            </tr>
            <tr className="border border-gray-400">
              <td className="bg-gray-50 px-4 py-3 font-semibold border-r border-gray-400 align-top">치료 내용</td>
              <td className="px-4 py-3 whitespace-pre-wrap">{record.treatment}</td>
            </tr>
            {record.prescription && (
              <tr className="border border-gray-400">
                <td className="bg-gray-50 px-4 py-3 font-semibold border-r border-gray-400 align-top">처 방</td>
                <td className="px-4 py-3 whitespace-pre-wrap">{record.prescription}</td>
              </tr>
            )}
            {record.followUpDate && (
              <tr className="border border-gray-400">
                <td className="bg-gray-50 px-4 py-3 font-semibold border-r border-gray-400">추적 관찰</td>
                <td className="px-4 py-3">{formatDate(record.followUpDate)} 재진 예정</td>
              </tr>
            )}
            <tr className="border border-gray-400">
              <td className="bg-gray-50 px-4 py-3 font-semibold border-r border-gray-400 align-top">소 견</td>
              <td className="px-4 py-3 min-h-[60px]">{record.notes || '위 환자는 상기 질환으로 진료하였음을 확인합니다.'}</td>
            </tr>
          </tbody>
        </table>

        {/* 용도 */}
        <div className="border border-gray-400 px-4 py-3 mb-10 text-sm">
          <span className="font-semibold">사용 목적: </span>
          <span className="ml-2">보험 청구용 □ &nbsp; 제출용 □ &nbsp; 기타 □</span>
        </div>

        {/* 발급일 및 서명 */}
        <div className="text-center">
          <p className="text-base mb-8">위와 같이 진단합니다.</p>
          <p className="text-base font-medium mb-6">{issueDate}</p>
          <div className="flex justify-center gap-16">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">의료기관명</p>
              <p className="font-semibold">MediRecord 의원</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-1">담당 의사</p>
              <p className="font-semibold">{record.doctorName}</p>
              <div className="border-b border-gray-800 w-24 mt-8 mx-auto mb-1" />
              <p className="text-xs text-gray-400">서명 또는 날인</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CertificatePage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen text-gray-400">불러오는 중...</div>}>
      <CertificateContent />
    </Suspense>
  );
}
