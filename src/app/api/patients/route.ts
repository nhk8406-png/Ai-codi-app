import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { Patient } from '@/types';

export async function GET() {
  const patients = db.patients.findAll();
  return NextResponse.json(patients.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date().toISOString();
  const patient: Patient = {
    id: generateId(),
    ...body,
    createdAt: now,
    updatedAt: now,
  };
  const created = db.patients.create(patient);
  return NextResponse.json(created, { status: 201 });
}
