import { useNavigate } from 'react-router-dom';

export default function Home() {
  const nav = useNavigate();

  return (
    <div className="mesh-bg min-h-screen flex flex-col items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-12 fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5 pulse"
            style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', boxShadow: '0 0 40px rgba(245,158,11,0.3)' }}>
            <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
            </svg>
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}
            className="text-white mb-1">VisitorPass</h1>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Intelligent visitor management</p>
        </div>

        <div className="space-y-3 fade-up-2">
          <button onClick={() => nav('/verify')}
            className="w-full p-5 rounded-2xl text-left transition-all group"
            style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05))', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(245,158,11,0.2)' }}>👤</div>
              <div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px' }} className="text-white">New Visitor</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Register & get your pass</div>
              </div>
              <div className="ml-auto text-amber-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</div>
            </div>
          </button>

          <button onClick={() => nav('/recover-pass')}
            className="w-full p-5 rounded-2xl text-left transition-all group btn-ghost">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)' }}>🔍</div>
              <div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px' }} className="text-white">Recover Pass</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Already registered? Get your pass</div>
              </div>
              <div className="ml-auto text-slate-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</div>
            </div>
          </button>

          <button onClick={() => nav('/admin')}
            className="w-full p-5 rounded-2xl text-left transition-all group btn-ghost">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)' }}>🛡️</div>
              <div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px' }} className="text-white">Admin Dashboard</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Review & approve requests</div>
              </div>
              <div className="ml-auto text-slate-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</div>
            </div>
          </button>

          <button onClick={() => nav('/scanner')}
            className="w-full p-5 rounded-2xl text-left transition-all group btn-ghost">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ background: 'rgba(255,255,255,0.05)' }}>📷</div>
              <div>
                <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '15px' }} className="text-white">QR Scanner</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>Mark entry & exit</div>
              </div>
              <div className="ml-auto text-slate-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all">→</div>
            </div>
          </button>
        </div>

        <p className="text-center mt-10 fade-up-3" style={{ fontSize: '11px', color: '#334155', fontFamily: 'JetBrains Mono' }}>
          DEV MODE · OTP: 123456
        </p>
      </div>
    </div>
  );
}
