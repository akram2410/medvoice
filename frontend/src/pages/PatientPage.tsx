import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Patient } from '../types';

function age(dob: string) {
  const b = new Date(dob), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

export function PatientPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [patient, setPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (id) api.getPatient(id).then(d => setPatient(d.patient)).catch(console.error);
  }, [id]);

  if (!patient) return <div className="p-8 text-gray-400">Loading...</div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={() => navigate('/patients')} className="text-teal-700 text-sm mb-2 flex items-center gap-1">← Patients</button>
          <h1 className="text-2xl font-semibold">{patient.firstName} {patient.lastName}</h1>
        </div>
        <Link to={`/visits/new?patientId=${patient.id}`} className="btn-primary">+ New visit</Link>
      </div>

      <div className="card p-6 mb-5 flex gap-5 items-start">
        <div className="w-14 h-14 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center text-lg font-semibold flex-shrink-0">
          {patient.firstName[0]}{patient.lastName[0]}
        </div>
        <div className="flex-1">
          <div className="text-lg font-semibold">{patient.firstName} {patient.lastName}</div>
          <div className="text-sm text-gray-400 mt-1">DOB: {new Date(patient.dateOfBirth).toLocaleDateString()} · {age(patient.dateOfBirth)} yrs · {patient.gender}</div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span className="badge bg-teal-50 text-teal-700">{patient.bloodType}</span>
            <span className={`badge ${patient.allergies === 'None known' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>
              Allergy: {patient.allergies}
            </span>
            <span className="badge bg-gray-100 text-gray-600">{patient.healthCard}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[['Phone', patient.phone||'—'], ['Emergency contact', patient.emergContact||'—'], ['Conditions', patient.conditions]].map(([l,v]) => (
          <div key={l} className="card p-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide">{l}</div>
            <div className="text-sm font-medium text-gray-900 mt-1.5">{v}</div>
          </div>
        ))}
      </div>

      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Visit history</div>
      <div className="card">
        {(patient.visits||[]).length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No visits yet</div>
        ) : (
          patient.visits!.map(v => (
            <Link to={`/visits/${v.id}`} key={v.id} className="flex items-center gap-3 px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${v.status === 'SIGNED' ? 'bg-green-500' : 'bg-amber-400'}`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{v.report?.diagnosis || 'Visit'}</div>
                <div className="text-xs text-gray-400 mt-0.5">{new Date(v.date).toLocaleDateString()}</div>
                <div className="text-xs text-gray-500 mt-1 truncate max-w-lg">{v.report?.summary}</div>
              </div>
              <span className={`badge ${v.status === 'SIGNED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                {v.status === 'SIGNED' ? 'Signed' : 'Draft'}
              </span>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
