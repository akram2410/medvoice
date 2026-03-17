import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { Patient } from '../types';

const SAMPLES = [
  "68-year-old male with 3-day history of worsening shortness of breath, bilateral ankle swelling and productive cough. History of congestive heart failure. Bilateral basal crackles, JVD, pitting oedema to knees. Weight up 4 pounds. BP 155/95, HR 88, O2 sat 94 on room air. Increase furosemide to 80mg daily, fluid restrict 1.5L, follow up 48 hours.",
  "45-year-old female with 2-week right knee pain worse on stairs, no trauma. Mild effusion, positive McMurray. Minimal medial joint space narrowing on X-ray. Likely medial meniscus tear. Refer orthopaedics, physio, naproxen 500mg BD PRN.",
  "32-year-old male 5-day sore throat, fever 38.8, difficulty swallowing. Tonsillar exudate, cervical lymphadenopathy. Rapid strep positive. Amoxicillin 500mg TID 10 days.",
];

export function NewVisitPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('patientId');

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [ptSearch, setPtSearch] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isRec, setIsRec] = useState(false);
  const [sampleIdx, setSampleIdx] = useState(0);

  const recognitionRef = useRef<any>(null);
  const finalRef = useRef('');

  useEffect(() => {
    api.getPatients().then(d => {
      setPatients(d.patients);
      if (preselectedId) {
        const p = d.patients.find((x: Patient) => x.id === preselectedId);
        if (p) setSelectedPatient(p);
      }
    });
  }, [preselectedId]);

  const filteredPts = patients.filter(p =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(ptSearch.toLowerCase())
  );

  function toggleRec() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { setError('Speech recognition not supported in this browser. Please type your note.'); return; }

    if (isRec) {
      recognitionRef.current?.stop();
      setIsRec(false);
      return;
    }

    const r = new SR();
    r.continuous = true;
    r.interimResults = true;
    r.lang = 'en-CA';
    finalRef.current = note;

    r.onresult = (e: any) => {
      let interim = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) finalRef.current += e.results[i][0].transcript + ' ';
        else interim = e.results[i][0].transcript;
      }
      setNote(finalRef.current + interim);
    };
    r.onerror = () => setIsRec(false);
    r.onend = () => { if (isRec) r.start(); };

    recognitionRef.current = r;
    r.start();
    setIsRec(true);
  }

  async function handleSubmit() {
    if (!note.trim()) { setError('Please enter or dictate a clinical note.'); return; }
    if (!selectedPatient) { setError('Please select a patient.'); return; }
    setError('');
    setLoading(true);
    try {
      const { visit } = await api.createVisit({ patientId: selectedPatient.id, rawNote: note });
      navigate(`/visits/${visit.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">New visit</h1>
        <p className="text-gray-400 text-sm mt-1">Dictate or type your clinical note — AI will generate a SOAP report</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-5">

          {/* Patient selector */}
          <div className="card p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Patient</h3>
            {selectedPatient ? (
              <div className="flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">
                <div className="w-8 h-8 rounded-full bg-teal-200 text-teal-800 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                  {selectedPatient.firstName[0]}{selectedPatient.lastName[0]}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-teal-900">{selectedPatient.firstName} {selectedPatient.lastName}</div>
                  <div className="text-xs text-teal-600">{selectedPatient.conditions.split(',')[0].trim()}</div>
                </div>
                <button onClick={() => setSelectedPatient(null)} className="text-xs text-teal-600 hover:text-teal-800">Change</button>
              </div>
            ) : (
              <>
                <input
                  className="input mb-2"
                  placeholder="Search patients..."
                  value={ptSearch}
                  onChange={e => setPtSearch(e.target.value)}
                />
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {filteredPts.slice(0, 6).map(p => (
                    <button
                      key={p.id}
                      onClick={() => { setSelectedPatient(p); setPtSearch(''); }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-left transition-colors"
                    >
                      <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                        {p.firstName[0]}{p.lastName[0]}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{p.firstName} {p.lastName}</div>
                        <div className="text-xs text-gray-400">{p.conditions.split(',')[0].trim()}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Voice + Note */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-900">Clinical note</h3>
              <button
                onClick={() => { setSampleIdx(i => i + 1); setNote(SAMPLES[sampleIdx % SAMPLES.length]); }}
                className="text-xs text-teal-700 underline"
              >
                Fill sample
              </button>
            </div>

            <button
              onClick={toggleRec}
              className={`w-full flex items-center justify-center gap-3 py-3 rounded-lg border text-sm font-medium mb-4 transition-colors ${
                isRec
                  ? 'bg-red-500 border-red-500 text-white animate-pulse'
                  : 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/>
              </svg>
              {isRec ? 'Listening — click to stop' : 'Click to start dictating'}
            </button>

            <textarea
              className="input resize-none"
              rows={8}
              placeholder="Transcribed speech appears here, or type your note directly..."
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="text-xs text-gray-400 mt-1.5 text-right">{note.length} characters</div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            className="btn-primary w-full py-3 text-base"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Generating report with AI...
              </span>
            ) : '✦ Generate clinical report'}
          </button>
        </div>

        {/* How it works */}
        <div className="card p-5 h-fit">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">How it works</h3>
          <div className="space-y-4">
            {[
              ['Select patient', 'Link the visit to their record'],
              ['Dictate your note', 'Speak naturally — clinical shorthand works'],
              ['AI generates SOAP report', 'Structured, complete, ready to review'],
              ['Edit & sign', 'Locks to the permanent patient record'],
            ].map(([title, desc], i) => (
              <div key={i} className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{title}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
