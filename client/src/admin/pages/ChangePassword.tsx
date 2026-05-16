import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { changePassword } from '../../shared/services/api';
import { useAuth } from '../context/AuthContext';

export default function ChangePassword() {
  const nav = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword)
      return setError('All fields are required');
    if (form.newPassword.length < 6)
      return setError('New password must be at least 6 characters');
    if (form.newPassword !== form.confirmPassword)
      return setError('New passwords do not match');
    if (form.currentPassword === form.newPassword)
      return setError('New password must be different from current password');

    setLoading(true); setError('');
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      await refreshUser(); // update mustChangePassword in context
      nav('/admin/dashboard', { replace: true });
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to change password');
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
        <div className="text-center mb-8 fade-up">
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '14px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', marginBottom: '16px' }}>
            🔑
          </div>
          <h1 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '1.5rem', color: '#f1f5f9', margin: 0 }}>Change Password</h1>
          {user?.mustChangePassword && (
            <p style={{ color: '#f59e0b', fontSize: '12px', marginTop: '6px', fontFamily: 'JetBrains Mono' }}>
              You must change your password before continuing
            </p>
          )}
          {user && <p style={{ color: '#64748b', fontSize: '13px', marginTop: '4px' }}>Logged in as {user.name}</p>}
        </div>

        <div className="glass rounded-2xl p-6 fade-up-2">
          {[
            { key: 'currentPassword', label: 'Current Password', placeholder: '••••••••' },
            { key: 'newPassword',     label: 'New Password',     placeholder: 'Min 6 characters' },
            { key: 'confirmPassword', label: 'Confirm New Password', placeholder: 'Repeat new password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>
                {f.label.toUpperCase()}
              </label>
              <input
                type="password"
                value={(form as any)[f.key]}
                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                className="input-field"
              />
            </div>
          ))}

          {error && (
            <div style={{ marginBottom: '14px', padding: '10px', borderRadius: '10px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5', fontSize: '12px' }}>
              {error}
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full py-4 text-sm">
            {loading ? 'Updating...' : 'Update Password →'}
          </button>
        </div>

        <button onClick={() => { logout(); nav('/admin/login'); }}
          style={{ display: 'block', width: '100%', marginTop: '12px', padding: '10px', fontSize: '12px', color: '#334155', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'center' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
          onMouseLeave={e => (e.currentTarget.style.color = '#334155')}>
          Logout instead
        </button>
      </div>
    </div>
  );
}
