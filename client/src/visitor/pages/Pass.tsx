import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { getVisitPass } from '../../shared/services/api';
import type { Visit } from '../../shared/types';
import html2canvas from 'html2canvas';

const STATUS_CONFIG: Record<string, {
  icon: string; label: string; color: string; show: boolean; sub?: string;
}> = {
  PENDING:     { icon: '⏳', label: 'Awaiting Approval', color: '#f59e0b', show: false, sub: 'Your request is being reviewed by the host.' },
  APPROVED:    { icon: '✅', label: 'Approved',           color: '#10b981', show: true  },
  REJECTED:    { icon: '❌', label: 'Rejected',           color: '#ef4444', show: false, sub: 'This visit request was not approved.' },
  CHECKED_IN:  { icon: '🏢', label: 'Checked In',         color: '#818cf8', show: true  },
  CHECKED_OUT: { icon: '👋', label: 'Checked Out',        color: '#94a3b8', show: true  },
};

export default function Pass() {
  const { visitId } = useParams<{ visitId: string }>();
  const nav = useNavigate();
  const passRef = useRef<HTMLDivElement>(null);
  const [visit, setVisit] = useState<Visit | null>(null);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!visitId) {
      setError('No visit ID in URL');
      return;
    }

    console.log('Pass visitId param:', visitId);

    getVisitPass(visitId)
      .then(r => {
        console.log('Pass API response:', r.data);
        setVisit(r.data);
      })
      .catch(e => {
        console.error('Pass fetch error:', e);
        setError('Invalid or expired pass link');
      });
  }, [visitId]);

  const handleDownload = async () => {
    if (!passRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(passRef.current, {
        scale: 2, useCORS: true, backgroundColor: '#fff'
      });
      const link = document.createElement('a');
      link.download = `visitor-pass-${visitId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (_) {}
    setDownloading(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/pass/${visitId}`);
  };

  // Loading
  if (!visit && !error) return (
    <div className="mesh-bg min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
    </div>
  );

  // Error
  if (error) return (
    <div className="mesh-bg min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <p style={{ fontSize: '3rem', marginBottom: '12px' }}>❌</p>
        <p style={{ fontFamily: 'Syne', color: '#ef4444', fontWeight: 700, fontSize: '1.2rem' }}>Pass Not Found</p>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>{error}</p>
        <p style={{ color: '#334155', fontSize: '11px', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
          ID: {visitId}
        </p>
        <button onClick={() => nav('/')} className="btn-primary mt-6 px-6 py-3 text-sm">← Go Home</button>
      </div>
    </div>
  );

  const cfg = STATUS_CONFIG[visit!.status] || STATUS_CONFIG['PENDING'];

  // Non-pass statuses
  if (!cfg.show) return (
    <div className="mesh-bg min-h-screen flex items-center justify-center p-6">
      <div className="glass rounded-3xl p-8 text-center w-full max-w-sm"
        style={{ border: `1px solid ${cfg.color}30` }}>
        <p style={{ fontSize: '3rem', marginBottom: '12px' }}>{cfg.icon}</p>
        <p style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.3rem', color: cfg.color }}>{cfg.label}</p>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '8px' }}>{cfg.sub}</p>
        {visit!.status === 'PENDING' && (
          <button onClick={() => nav(`/waiting/${visit!.id}`)} className="btn-ghost mt-6 w-full py-3 text-sm">
            Check Status
          </button>
        )}
        <button onClick={() => nav('/')} style={{ display: 'block', marginTop: '10px', width: '100%', padding: '10px', fontSize: '12px', color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
          ← Go Home
        </button>
      </div>
    </div>
  );

  const v = visit!;

  return (
    <div className="mesh-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">

        {/* Pass card */}
        <div ref={passRef} id="visitor-pass" className="rounded-3xl overflow-hidden shadow-2xl fade-up"
          style={{ background: '#fff', boxShadow: '0 25px 60px rgba(0,0,0,0.5)' }}>

          {/* Header */}
          <div style={{ background: 'linear-gradient(135deg, #1e293b, #0f172a)', padding: '24px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(245,158,11,0.15)' }} />
            <div style={{ position: 'absolute', bottom: '-30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(245,158,11,0.08)' }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', position: 'relative' }}>
              <div>
                <p style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', marginBottom: '6px' }}>VISITOR PASS</p>
                <h2 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  {v.visitor.name}
                </h2>
                <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>{v.visitor.organizationName}</p>
              </div>
              {v.visitor.photoBase64 && (
                <img src={v.visitor.photoBase64} alt="visitor"
                  style={{ width: '56px', height: '56px', borderRadius: '12px', objectFit: 'cover', border: '2px solid rgba(245,158,11,0.4)' }} />
              )}
            </div>
          </div>

          {/* Details grid */}
          <div style={{ padding: '20px', background: '#fff' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              {[
                ['Visiting',    v.host?.name || 'N/A'],
                ['Department',  v.department],
                ['Purpose',     v.reason],
                ['Phone',       v.visitor.phone],
                ['Date',        new Date(v.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
                ['Status',      v.status],
              ].map(([label, value]) => (
                <div key={label} style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 12px' }}>
                  <p style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'Syne, sans-serif', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '3px' }}>
                    {label?.toUpperCase()}
                  </p>
                  <p style={{ fontSize: '12px', color: label === 'Status' ? cfg.color : '#1e293b', fontWeight: 600, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>

            {/* QR */}
            <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <QRCodeSVG value={v.qrValue || v.visitId} size={80} />
              <div>
                <p style={{ fontSize: '10px', color: '#94a3b8', fontFamily: 'Syne, sans-serif', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '4px' }}>
                  SCAN TO VERIFY
                </p>
                <p style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '10px', color: '#64748b', wordBreak: 'break-all', margin: 0 }}>
                  {v.visitId}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '16px' }} className="fade-up-2">
          <button onClick={() => window.print()} className="btn-ghost py-3 text-sm">🖨️ Print</button>
          <button onClick={handleDownload} disabled={downloading} className="btn-primary py-3 text-sm">
            {downloading ? 'Saving...' : '⬇️ Download'}
          </button>
          <button onClick={handleCopyLink} className="btn-ghost py-3 text-sm">🔗 Copy Link</button>
          <button onClick={() => nav('/')} className="btn-ghost py-3 text-sm">🏠 Home</button>
        </div>

      </div>
    </div>
  );
}
