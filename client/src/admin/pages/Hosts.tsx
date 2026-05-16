import { useEffect, useState } from 'react';
import {
  getHostUsers, createHostUser, deactivateHost, reactivateHost, resetHostPassword
} from '../../shared/services/api';

interface HostUser {
  id: number;
  name: string;
  email: string;
  role: string;
  mustChangePassword: boolean;
  isActive: boolean;
  createdAt: string;
}

interface TempCredential {
  hostId: number;
  name: string;
  email: string;
  tempPassword: string;
  type: 'created' | 'reset';
}

export default function Hosts() {
  const [hosts, setHosts] = useState<HostUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', email: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [credential, setCredential] = useState<TempCredential | null>(null);
  const [copied, setCopied] = useState(false);

  const load = async () => {
    try { const r = await getHostUsers(); setHosts(r.data); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email) return setError('Name and email are required');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return setError('Invalid email format');
    setCreating(true); setError(''); setCredential(null);
    try {
      const r = await createHostUser(form);
      setCredential({ hostId: r.data.id, name: r.data.name, email: r.data.email, tempPassword: r.data.tempPassword, type: 'created' });
      setForm({ name: '', email: '' });
      load();
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to create host');
    }
    setCreating(false);
  };

  const handleDeactivate = async (host: HostUser) => {
    if (!window.confirm(`Deactivate ${host.name}? They will not be able to login.`)) return;
    try { await deactivateHost(host.id); load(); }
    catch (e: any) { alert(e.response?.data?.error || 'Failed to deactivate'); }
  };

  const handleReactivate = async (host: HostUser) => {
    if (!window.confirm(`Reactivate ${host.name}?`)) return;
    try { await reactivateHost(host.id); load(); }
    catch (e: any) { alert(e.response?.data?.error || 'Failed to reactivate'); }
  };

  const handleResetPassword = async (host: HostUser) => {
    if (!window.confirm(`Reset password for ${host.name}? A new temporary password will be generated.`)) return;
    try {
      const r = await resetHostPassword(host.id);
      setCredential({ hostId: r.data.id, name: r.data.name, email: r.data.email, tempPassword: r.data.tempPassword, type: 'reset' });
      load();
    } catch (e: any) {
      alert(e.response?.data?.error || 'Failed to reset password');
    }
  };

  const handleCopy = () => {
    if (!credential) return;
    navigator.clipboard.writeText(credential.tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '560px' }}>

        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.4rem', color: '#f1f5f9', margin: 0 }}>Manage Hosts</h1>
          <p style={{ fontSize: '11px', color: '#475569', fontFamily: 'JetBrains Mono', margin: '4px 0 0' }}>
            {hosts.filter(h => h.isActive).length} ACTIVE · {hosts.filter(h => !h.isActive).length} INACTIVE
          </p>
        </div>

        {/* Create Host Form */}
        <div className="glass rounded-2xl p-5 mb-4" style={{ border: '1px solid rgba(245,158,11,0.15)' }}>
          <p style={{ fontSize: '10px', color: '#f59e0b', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em', marginBottom: '14px' }}>
            CREATE NEW HOST
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { key: 'name',  label: 'Full Name', placeholder: 'Rahul Kumar',       type: 'text'  },
              { key: 'email', label: 'Email',     placeholder: 'rahul@company.com',  type: 'email' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: '11px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: '5px' }}>
                  {f.label.toUpperCase()}
                </label>
                <input type={f.type} value={(form as any)[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder={f.placeholder} className="input-field" />
              </div>
            ))}
          </div>
          {error && (
            <div style={{ marginTop: '10px', padding: '10px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '12px' }}>
              {error}
            </div>
          )}
          <button onClick={handleCreate} disabled={creating} className="btn-primary w-full py-3 text-sm mt-4">
            {creating ? 'Creating...' : '+ Create Host Account'}
          </button>
        </div>

        {/* Temp Credential Box */}
        {credential && (
          <div style={{ marginBottom: '16px', padding: '16px', borderRadius: '16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)' }}>
            <p style={{ fontSize: '10px', color: '#10b981', fontFamily: 'JetBrains Mono', letterSpacing: '0.08em', marginBottom: '8px' }}>
              {credential.type === 'created' ? '✅ HOST ACCOUNT CREATED' : '🔑 PASSWORD RESET'}
            </p>
            <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '4px' }}>
              <b style={{ color: '#f1f5f9' }}>{credential.name}</b> · {credential.email}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px', padding: '10px 14px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)' }}>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '16px', color: '#f59e0b', flex: 1, letterSpacing: '0.1em' }}>
                {credential.tempPassword}
              </span>
              <button onClick={handleCopy}
                style={{ padding: '6px 14px', background: copied ? 'rgba(16,185,129,0.2)' : 'rgba(245,158,11,0.15)', border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`, color: copied ? '#10b981' : '#f59e0b', borderRadius: '8px', fontSize: '11px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <p style={{ fontSize: '10px', color: '#475569', marginTop: '8px', fontFamily: 'JetBrains Mono' }}>
              ⚠ This password is shown only once. Share it with the host securely.
            </p>
            <button onClick={() => setCredential(null)}
              style={{ marginTop: '8px', fontSize: '11px', color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
              Dismiss
            </button>
          </div>
        )}

        {/* Host List */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto" />
          </div>
        ) : hosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#475569' }}>
            <p style={{ fontSize: '2rem', marginBottom: '8px' }}>👥</p>
            <p style={{ fontSize: '13px' }}>No hosts yet</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {hosts.map(h => (
              <div key={h.id} className="glass" style={{ borderRadius: '14px', padding: '14px 16px', opacity: h.isActive ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '10px' }}>
                  <div>
                    <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '14px', color: '#f1f5f9', margin: 0 }}>{h.name}</p>
                    <p style={{ fontSize: '11px', color: '#64748b', fontFamily: 'JetBrains Mono', margin: '3px 0 0' }}>{h.email}</p>
                    <p style={{ fontSize: '10px', color: '#334155', fontFamily: 'JetBrains Mono', margin: '3px 0 0' }}>
                      Created {new Date(h.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                    <span style={{
                      fontSize: '9px', fontFamily: 'Syne', fontWeight: 700, padding: '3px 8px', borderRadius: '999px',
                      background: h.isActive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                      color: h.isActive ? '#10b981' : '#ef4444'
                    }}>
                      {h.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                    <span style={{
                      fontSize: '9px', fontFamily: 'Syne', fontWeight: 700, padding: '3px 8px', borderRadius: '999px',
                      background: h.mustChangePassword ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)',
                      color: h.mustChangePassword ? '#f59e0b' : '#10b981'
                    }}>
                      {h.mustChangePassword ? 'MUST CHANGE PW' : 'PW SET'}
                    </span>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {h.isActive ? (
                    <button onClick={() => handleDeactivate(h)}
                      style={{ padding: '6px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '8px', fontSize: '11px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>
                      Deactivate
                    </button>
                  ) : (
                    <button onClick={() => handleReactivate(h)}
                      style={{ padding: '6px 12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', borderRadius: '8px', fontSize: '11px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.2)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.1)')}>
                      Reactivate
                    </button>
                  )}
                  <button onClick={() => handleResetPassword(h)}
                    style={{ padding: '6px 12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', borderRadius: '8px', fontSize: '11px', fontFamily: 'Syne', fontWeight: 700, cursor: 'pointer' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.2)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(245,158,11,0.1)')}>
                    Reset Password
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
