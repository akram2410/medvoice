import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const fields = [
  { id: 'firstName', label: 'First name', placeholder: 'Jane', required: true },
  { id: 'lastName', label: 'Last name', placeholder: 'Smith', required: true },
  { id: 'phone', label: 'Phone', placeholder: '+1 (780) 555-0000' },
  { id: 'healthCard', label: 'Health card #', placeholder: '1234-567-890', required: true },
  { id: 'allergies', label: 'Allergies', placeholder: 'Penicillin, or None known' },
  { id: 'emergContact', label: 'Emergency contact', placeholder: 'Name · Relationship · Phone' },
];

export function RegisterPatientPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<Record<string, string>>({
    firstName: '', lastName: '', dateOfBirth: '', gender: 'Female',
    bloodType: 'Unknown', healthCard: '', phone: '', allergies: 'None known',
    conditions: '', emergContact: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.dateOfBirth || !form.healthCard) {
      setError('First name, last name, date of birth, and health card are required.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { patient } = await api.createPatient(form);
      navigate(`/patients/${patient.id}`);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <button onClick={() => navigate('/patients')} className="text-teal-700 text-sm mb-2 flex items-center gap-1">← Patients</button>
        <h1 className="text-2xl font-semibold text-gray-900">Register patient</h1>
        <p className="text-gray-400 text-sm mt-1">Add a new patient to your records</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-xl">
        <div className="card p-6">
          <div className="grid grid-cols-2 gap-4">
            {fields.map(f => (
              <div key={f.id} className={f.id === 'allergies' || f.id === 'emergContact' ? 'col-span-2' : ''}>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  {f.label}{f.required && ' *'}
                </label>
                <input
                  className="input"
                  placeholder={f.placeholder}
                  value={form[f.id] || ''}
                  onChange={e => update(f.id, e.target.value)}
                  required={f.required}
                />
              </div>
            ))}

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Date of birth *</label>
              <input type="date" className="input" value={form.dateOfBirth} onChange={e => update('dateOfBirth', e.target.value)} required />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Gender</label>
              <select className="input" value={form.gender} onChange={e => update('gender', e.target.value)}>
                {['Female', 'Male', 'Non-binary', 'Prefer not to say'].map(g => <option key={g}>{g}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Blood type</label>
              <select className="input" value={form.bloodType} onChange={e => update('bloodType', e.target.value)}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(b => <option key={b}>{b}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Known conditions</label>
              <textarea
                className="input resize-none"
                rows={2}
                placeholder="e.g. Type 2 Diabetes, Hypertension"
                value={form.conditions}
                onChange={e => update('conditions', e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

          <button type="submit" className="btn-primary w-full mt-5" disabled={loading}>
            {loading ? 'Registering...' : 'Register patient'}
          </button>
        </div>
      </form>
    </div>
  );
}
