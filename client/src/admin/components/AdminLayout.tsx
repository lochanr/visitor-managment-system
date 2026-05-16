import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const nav = useNavigate();
  const { user, logout } = useAuth();

  const navItems = [
    { to: '/admin/dashboard', icon: '🛡️', label: 'Dashboard' },
    { to: '/admin/scanner',   icon: '📷', label: 'Scanner'   },
    { to: '/admin/history',   icon: '📋', label: 'History'   },
    ...(user?.role === 'OWNER'
      ? [{ to: '/admin/hosts', icon: '👥', label: 'Hosts' }]
      : []),
  ];

  const handleLogout = () => { logout(); nav('/admin/login'); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#060a10' }}>
      <header style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>🛡️</div>
          <div>
            <span style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: '14px', color: '#f1f5f9' }}>Admin Portal</span>
            {user && <span style={{ fontSize: '10px', color: '#475569', fontFamily: 'JetBrains Mono', marginLeft: '8px' }}>{user.role} · {user.name}</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={() => nav('/')} style={{ fontSize: '12px', color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#94a3b8')}
            onMouseLeave={e => (e.currentTarget.style.color = '#475569')}>← Visitor</button>
          <button onClick={handleLogout}
            style={{ fontSize: '12px', color: '#ef4444', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.2)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}>Logout</button>
        </div>
      </header>

      <main style={{ flex: 1, overflowY: 'auto', paddingBottom: '80px' }}>
        <Outlet />
      </main>

      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(6,10,16,0.95)', borderTop: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(20px)', display: 'flex', zIndex: 50, paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            style={({ isActive }) => ({
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: '3px', padding: '10px 8px',
              textDecoration: 'none', fontSize: '10px', fontFamily: 'Syne', fontWeight: 600,
              letterSpacing: '0.04em', color: isActive ? '#f59e0b' : '#475569',
              borderTop: isActive ? '2px solid #f59e0b' : '2px solid transparent',
              transition: 'color 0.15s',
            })}>
            <span style={{ fontSize: '18px' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
