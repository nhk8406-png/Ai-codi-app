import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { MedicalRecord } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');
  const records = patientId
    ? db.records.findByPatient(patientId)
    : db.records.findAll();
  return NextResponse.json(records.sort((a, b) => b.visitDate.localeCompare(a.visitDate)));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date().toISOString();
  const record: MedicalRecord = {
    id: generateId(),
    ...body,
    createdAt: now,
    updatedAt: now,
  };
  const created = db.records.create(record);
  return NextResponse.json(created, { status: 201 });
}
