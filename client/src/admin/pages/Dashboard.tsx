import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVisits, approveVisit, rejectVisit } from '../../shared/services/api';
import { useAuth } from '../context/AuthContext';
import type { Visit } from '../../shared/types';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  APPROVED:    { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  REJECTED:    { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
  CHECKED_IN:  { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
  CHECKED_OUT: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
};

export default function Dashboard() {
  const nav = useNavigate();
  const { user } = useAuth();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');

  const load = async () => {
    try { const r = await getVisits(); setVisits(r.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id: number) => { await approveVisit(id); load(); };
  const handleReject  = async (id: number) => { await rejectVisit(id);  load(); };

  const filters = ['ALL', 'PENDING', 'APPROVED', 'CHECKED_IN', 'CHECKED_OUT', 'REJECTED'];
  const filtered = filter === 'ALL' ? visits : visits.filter(v => v.status === filter);
  const pendingCount = visits.filter(v => v.status === 'PENDING').length;

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: '#f1f5f9', margin: 0 }}>
            {user?.role === 'HOST' ? `${user.name}'s Requests` : 'All Requests'}
          </h1>
          <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono', margin: '4px 0 0' }}>
            {visits.length} TOTAL · {pendingCount} PENDING
          </p>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '5px 12px', borderRadius: '999px', fontSize: '10px', cursor: 'pointer',
              fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.04em',
              background: filter === f ? '#f59e0b' : 'rgba(255,255,255,0.04)',
              color: filter === f ? '#000' : '#64748b',
              border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)',
              transition: 'all 0.15s'
            }}>{f}</button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</p>
            <p style={{ fontSize: '13px' }}>No visits found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(v => {
              const ss = STATUS_STYLE[v.status] || STATUS_STYLE['PENDING'];
              return (
                <div key={v.id} className="glass" style={{ borderRadius: '16px', padding: '14px', display: 'flex', gap: '12px' }}>
                  {v.visitor?.photoBase64 && (
                    <img src={v.visitor.photoBase64} alt=""
                      style={{ width: '52px', height: '52px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '6px', marginBottom: '4px' }}>
                      <div style={{ minWidth: 0 }}>
                        <h3 style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: '#f1f5f9', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {v.visitor?.name}
                        </h3>
                        <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0', fontFamily: 'JetBrains Mono' }}>
                          {v.visitor?.phone} · {v.visitor?.organizationName}
                        </p>
                      </div>
                      <span style={{ fontSize: '9px', fontFamily: 'Syne', fontWeight: 700, letterSpacing: '0.06em', padding: '3px 8px', borderRadius: '999px', background: ss.bg, color: ss.color, whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {v.status}
                      </span>
                    </div>

                    {/* Host name */}
                    <p style={{ fontSize: '11px', margin: '0 0 2px' }}>
                      <span style={{ color: '#475569' }}>→ </span>
                      <span style={{ color: '#f59e0b', fontWeight: 600 }}>{v.host?.name}</span>
                      <span style={{ color: '#475569' }}> · {v.department}</span>
                    </p>
                    <p style={{ fontSize: '11px', color: '#475569', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.reason}</p>
                    <p style={{ fontSize: '10px', color: '#334155', fontFamily: 'JetBrains Mono', margin: '0 0 8px' }}>
                      {new Date(v.createdAt).toLocaleString()}
                    </p>

                    {v.status === 'PENDING' && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => handleApprove(v.id)}
                          style={{ padding: '6px 14px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981', borderRadius: '10px', fontSize: '12px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.25)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.15)')}>
                          ✓ Approve
                        </button>
                        <button onClick={() => handleReject(v.id)}
                          style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '10px', fontSize: '12px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>
                          ✕ Reject
                        </button>
                      </div>
                    )}
                    {v.status === 'APPROVED' && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <button onClick={() => nav(`/pass/${v.visitId}`)}
                          style={{ padding: '6px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', borderRadius: '10px', fontSize: '12px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}>
                          View Pass →
                        </button>
                        <button onClick={() => navigator.clipboard.writeText(`${window.location.origin}/pass/${v.visitId}`)}
                          style={{ padding: '6px 14px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', borderRadius: '10px', fontSize: '12px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}>
                          Copy Link
                        </button>
                      </div>
                    )}
                    {(v.status === 'CHECKED_IN' || v.status === 'CHECKED_OUT') && (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => nav(`/pass/${v.visitId}`)}
                          style={{ padding: '6px 14px', background: 'rgba(100,116,139,0.1)', border: '1px solid rgba(100,116,139,0.2)', color: '#94a3b8', borderRadius: '10px', fontSize: '12px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}>
                          View Pass
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
