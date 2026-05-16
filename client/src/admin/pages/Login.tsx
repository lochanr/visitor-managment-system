import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const nav = useNavigate();
  const { login, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (user) { nav('/admin/dashboard', { replace: true }); return null; }

  const handleLogin = async () => {
    if (!email || !password) return setError('Enter email and password');
    setLoading(true); setError('');
    try {
      await login(email, password);
      nav('/admin/dashboard', { replace: true });
    } catch {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="mesh-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-10 fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', marginBottom: '16px', boxShadow: '0 0 30px rgba(245,158,11,0.3)' }}>
            🛡️
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.6rem', color: '#f1f5f9', margin: 0 }}>Admin Portal</h1>
          <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Sign in to manage visitors</p>
        </div>

        <div className="glass rounded-2xl p-6 fade-up-2">
          <div style={{ marginBottom: '14px' }}>
            <label className="block mb-2 uppercase" style={{ fontSize: '11px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="owner@test.com" className="input-field"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label className="block mb-2 uppercase" style={{ fontSize: '11px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              placeholder="••••••••" className="input-field"
            />
          </div>

          {error && (
            <div className="rounded-xl p-3 text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
              {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading} className="btn-primary w-full py-4 text-sm">
            {loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </div>

        {/* Dev hint */}
        <div className="glass rounded-xl p-4 mt-4 fade-up-3" style={{ border: '1px solid rgba(245,158,11,0.15)' }}>
          <p style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'JetBrains Mono', marginBottom: '6px' }}>DEV CREDENTIALS</p>
          {[
            ['OWNER',    'owner@test.com',    'owner123'],
            ['ADMIN',    'admin@test.com',    'admin123'],
            ['SECURITY', 'security@test.com', 'security123'],
          ].map(([role, em, pw]) => (
            <div key={role} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px', cursor: 'pointer' }}
              onClick={() => { setEmail(em); setPassword(pw); }}>
              <span style={{ color: '#475569', fontFamily: 'JetBrains Mono' }}>{role}</span>
              <span style={{ color: '#64748b', fontFamily: 'JetBrains Mono' }}>{em}</span>
            </div>
          ))}
          <p style={{ fontSize: '10px', color: '#334155', marginTop: '6px' }}>Click a row to auto-fill</p>
        </div>

        <button onClick={() => nav('/')} className="w-full py-3 mt-3 text-sm text-center"
          style={{ color: '#334155', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
          onMouseLeave={e => (e.currentTarget.style.color = '#334155')}>
          ← Back to Visitor Portal
        </button>
      </div>
    </div>
  );
}
