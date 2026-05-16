import { useRef, useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Photo() {
  const nav = useNavigate();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [streaming, setStreaming] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Check for returning visitor photo
  const returningVisitor = (() => {
    try { return JSON.parse(localStorage.getItem('vms_returning_visitor') || 'null'); } catch { return null; }
  })();

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) { videoRef.current.srcObject = stream; setStreaming(true); }
    } catch { setError('Camera permission denied'); }
  };

  useEffect(() => {
    if (!returningVisitor) startCamera();
    return () => {
      if (videoRef.current?.srcObject)
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
    };
  }, []);

  const capture = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const c = canvasRef.current;
    c.width = videoRef.current.videoWidth;
    c.height = videoRef.current.videoHeight;
    c.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    setPhoto(c.toDataURL('image/jpeg', 0.8));
    (videoRef.current.srcObject as MediaStream)?.getTracks().forEach(t => t.stop());
    setStreaming(false);
  }, []);

  const usePrevious = () => {
    localStorage.setItem('vms_photo', returningVisitor.photoBase64);
    nav('/details');
  };

  const next = () => {
    if (!photo) return;
    localStorage.setItem('vms_photo', photo);
    nav('/details');
  };

  const retake = () => { setPhoto(null); startCamera(); };

  return (
    <div className="mesh-bg h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
        backgroundSize: '40px 40px'
      }} />
      <div className="relative w-full max-w-sm flex flex-col items-center gap-5">
        <button onClick={() => nav('/verify')} className="self-start text-sm fade-up"
          style={{ color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>

        <div className="text-center fade-up">
          <div style={{ fontSize: '11px', color: '#f59e0b', fontFamily: 'JetBrains Mono', letterSpacing: '0.1em', marginBottom: '6px' }}>STEP 2 OF 3</div>
          <h2 style={{ fontFamily: 'Syne', fontSize: '1.75rem', fontWeight: 800 }} className="text-white">Visitor photo</h2>
          {returningVisitor && <p style={{ color: '#10b981', fontSize: '12px', marginTop: '4px' }}>👋 Welcome back, {returningVisitor.name}!</p>}
        </div>

        {/* Camera / photo frame */}
        <div className="fade-up-2 relative" style={{ width: '200px', height: '200px' }}>
          {[['top-0 left-0','border-t-2 border-l-2 rounded-tl-2xl'],
            ['top-0 right-0','border-t-2 border-r-2 rounded-tr-2xl'],
            ['bottom-0 left-0','border-b-2 border-l-2 rounded-bl-2xl'],
            ['bottom-0 right-0','border-b-2 border-r-2 rounded-br-2xl']
          ].map(([pos,cls],i) => (
            <div key={i} className={`absolute ${pos} w-5 h-5 ${cls}`} style={{ borderColor: '#f59e0b' }} />
          ))}
          <div className="w-full h-full rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {photo ? (
  	      <img src={photo} alt="captured" className="w-full h-full object-cover" />
	    ) : (
              <>
    		<video
      		  ref={videoRef}
      		  className="w-full h-full object-cover"
      		  autoPlay playsInline muted
      		  style={{ display: streaming ? 'block' : 'none' }}
    		/>
    		{!streaming && returningVisitor && (
      		  <img src={returningVisitor.photoBase64} alt="previous" className="w-full h-full object-cover" style={{ opacity: 0.7 }} />
    		)}
    		{!streaming && !returningVisitor && (
      		  <div className="w-full h-full flex items-center justify-center">
        	    <span style={{ color: '#475569', fontSize: '13px' }}>Camera not started</span>
      		  </div>
    		)}
  	      </>
	    )}
          </div>
        </div>

        <canvas ref={canvasRef} className="hidden" />
        {error && <p style={{ color: '#fca5a5', fontSize: '13px' }}>{error}</p>}

        <div className="w-full space-y-3 fade-up-3">
          {/* Returning visitor with no new photo yet */}
          {returningVisitor && !photo && !streaming && (
            <>
              <button onClick={usePrevious} className="btn-primary w-full py-3 text-sm">Use Previous Photo</button>
              <button onClick={startCamera} className="btn-ghost w-full py-3 text-sm">📷 Take New Photo</button>
            </>
          )}
          {/* New visitor or camera open */}
          {!returningVisitor && !photo && (
            <button onClick={streaming ? capture : startCamera} className="btn-primary w-full py-3 text-sm">
              {streaming ? '📸 Capture Photo' : '📷 Open Camera'}
            </button>
          )}
          {/* Camera open for returning visitor */}
          {returningVisitor && streaming && !photo && (
            <button onClick={capture} className="btn-primary w-full py-3 text-sm">📸 Capture Photo</button>
          )}
          {/* Photo taken */}
          {photo && (
            <>
              <button onClick={next} className="btn-primary w-full py-3 text-sm">Continue →</button>
              <button onClick={retake} className="btn-ghost w-full py-3 text-sm">↺ Retake</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
