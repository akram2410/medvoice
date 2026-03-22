import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Doctor
  const password = await bcrypt.hash('password123', 12);
  const doctor = await prisma.doctor.upsert({
    where: { email: 'dr.smith@medvoice.com' },
    update: {},
    create: {
      email: 'dr.smith@medvoice.com',
      password,
      firstName: 'Sarah',
      lastName: 'Smith',
      specialty: 'Family Medicine',
      licenseNo: 'MD-100001',
    },
  });

  // Patients
  const patients = await Promise.all([
    prisma.patient.upsert({
      where: { healthCard: 'HC-001-2024' },
      update: {},
      create: {
        firstName: 'James',
        lastName: 'Carter',
        dateOfBirth: new Date('1978-04-12'),
        gender: 'Male',
        bloodType: 'A+',
        healthCard: 'HC-001-2024',
        phone: '416-555-0101',
        allergies: 'Penicillin',
        conditions: 'Hypertension, Type 2 Diabetes',
        emergContact: 'Mary Carter (wife) 416-555-0102',
      },
    }),
    prisma.patient.upsert({
      where: { healthCard: 'HC-002-2024' },
      update: {},
      create: {
        firstName: 'Linda',
        lastName: 'Nguyen',
        dateOfBirth: new Date('1990-09-23'),
        gender: 'Female',
        bloodType: 'O-',
        healthCard: 'HC-002-2024',
        phone: '647-555-0203',
        allergies: 'Sulfa drugs, Latex',
        conditions: 'Asthma',
        emergContact: 'Tom Nguyen (husband) 647-555-0204',
      },
    }),
    prisma.patient.upsert({
      where: { healthCard: 'HC-003-2024' },
      update: {},
      create: {
        firstName: 'Robert',
        lastName: 'Okafor',
        dateOfBirth: new Date('1955-01-30'),
        gender: 'Male',
        bloodType: 'B+',
        healthCard: 'HC-003-2024',
        phone: '905-555-0305',
        allergies: 'None known',
        conditions: 'COPD, Osteoarthritis',
        emergContact: 'Grace Okafor (daughter) 905-555-0306',
      },
    }),
  ]);

  // Visits + Reports
  const visit1 = await prisma.visit.create({
    data: {
      patientId: patients[0].id,
      doctorId: doctor.id,
      rawNote: 'Patient presents with elevated blood pressure 158/95. Reports headache and fatigue for 3 days. Currently on Metformin 500mg BID. No chest pain or shortness of breath.',
      status: 'SIGNED',
      signedAt: new Date('2026-03-10T10:30:00Z'),
      report: {
        create: {
          diagnosis: 'Uncontrolled Hypertension',
          summary: 'Patient with known hypertension presenting with elevated BP and associated headache requiring medication adjustment.',
          chiefComplaint: 'Elevated blood pressure with headache and fatigue for 3 days.',
          historyOfPresentIllness: 'Mr. Carter is a 47-year-old male with a history of hypertension and type 2 diabetes who presents with a 3-day history of headache and fatigue. BP measured at 158/95 mmHg today. He denies chest pain, shortness of breath, or visual changes.',
          physicalExamination: 'BP 158/95 mmHg, HR 78 bpm, RR 16, Temp 36.8°C. Alert and oriented. No papilledema. Cardiovascular: regular rate and rhythm, no murmurs. Lungs clear to auscultation.',
          assessment: 'Uncontrolled hypertension in the setting of known diabetes. Likely poor medication adherence contributing to current presentation.',
          plan: 'Increase Amlodipine from 5mg to 10mg daily. Continue Metformin 500mg BID. Low-sodium diet counseling provided. Follow-up in 2 weeks for BP recheck. Emergency return if BP exceeds 180/110 or symptoms worsen.',
        },
      },
    },
  });

  const visit2 = await prisma.visit.create({
    data: {
      patientId: patients[1].id,
      doctorId: doctor.id,
      rawNote: 'Linda comes in with worsening shortness of breath and wheezing for 2 days. Using rescue inhaler more than usual, about 4 times per day. No fever. Peak flow 65% of personal best.',
      status: 'DRAFT',
      report: {
        create: {
          diagnosis: 'Acute Asthma Exacerbation',
          summary: 'Patient with known asthma presenting with moderate exacerbation requiring step-up therapy.',
          chiefComplaint: 'Worsening shortness of breath and wheezing for 2 days.',
          historyOfPresentIllness: 'Ms. Nguyen is a 35-year-old female with known asthma presenting with a 2-day history of worsening dyspnea and wheezing. She reports using her salbutamol rescue inhaler approximately 4 times daily. No fever, productive cough, or sick contacts. Peak flow measured at 65% of personal best.',
          physicalExamination: 'SpO2 96% on room air, RR 22, HR 92, Temp 37.0°C. Mild accessory muscle use. Bilateral expiratory wheezing on auscultation. No crackles.',
          assessment: 'Moderate acute asthma exacerbation. Likely triggered by seasonal allergens given current pollen count. No signs of infection.',
          plan: 'Salbutamol nebulization 2.5mg q20min x3 in office. Start oral Prednisone 40mg daily x5 days. Step up to Fluticasone/Salmeterol 250/25 combination inhaler BID. Peak flow diary to be maintained. Return in 48 hours or sooner if no improvement.',
        },
      },
    },
  });

  await prisma.auditLog.createMany({
    data: [
      { doctorId: doctor.id, visitId: visit1.id, action: 'VISIT_CREATED' },
      { doctorId: doctor.id, visitId: visit1.id, action: 'REPORT_SIGNED', details: { signedAt: new Date('2026-03-10T10:30:00Z').toISOString() } },
      { doctorId: doctor.id, visitId: visit2.id, action: 'VISIT_CREATED' },
    ],
  });

  console.log('Seed complete.');
  console.log('Login: dr.smith@medvoice.com / password123');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
