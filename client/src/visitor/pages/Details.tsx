import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createVisit, getHosts } from '../../shared/services/api';
import type { Host } from '../../shared/types';

export default function Details() {
  const nav = useNavigate();
  const phone = localStorage.getItem('vms_phone') || '';
  const photo = localStorage.getItem('vms_photo') || '';
  const returning = (() => {
    try { return JSON.parse(localStorage.getItem('vms_returning_visitor') || 'null'); } catch { return null; }
  })();

  const [profile, setProfile] = useState({
    name:             returning?.name             || '',
    organizationName: returning?.organizationName || '',
    idProofNumber:    returning?.idProofNumber    || '',
    vehicleNumber:    returning?.vehicleNumber    || '',
  });
  const [visit, setVisit] = useState({ hostId: '', department: '', reason: '' });
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getHosts().then(r => setHosts(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    if (!profile.name || !profile.organizationName || !visit.hostId || !visit.department || !visit.reason)
      return setError('Please fill all required fields');
    setLoading(true); setError('');
    try {
      const res = await createVisit({
        phone,
        photoBase64: photo,
        name: profile.name,
        organizationName: profile.organizationName,
        idProofNumber: profile.idProofNumber,
        vehicleNumber: profile.vehicleNumber,
        hostId: parseInt(visit.hostId),
        department: visit.department,
        reason: visit.reason,
      });
      localStorage.removeItem('vms_photo');
      localStorage.removeItem('vms_returning_visitor');
      nav(`/waiting/${res.data.id}`);
    } catch { setError('Submission failed. Try again.'); }
    setLoading(false);
  };

  return (
    <div className="mesh-bg min-h-screen p-6">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      <div className="relative w-full max-w-sm mx-auto py-6">
        <button onClick={() => nav('/photo')} className="flex items-center gap-2 text-sm mb-6"
          style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>

        <div className="mb-6 fade-up">
          <div style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', marginBottom: '6px' }}>STEP 3 OF 3</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.75rem', fontWeight: 800 }} className="text-white">Visit details</h2>
          {returning && <p style={{ color: '#10b981', fontSize: '12px', marginTop: '4px' }}>Profile pre-filled — update if needed</p>}
        </div>

        {/* Visitor profile */}
        <div className="glass rounded-2xl p-5 mb-4 fade-up-2">
          <p style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em', marginBottom: '12px' }}>VISITOR PROFILE</p>
          {[
            { key: 'name',             label: 'Full Name',      placeholder: 'John Doe',   required: true },
            { key: 'organizationName', label: 'Organization',   placeholder: 'Acme Corp',  required: true },
            { key: 'idProofNumber',    label: 'ID Proof',       placeholder: 'Optional',   required: false },
            { key: 'vehicleNumber',    label: 'Vehicle Number', placeholder: 'Optional',   required: false },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '12px' }}>
              <label className="block mb-1.5 uppercase" style={{ fontSize: '11px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em' }}>
                {f.label} {!f.required && <span style={{ color: '#334155' }}>(opt)</span>}
              </label>
              <input value={(profile as any)[f.key]}
                onChange={e => setProfile(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder} className="input-field" />
            </div>
          ))}
          <div>
            <label className="block mb-1.5 uppercase" style={{ fontSize: '11px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em' }}>Phone</label>
            <input value={phone} disabled className="input-field" />
          </div>
        </div>

        {/* Visit details */}
        <div className="glass rounded-2xl p-5 mb-4 fade-up-3">
          <p style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em', marginBottom: '12px' }}>THIS VISIT</p>

          {/* Host dropdown */}
          <div style={{ marginBottom: '12px' }}>
            <label className="block mb-1.5 uppercase" style={{ fontSize: '11px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em' }}>Person to Visit *</label>
            <select
              value={visit.hostId}
              onChange={e => setVisit(v => ({ ...v, hostId: e.target.value }))}
              className="input-field"
              style={{ cursor: 'pointer' }}
            >
              <option value="" disabled>Select a person...</option>
              {hosts.map(h => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>

          {[
            { key: 'department', label: 'Department', placeholder: 'Engineering' },
            { key: 'reason',     label: 'Purpose',    placeholder: 'Meeting / Interview' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '12px' }}>
              <label className="block mb-1.5 uppercase" style={{ fontSize: '11px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em' }}>{f.label} *</label>
              <input value={(visit as any)[f.key]}
                onChange={e => setVisit(v => ({ ...v, [f.key]: e.target.value }))}
                placeholder={f.placeholder} className="input-field" />
            </div>
          ))}
        </div>

        {error && <div className="rounded-xl p-3 text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-4 text-sm mb-8">
          {loading ? 'Submitting...' : 'Submit Visit Request →'}
        </button>
      </div>
    </div>
  );
}
