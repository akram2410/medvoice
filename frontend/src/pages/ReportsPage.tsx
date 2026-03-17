import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Visit } from '../types';

type Filter = 'all' | 'draft' | 'signed' | 'today';

export function ReportsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getReports({ status: filter === 'all' || filter === 'today' ? undefined : filter.toUpperCase() })
      .then(d => setVisits(d.reports))
      .catch(console.error);
  }, [filter]);

  const todayStr = new Date().toISOString().split('T')[0];
  const filtered = visits.filter(v => {
    if (filter === 'today' && !v.date.startsWith(todayStr)) return false;
    if (!search) return true;
    const hay = `${v.patient?.firstName} ${v.patient?.lastName} ${v.report?.diagnosis} ${v.report?.summary}`.toLowerCase();
    return hay.includes(search.toLowerCase());
  });

  // Group by patient
  const groups: Record<string, { name: string; visits: Visit[] }> = {};
  filtered.forEach(v => {
    const pid = v.patientId;
    if (!groups[pid]) groups[pid] = { name: `${v.patient?.firstName} ${v.patient?.lastName}`, visits: [] };
    groups[pid].visits.push(v);
  });
  const sorted = Object.entries(groups).sort((a, b) => a[1].name.localeCompare(b[1].name));

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Reports</h1>
        <p className="text-gray-400 text-sm mt-1">{filtered.length} report{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <input
          className="input max-w-xs"
          placeholder="Search reports..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(['all', 'draft', 'signed', 'today'] as Filter[]).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm">No reports match your filter</div>
      ) : (
        sorted.map(([pid, group]) => (
          <div key={pid} className="mb-6">
            <div className="flex items-center gap-3 mb-2 pb-2 border-b border-gray-100">
              <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold">
                {group.name.split(' ').map(n => n[0]).join('')}
              </div>
              <span className="text-sm font-semibold text-gray-900">{group.name}</span>
              {group.visits.some(v => v.status === 'DRAFT') && (
                <span className="badge bg-amber-50 text-amber-700">
                  {group.visits.filter(v => v.status === 'DRAFT').length} draft
                </span>
              )}
              <span className="badge bg-gray-100 text-gray-500 ml-auto">
                {group.visits.length} report{group.visits.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="space-y-2">
              {group.visits.map(v => (
                <Link
                  to={`/visits/${v.id}`}
                  key={v.id}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-teal-200 hover:bg-teal-50/30 transition-colors"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${v.status === 'SIGNED' ? 'bg-green-500' : 'bg-amber-400'}`} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{v.report?.diagnosis || 'Visit report'}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(v.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="text-xs text-gray-500 mt-1 truncate">{v.report?.summary}</div>
                  </div>
                  <span className={`badge flex-shrink-0 ${v.status === 'SIGNED' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                    {v.status === 'SIGNED' ? 'Signed' : 'Draft'}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
