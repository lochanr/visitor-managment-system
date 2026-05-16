import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getVisits } from '../../shared/services/api';
import type { Visit } from '../../shared/types';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  PENDING:     { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  APPROVED:    { bg: 'rgba(16,185,129,0.15)',  color: '#10b981' },
  REJECTED:    { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444' },
  CHECKED_IN:  { bg: 'rgba(99,102,241,0.15)',  color: '#818cf8' },
  CHECKED_OUT: { bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
};

export default function History() {
  const nav = useNavigate();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getVisits()
      .then(r => setVisits(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = visits.filter(v =>
    v.visitor?.name?.toLowerCase().includes(search.toLowerCase()) ||
    v.visitor?.phone?.includes(search) ||
    v.visitor?.organizationName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '480px' }}>

        <div style={{ marginBottom: '20px' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: '#f1f5f9', margin: 0 }}>
            Visit History
          </h1>
          <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono', margin: '4px 0 0' }}>
            {visits.length} TOTAL VISITS
          </p>
        </div>

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone, or organization..."
          className="input-field"
          style={{ marginBottom: '16px' }}
        />

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#475569' }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</p>
            <p style={{ fontSize: '13px' }}>No records found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {filtered.map(v => {
              const ss = STATUS_STYLE[v.status] || STATUS_STYLE['PENDING'];
              const canViewPass = ['APPROVED', 'CHECKED_IN', 'CHECKED_OUT'].includes(v.status);
              return (
                <div key={v.id} className="glass" style={{ borderRadius: '14px', padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  {v.visitor?.photoBase64 && (
                    <img src={v.visitor.photoBase64} alt=""
                      style={{ width: '40px', height: '40px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(255,255,255,0.08)' }} />
                  )}

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '13px', color: '#f1f5f9' }}>
                        {v.visitor?.name}
                      </span>
                      <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'JetBrains Mono' }}>
                        {v.visitor?.phone}
                      </span>
                    </div>
                    <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      → <span style={{ color: '#f59e0b' }}>{v.host?.name}</span> · {v.department}
                    </p>
                    <p style={{ fontSize: '11px', color: '#475569', margin: '1px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.reason}
                    </p>
                    <p style={{ fontSize: '10px', color: '#334155', fontFamily: 'JetBrains Mono', margin: '4px 0 0' }}>
                      {new Date(v.createdAt).toLocaleString()}
                    </p>

                    {/* View Pass + Copy Link */}
                    {canViewPass && (
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => nav(`/pass/${v.visitId}`)}
                          style={{ padding: '5px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', borderRadius: '8px', fontSize: '11px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.1)')}>
                          View Pass →
                        </button>
                        <button
                          onClick={() => navigator.clipboard.writeText(`${window.location.origin}/pass/${v.visitId}`)}
                          style={{ padding: '5px 12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', borderRadius: '8px', fontSize: '11px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.2)')}
                          onMouseLeave={e => (e.currentTarget.style.background = 'rgba(99,102,241,0.1)')}>
                          Copy Link
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Status badge */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <span style={{ fontSize: '9px', fontFamily: 'Syne', fontWeight: 700, padding: '3px 8px', borderRadius: '999px', background: ss.bg, color: ss.color, display: 'block', marginBottom: '4px', whiteSpace: 'nowrap' }}>
                      {v.status}
                    </span>
                    <span style={{ fontSize: '10px', color: '#334155', fontFamily: 'JetBrains Mono' }}>
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
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
