export interface Patient {
  id: string;
  name: string;
  birthDate: string;
  gender: 'male' | 'female' | 'other';
  phone: string;
  email?: string;
  address?: string;
  bloodType?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  insuranceNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string;
  chiefComplaint: string;
  symptoms: string;
  diagnosis: string;
  diagnosisCode?: string;
  treatment: string;
  prescription?: string;
  notes?: string;
  doctorName: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  date: string;
  time: string;
  duration: number;
  type: 'initial' | 'followup' | 'checkup' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'noshow';
  reason: string;
  doctorName: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AppointmentType = Appointment['type'];
export type AppointmentStatus = Appointment['status'];
