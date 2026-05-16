import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getVisitStatus } from '../../shared/services/api';

export default function Waiting() {
  const { id } = useParams<{ id: string }>();
  const nav = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [status, setStatus] = useState<string>('PENDING');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const poll = async () => {
      try {
        setError('');
        const response = await getVisitStatus(parseInt(id)); // ← parseInt
        console.log('Visit status response:', response.data);
        const { status: currentStatus, visitId } = response.data; // ← .data

        setStatus(currentStatus);

        if (currentStatus === 'APPROVED' && visitId) {
          if (intervalRef.current) clearInterval(intervalRef.current);
          console.log('Redirecting to pass:', visitId);
          nav(`/pass/${visitId}`, { replace: true });
          return;
        }

        if (currentStatus === 'REJECTED') {
          if (intervalRef.current) clearInterval(intervalRef.current);
          return;
        }
      } catch (err) {
        console.error('Polling failed:', err);
        setError('Could not reach server. Check your connection.');
      }
    };

    poll();
    intervalRef.current = setInterval(poll, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [id, nav]);

  const STATUS_CONFIG: Record<string, { icon: string; label: string; sub: string; color: string; bg: string; border: string }> = {
    PENDING:     { icon: '⏳', label: 'Waiting for Approval',  sub: 'Your request has been submitted. The host will review it shortly.', color: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.2)'  },
    APPROVED:    { icon: '✅', label: 'Approved!',             sub: 'Redirecting to your pass...',                                        color: '#10b981', bg: 'rgba(16,185,129,0.08)', border: 'rgba(16,185,129,0.2)' },
    REJECTED:    { icon: '❌', label: 'Request Rejected',      sub: 'Please contact the front desk for more information.',                color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.2)'  },
    CHECKED_IN:  { icon: '🏢', label: 'Checked In',            sub: 'Entry has been recorded.',                                          color: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)' },
    CHECKED_OUT: { icon: '👋', label: 'Visit Complete',         sub: 'Thank you for visiting.',                                           color: '#94a3b8', bg: 'rgba(100,116,139,0.08)',border: 'rgba(100,116,139,0.2)'},
  };

  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['PENDING'];

  return (
    <div className="mesh-bg min-h-screen flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-sm">
        <div className="glass rounded-3xl p-8 text-center fade-up"
          style={{ border: `1px solid ${cfg.border}`, background: cfg.bg }}>

          <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>{cfg.icon}</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.4rem', fontWeight: 800, color: cfg.color, margin: '0 0 8px' }}>
            {cfg.label}
          </h2>
          <p style={{ color: '#64748b', fontSize: '13px', lineHeight: 1.6 }}>{cfg.sub}</p>

          {error && (
            <div style={{ marginTop: '16px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '12px' }}>
              {error}
            </div>
          )}

          {status === 'PENDING' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
              <div className="w-4 h-4 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
              <span style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono' }}>CHECKING EVERY 3s</span>
            </div>
          )}
        </div>

        <button onClick={() => nav('/')}
          style={{ display: 'block', width: '100%', marginTop: '12px', padding: '12px', fontSize: '12px', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
          onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>
          ← Return to Home
        </button>
      </div>
    </div>
  );
}
