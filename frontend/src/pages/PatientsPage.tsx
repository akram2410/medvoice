import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Patient } from '../types';

function age(dob: string) {
  const b = new Date(dob), n = new Date();
  let a = n.getFullYear() - b.getFullYear();
  if (n < new Date(n.getFullYear(), b.getMonth(), b.getDate())) a--;
  return a;
}

export function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getPatients(search || undefined).then(d => setPatients(d.patients)).catch(console.error);
  }, [search]);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Patients</h1>
          <p className="text-gray-400 text-sm mt-1">{patients.length} registered patients</p>
        </div>
        <Link to="/patients/register" className="btn-primary">+ Register patient</Link>
      </div>

      <div className="mb-5">
        <input
          className="input max-w-sm"
          placeholder="Search by name or condition..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="card">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Patient','Age / Gender','Conditions','Allergies','Visits'].map(h => (
                <th key={h} className="text-left text-xs font-medium text-gray-400 px-4 py-3 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map(p => (
              <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => window.location.href=`/patients/${p.id}`}>
                <td className="px-4 py-3">
                  <div className="font-medium text-sm text-gray-900">{p.firstName} {p.lastName}</div>
                  <div className="text-xs text-gray-400">{p.healthCard}</div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{age(p.dateOfBirth)} yrs · {p.gender}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.conditions}</td>
                <td className="px-4 py-3">
                  <span className={`badge ${p.allergies === 'None known' ? 'bg-teal-50 text-teal-700' : 'bg-red-50 text-red-700'}`}>{p.allergies}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="badge bg-teal-50 text-teal-700">{p._count?.visits ?? 0}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {patients.length === 0 && <div className="py-10 text-center text-gray-400 text-sm">No patients found</div>}
      </div>
    </div>
  );
}
