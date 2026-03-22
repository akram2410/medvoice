import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { api } from '../lib/api';

export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', licenseNo: '', specialty: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) => setForm(f => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.register(form);
      await login(form.email, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-teal-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-teal-400 flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-white">MedVoice</h1>
          <p className="text-white/50 text-sm mt-1">Clinical documentation platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-semibold text-gray-900 mb-5">Create account</h2>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">First name</label>
                <input type="text" className="input" value={form.firstName} onChange={set('firstName')} placeholder="Jane" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Last name</label>
                <input type="text" className="input" value={form.lastName} onChange={set('lastName')} placeholder="Smith" required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Email</label>
              <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="doctor@clinic.com" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Password</label>
              <input type="password" className="input" value={form.password} onChange={set('password')} placeholder="••••••••" required minLength={8} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">License number</label>
              <input type="text" className="input" value={form.licenseNo} onChange={set('licenseNo')} placeholder="MD-123456" required />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1.5">Specialty <span className="text-gray-400">(optional)</span></label>
              <input type="text" className="input" value={form.specialty} onChange={set('specialty')} placeholder="e.g. Family Medicine" />
            </div>
          </div>

          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}

          <button type="submit" className="btn-primary w-full mt-5" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="text-center text-xs text-gray-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-600 font-medium hover:underline">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
