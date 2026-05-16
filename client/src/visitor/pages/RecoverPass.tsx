import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp, recoverPass } from '../../shared/services/api';

export default function RecoverPass() {
  const nav = useNavigate();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOtp = async () => {
    if (!phone.trim()) return setError('Enter your phone number');
    setLoading(true); setError('');
    try { await sendOtp(phone); setStep('otp'); }
    catch { setError('Failed to send OTP'); }
    setLoading(false);
  };

  const handleVerify = async () => {
    if (!otp.trim()) return setError('Enter OTP');
    setLoading(true); setError('');
    try {
      await verifyOtp(phone, otp);
      try {
        const r = await recoverPass(phone);
        const { visitId } = r.data;
        if (!visitId) {
          setError('No active approved pass found for this phone number');
          setLoading(false);
          return;
        }
        // Always navigate using visitId (the cuid string), not database id
        nav(`/pass/${visitId}`);
      } catch (e: any) {
        setError(e.response?.data?.error || 'No active approved pass found for this phone number');
      }
    } catch {
      setError('Invalid OTP — dev mode: use 123456');
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
        <button onClick={() => nav('/')} className="flex items-center gap-2 mb-8 text-sm fade-up"
          style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>← Back</button>

        <div className="fade-up mb-8">
          <div style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', marginBottom: '8px' }}>RECOVER PASS</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.75rem', fontWeight: 800 }} className="text-white mb-1">
            {step === 'phone' ? 'Enter your number' : 'Verify OTP'}
          </h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>
            {step === 'phone' ? "We'll find your approved visitor pass" : `Code sent to ${phone} — dev: 123456`}
          </p>
        </div>

        <div className="glass rounded-2xl p-6 fade-up-2">
          {step === 'phone' ? (
            <div className="space-y-4">
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.05em' }} className="block mb-2 uppercase">Phone Number</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                  placeholder="+91 98765 43210" className="input-field" />
              </div>
              {error && <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>}
              <button onClick={handleSendOtp} disabled={loading} className="btn-primary w-full py-4 text-sm">
                {loading ? 'Sending...' : 'Send OTP →'}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label style={{ fontSize: '12px', color: '#64748b', fontFamily: 'Syne', fontWeight: 600, letterSpacing: '0.05em' }} className="block mb-2 uppercase">One-Time Password</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  placeholder="123456" maxLength={6} className="input-field text-center"
                  style={{ fontFamily: 'JetBrains Mono', fontSize: '1.5rem', letterSpacing: '0.3em' }} />
              </div>
              {error && <div className="rounded-xl p-3 text-sm" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>{error}</div>}
              <button onClick={handleVerify} disabled={loading} className="btn-primary w-full py-4 text-sm">
                {loading ? 'Looking up pass...' : 'Recover My Pass →'}
              </button>
              <button onClick={() => { setStep('phone'); setOtp(''); setError(''); }}
                style={{ width: '100%', padding: '8px', fontSize: '13px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
                ← Change number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
