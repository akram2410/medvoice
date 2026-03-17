export interface Doctor {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  specialty: string;
  licenseNo: string;
}

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  healthCard: string;
  phone?: string;
  allergies: string;
  conditions: string;
  emergContact?: string;
  _count?: { visits: number };
  visits?: Visit[];
}

export interface Report {
  id: string;
  visitId: string;
  diagnosis: string;
  summary: string;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  physicalExamination: string;
  assessment: string;
  plan: string;
}

export interface Visit {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  rawNote: string;
  status: 'DRAFT' | 'SIGNED';
  signedAt?: string;
  report?: Report;
  patient?: Patient;
}
