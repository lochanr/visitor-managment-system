import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Props {
  children: React.ReactNode;
  allowedRoles?: string[];
  skipMustChangeCheck?: boolean;
}

export default function ProtectedRoute({ children, allowedRoles, skipMustChangeCheck }: Props) {
  const { user, loading, logout } = useAuth();
  const nav = useNavigate();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060a10' }}>
      <div className="w-8 h-8 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
    </div>
  );

  if (!user) return <Navigate to="/admin/login" replace />;

  // Skip mustChangePassword check for the change-password page itself
  if (!skipMustChangeCheck && user.mustChangePassword)
    return <Navigate to="/change-password" replace />;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060a10', flexDirection: 'column', gap: '12px', padding: '24px', textAlign: 'center' }}>
        <p style={{ fontSize: '2.5rem' }}>🚫</p>
        <p style={{ fontFamily: 'Syne', color: '#ef4444', fontWeight: 700, fontSize: '1.2rem' }}>Access Denied</p>
        <p style={{ color: '#64748b', fontSize: '13px' }}>Your role ({user.role}) cannot access this page</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px', width: '100%', maxWidth: '280px' }}>
          <button onClick={() => nav('/admin/dashboard')} className="btn-primary" style={{ padding: '12px', fontSize: '13px' }}>
            Go to Dashboard
          </button>
          <button onClick={() => nav('/admin/login')} className="btn-ghost" style={{ padding: '12px', fontSize: '13px' }}>
            Go to Admin Login
          </button>
          <button onClick={() => { logout(); nav('/admin/login'); }}
            style={{ padding: '12px', fontSize: '13px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: '12px', cursor: 'pointer' }}>
            Logout & Login Again
          </button>
          <button onClick={() => nav('/')} style={{ fontSize: '12px', color: '#334155', background: 'none', border: 'none', cursor: 'pointer', marginTop: '4px' }}>
            ← Go Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
