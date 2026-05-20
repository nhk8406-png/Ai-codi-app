import fs from 'fs';
import path from 'path';
import { Patient, MedicalRecord, Appointment } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');

function readJSON<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(filePath, '[]');
    return [];
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function writeJSON<T>(filename: string, data: T[]): void {
  const filePath = path.join(DATA_DIR, filename);
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const db = {
  patients: {
    findAll: (): Patient[] => readJSON<Patient>('patients.json'),
    findById: (id: string): Patient | undefined =>
      readJSON<Patient>('patients.json').find((p) => p.id === id),
    create: (patient: Patient): Patient => {
      const patients = readJSON<Patient>('patients.json');
      patients.push(patient);
      writeJSON('patients.json', patients);
      return patient;
    },
    update: (id: string, data: Partial<Patient>): Patient | null => {
      const patients = readJSON<Patient>('patients.json');
      const idx = patients.findIndex((p) => p.id === id);
      if (idx === -1) return null;
      patients[idx] = { ...patients[idx], ...data, updatedAt: new Date().toISOString() };
      writeJSON('patients.json', patients);
      return patients[idx];
    },
    delete: (id: string): boolean => {
      const patients = readJSON<Patient>('patients.json');
      const filtered = patients.filter((p) => p.id !== id);
      if (filtered.length === patients.length) return false;
      writeJSON('patients.json', filtered);
      return true;
    },
  },

  records: {
    findAll: (): MedicalRecord[] => readJSON<MedicalRecord>('records.json'),
    findById: (id: string): MedicalRecord | undefined =>
      readJSON<MedicalRecord>('records.json').find((r) => r.id === id),
    findByPatient: (patientId: string): MedicalRecord[] =>
      readJSON<MedicalRecord>('records.json').filter((r) => r.patientId === patientId),
    create: (record: MedicalRecord): MedicalRecord => {
      const records = readJSON<MedicalRecord>('records.json');
      records.push(record);
      writeJSON('records.json', records);
      return record;
    },
    update: (id: string, data: Partial<MedicalRecord>): MedicalRecord | null => {
      const records = readJSON<MedicalRecord>('records.json');
      const idx = records.findIndex((r) => r.id === id);
      if (idx === -1) return null;
      records[idx] = { ...records[idx], ...data, updatedAt: new Date().toISOString() };
      writeJSON('records.json', records);
      return records[idx];
    },
    delete: (id: string): boolean => {
      const records = readJSON<MedicalRecord>('records.json');
      const filtered = records.filter((r) => r.id !== id);
      if (filtered.length === records.length) return false;
      writeJSON('records.json', filtered);
      return true;
    },
  },

  appointments: {
    findAll: (): Appointment[] => readJSON<Appointment>('appointments.json'),
    findById: (id: string): Appointment | undefined =>
      readJSON<Appointment>('appointments.json').find((a) => a.id === id),
    findByDate: (date: string): Appointment[] =>
      readJSON<Appointment>('appointments.json').filter((a) => a.date === date),
    create: (appointment: Appointment): Appointment => {
      const appointments = readJSON<Appointment>('appointments.json');
      appointments.push(appointment);
      writeJSON('appointments.json', appointments);
      return appointment;
    },
    update: (id: string, data: Partial<Appointment>): Appointment | null => {
      const appointments = readJSON<Appointment>('appointments.json');
      const idx = appointments.findIndex((a) => a.id === id);
      if (idx === -1) return null;
      appointments[idx] = { ...appointments[idx], ...data, updatedAt: new Date().toISOString() };
      writeJSON('appointments.json', appointments);
      return appointments[idx];
    },
    delete: (id: string): boolean => {
      const appointments = readJSON<Appointment>('appointments.json');
      const filtered = appointments.filter((a) => a.id !== id);
      if (filtered.length === appointments.length) return false;
      writeJSON('appointments.json', filtered);
      return true;
    },
  },
};
