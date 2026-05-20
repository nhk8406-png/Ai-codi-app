import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateId } from '@/lib/utils';
import { Appointment } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const appointments = date
    ? db.appointments.findByDate(date)
    : db.appointments.findAll();
  return NextResponse.json(
    appointments.sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date().toISOString();
  const appointment: Appointment = {
    id: generateId(),
    ...body,
    status: 'scheduled',
    createdAt: now,
    updatedAt: now,
  };
  const created = db.appointments.create(appointment);
  return NextResponse.json(created, { status: 201 });
}
