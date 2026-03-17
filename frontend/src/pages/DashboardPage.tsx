import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../store/auth';
import { api } from '../lib/api';
import { Visit } from '../types';

export function DashboardPage() {
  const { doctor } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);

  useEffect(() => {
    api.getVisits().then(d => setVisits(d.visits)).catch(console.error);
  }, []);

  const today = new Date().toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const todayStr = new Date().toISOString().split('T')[0];
  const todayVisits = visits.filter(v => v.date.startsWith(todayStr));
  const unsigned = visits.filter(v => v.status === 'DRAFT');

  return (
    <div className="p-8">
      <div className="mb-7">
        <h1 className="text-2xl font-semibold text-gray-900">Good morning, Dr. {doctor?.lastName}</h1>
        <p className="text-gray-400 text-sm mt-1">{today}</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { label: "Today's visits", val: todayVisits.length, sub: 'Completed today' },
          { label: 'Awaiting sign-off', val: unsigned.length, sub: unsigned.length ? 'Action needed' : 'All clear', warn: unsigned.length > 0 },
          { label: 'Total reports', val: visits.length, sub: 'In your records' },
        ].map(m => (
          <div key={m.label} className="card p-5">
            <div className="text-3xl font-semibold text-gray-900">{m.val}</div>
            <div className="text-xs text-gray-400 mt-1.5">{m.label}</div>
            <div className={`text-xs font-medium mt-1.5 ${m.warn ? 'text-amber-600' : 'text-teal-600'}`}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        <Link to="/visits/new" className="card p-4 hover:border-teal-200 transition-colors cursor-pointer block">
          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C0392B" strokeWidth="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            </svg>
          </div>
          <div className="text-sm font-semibold text-gray-900">Start visit</div>
          <div className="text-xs text-gray-400 mt-0.5">Voice → AI report</div>
        </Link>
        <Link to="/patients" className="card p-4 hover:border-teal-200 transition-colors cursor-pointer block">
          <div className="w-9 h-9 rounded-lg bg-teal-50 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0A5F48" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
            </svg>
          </div>
          <div className="text-sm font-semibold text-gray-900">Patients</div>
          <div className="text-xs text-gray-400 mt-0.5">View all records</div>
        </Link>
        <Link to="/reports" className="card p-4 hover:border-teal-200 transition-colors cursor-pointer block">
          <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#B7600A" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
            </svg>
          </div>
          <div className="text-sm font-semibold text-gray-900">Reports</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {unsigned.length ? `${unsigned.length} need sign-off` : 'All signed'}
          </div>
        </Link>
      </div>

      {/* Recent activity */}
      <div className="card">
        <div className="px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900">Recent activity</h3>
        </div>
        {visits.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No visits yet. Start a visit to see activity here.</div>
        ) : (
          visits.slice(0, 8).map(v => (
            <Link to={`/visits/${v.id}`} key={v.id} className="flex items-start gap-3 px-5 py-3.5 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${v.status === 'SIGNED' ? 'bg-green-500' : 'bg-amber-400'}`} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900">{v.patient?.firstName} {v.patient?.lastName} — {v.report?.diagnosis || 'Visit'}</div>
                <div className="text-xs text-gray-400 mt-0.5">{new Date(v.date).toLocaleDateString()}</div>
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
