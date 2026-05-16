import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5Qrcode } from 'html5-qrcode';
import { scanQr } from '../../shared/services/api';

export default function Scanner() {
  const nav = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isProcessingRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastScannedTextRef = useRef<string>('');
  const lastScanTimeRef = useRef<number>(0);

  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
    visit?: any;
  } | null>(null);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;
    startScanner();
    return () => {
      isMountedRef.current = false;
      stopScanner();
    };
  }, []);

  const stopScanner = async () => {
    try {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      }
    } catch (_) {}
    scannerRef.current = null;

    // Kill all video tracks — turns off camera light
    try {
      document.querySelectorAll('video').forEach(video => {
        const stream = video.srcObject as MediaStream;
        if (stream) {
          stream.getTracks().forEach(t => t.stop());
          video.srcObject = null;
        }
      });
    } catch (_) {}

    if (isMountedRef.current) setScanning(false);
  };

  const startScanner = async () => {
    await stopScanner();

    const container = document.getElementById('qr-scanner-box');
    if (!container || !isMountedRef.current) return;
    container.innerHTML = '';

    // Reset all locks
    isProcessingRef.current = false;
    lastScannedTextRef.current = '';
    lastScanTimeRef.current = 0;

    try {
      scannerRef.current = new Html5Qrcode('qr-scanner-box');
      if (isMountedRef.current) setScanning(true);

      await scannerRef.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 180, height: 180 }, aspectRatio: 1.0 },
        async (decodedText) => {
          const now = Date.now();

          // Lock: already processing
          if (isProcessingRef.current) return;

          // Debounce: same QR within 3 seconds
          if (
            decodedText === lastScannedTextRef.current &&
            now - lastScanTimeRef.current < 3000
          ) return;

          // Lock immediately
          isProcessingRef.current = true;
          lastScannedTextRef.current = decodedText;
          lastScanTimeRef.current = now;

          // Stop camera before API call
          await stopScanner();

          try {
            const r = await scanQr(decodedText);
            if (isMountedRef.current)
              setResult({ type: 'success', message: r.data.message, visit: r.data.visit });
          } catch (e: any) {
            if (isMountedRef.current)
              setResult({ type: 'error', message: e.response?.data?.error || 'Scan failed' });
          }
        },
        () => {}
      );
    } catch (_) {
      if (isMountedRef.current) setScanning(false);
    }
  };

  const resetScanner = () => {
    // Clear everything before restarting
    isProcessingRef.current = false;
    lastScannedTextRef.current = '';
    lastScanTimeRef.current = 0;
    setResult(null);
    setTimeout(() => {
      if (isMountedRef.current) startScanner();
    }, 400);
  };

  const handleBack = async () => {
    await stopScanner();
    nav('/');
  };

  return (
    <div className="mesh-bg min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />

      <div className="relative w-full max-w-sm flex flex-col items-center gap-6">
        <button onClick={handleBack} className="self-start text-sm"
          style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#f1f5f9')}
          onMouseLeave={e => (e.currentTarget.style.color = '#64748b')}>
          ← Back
        </button>

        <div className="text-center">
          <div style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', marginBottom: '8px' }}>
            SECURITY CHECKPOINT
          </div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.75rem', fontWeight: 800 }} className="text-white">QR Scanner</h2>
          <p style={{ color: '#64748b', fontSize: '13px' }} className="mt-1">Scan visitor pass to mark entry / exit</p>
        </div>

        {!result ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative', width: '260px', height: '260px' }}>
              {[
                { top: 0,    left:  0,    borderTop:    '2px solid #f59e0b', borderLeft:   '2px solid #f59e0b', borderRadius: '8px 0 0 0' },
                { top: 0,    right: 0,    borderTop:    '2px solid #f59e0b', borderRight:  '2px solid #f59e0b', borderRadius: '0 8px 0 0' },
                { bottom: 0, left:  0,    borderBottom: '2px solid #f59e0b', borderLeft:   '2px solid #f59e0b', borderRadius: '0 0 0 8px' },
                { bottom: 0, right: 0,    borderBottom: '2px solid #f59e0b', borderRight:  '2px solid #f59e0b', borderRadius: '0 0 8px 0' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: '24px', height: '24px', zIndex: 10, ...s }} />
              ))}
              <div id="qr-scanner-box"
                style={{ width: '260px', height: '260px', borderRadius: '16px', overflow: 'hidden', background: '#0f172a' }} />
            </div>
            {scanning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', animation: 'pulse-ring 2s infinite' }} />
                <span style={{ fontSize: '11px', color: '#10b981', fontFamily: 'JetBrains Mono' }}>SCANNING</span>
              </div>
            )}
          </div>
        ) : (
          <div className="glass w-full rounded-2xl p-6 text-center"
            style={{ border: `1px solid ${result.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
              {result.type === 'success' ? '✅' : '❌'}
            </div>
            <p style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: '1.1rem', color: result.type === 'success' ? '#10b981' : '#ef4444', marginBottom: '8px' }}>
              {result.message}
            </p>
            {result.visit && (
              <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '12px', textAlign: 'left', marginTop: '12px' }}>
                {[
                  ['Visitor', result.visit.visitor?.name],
                  ['Phone',   result.visit.visitor?.phone],
                  ['Status',  result.visit.status],
                  result.visit.inTime  && ['In',  new Date(result.visit.inTime).toLocaleTimeString()],
                  result.visit.outTime && ['Out', new Date(result.visit.outTime).toLocaleTimeString()],
                ].filter(Boolean).map((row: any) => (
                  <div key={row[0]} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                    <span style={{ color: '#475569', fontFamily: 'JetBrains Mono' }}>{row[0]}</span>
                    <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{row[1]}</span>
                  </div>
                ))}
              </div>
            )}
            <button onClick={resetScanner} className="btn-ghost"
              style={{ width: '100%', padding: '12px', marginTop: '16px', fontSize: '13px' }}>
              Scan Another
            </button>
          </div>
        )}

        <button onClick={handleBack}
          style={{ fontSize: '12px', color: '#334155', background: 'none', border: 'none', cursor: 'pointer' }}
          onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
          onMouseLeave={e => (e.currentTarget.style.color = '#334155')}>
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
