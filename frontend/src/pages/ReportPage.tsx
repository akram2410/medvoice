import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Visit } from '../types';

const SECTIONS: [string, string][] = [
  ['chiefComplaint', 'Chief Complaint'],
  ['historyOfPresentIllness', 'History of Present Illness'],
  ['physicalExamination', 'Physical Examination'],
  ['assessment', 'Assessment'],
  ['plan', 'Plan'],
];

export function ReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [signing, setSigning] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    // Load via visits endpoint — find the right visit
    api.getVisits().then(d => {
      const v = d.visits.find((x: Visit) => x.id === id);
      if (v) {
        setVisit(v);
        const e: Record<string, string> = {};
        SECTIONS.forEach(([k]) => { e[k] = (v.report as any)?.[k] || ''; });
        setEdits(e);
      }
    });
  }, [id]);

  async function saveDraft() {
    if (!id) return;
    setSaving(true);
    try {
      await api.updateReport(id, edits);
      setMsg('Draft saved');
      setTimeout(() => setMsg(''), 2500);
    } catch (err: any) {
      setMsg(err.message);
    } finally { setSaving(false); }
  }

  async function deleteDraft() {
    if (!id) return;
    setDeleting(true);
    try {
      await api.deleteVisit(id);
      navigate(patient ? `/patients/${patient.id}` : '/reports');
    } catch (err: any) {
      setMsg(err.message);
      setDeleting(false);
    }
  }

  async function signReport() {
    if (!id) return;
    setSigning(true);
    try {
      await api.updateReport(id, edits);
      await api.signReport(id);
      setVisit(v => v ? { ...v, status: 'SIGNED', signedAt: new Date().toISOString() } : v);
      setMsg('Report signed and locked');
    } catch (err: any) {
      setMsg(err.message);
    } finally { setSigning(false); }
  }

  if (!visit) return <div className="p-8 text-gray-400">Loading...</div>;

  const signed = visit.status === 'SIGNED';
  const patient = visit.patient;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <button
            onClick={() => patient ? navigate(`/patients/${patient.id}`) : navigate('/reports')}
            className="text-teal-700 text-sm mb-2 flex items-center gap-1"
          >
            ← Back
          </button>
          <h1 className="text-2xl font-semibold text-gray-900">{visit.report?.diagnosis || 'Clinical Report'}</h1>
          <div className="text-sm text-gray-400 mt-1">
            {patient?.firstName} {patient?.lastName} · {new Date(visit.date).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`badge text-sm py-1 px-3 ${signed ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {signed ? '✓ Signed' : 'Draft'}
          </span>
          {!signed && (
            <button onClick={saveDraft} disabled={saving} className="btn-secondary">
              {saving ? 'Saving...' : 'Save draft'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Report fields */}
        <div className="col-span-2 card p-6 space-y-5">
          {SECTIONS.map(([key, label]) => (
            <div key={key}>
              <div className="text-xs font-semibold text-teal-700 uppercase tracking-wider mb-2 pb-1.5 border-b border-teal-100">
                {label}
              </div>
              {signed ? (
                <p className="text-sm text-gray-700 leading-relaxed">{(visit.report as any)?.[key] || '—'}</p>
              ) : (
                <textarea
                  className="input resize-none"
                  rows={key === 'historyOfPresentIllness' || key === 'plan' ? 4 : 3}
                  value={edits[key] || ''}
                  onChange={e => setEdits(prev => ({ ...prev, [key]: e.target.value }))}
                />
              )}
            </div>
          ))}
        </div>

        {/* Sign panel + patient info */}
        <div className="space-y-4">
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Physician sign-off</h3>
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-teal-700 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                RP
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-900">Dr. R. Patel</div>
                <div className="text-xs text-gray-400">General Practice</div>
              </div>
            </div>

            {signed ? (
              <div className="flex items-center gap-2 bg-green-50 text-green-700 rounded-lg px-4 py-3 text-sm font-medium">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Signed {visit.signedAt ? new Date(visit.signedAt).toLocaleDateString() : ''}
              </div>
            ) : (
              <>
                <button
                  onClick={signReport}
                  disabled={signing}
                  className="btn-primary w-full mb-2"
                >
                  {signing ? 'Signing...' : 'Sign & lock report'}
                </button>
                <button onClick={saveDraft} disabled={saving} className="btn-secondary w-full">
                  {saving ? 'Saving...' : 'Save as draft'}
                </button>
                <div className="border-t border-gray-100 mt-3 pt-3">
                  {confirmDelete ? (
                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 text-center">Delete this draft permanently?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmDelete(false)}
                          className="btn-secondary flex-1 text-xs py-1.5"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={deleteDraft}
                          disabled={deleting}
                          className="flex-1 text-xs py-1.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="w-full text-xs text-red-500 hover:text-red-700 py-1.5"
                    >
                      Delete draft
                    </button>
                  )}
                </div>
              </>
            )}

            {msg && (
              <p className={`text-xs text-center mt-3 ${msg.includes('igned') ? 'text-green-600' : 'text-gray-500'}`}>
                {msg}
              </p>
            )}
          </div>

          {patient && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient</h3>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {patient.firstName[0]}{patient.lastName[0]}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                  <div className="text-xs text-gray-400">{patient.gender}</div>
                </div>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div><span className="font-medium text-gray-700">Blood type:</span> {patient.bloodType}</div>
                <div>
                  <span className="font-medium text-gray-700">Allergies:</span>{' '}
                  <span className={patient.allergies !== 'None known' ? 'text-red-600' : ''}>{patient.allergies}</span>
                </div>
                <div><span className="font-medium text-gray-700">Conditions:</span> {patient.conditions}</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
