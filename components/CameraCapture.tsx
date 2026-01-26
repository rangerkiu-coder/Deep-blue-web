import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera } from 'lucide-react';
import { LAYOUT_CONFIG, LayoutType } from '../types';

interface Props {
  layout: LayoutType;
  onComplete: (photos: string[]) => void;
}

const CameraCapture: React.FC<Props> = ({ layout, onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [error, setError] = useState<string>('');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCapturingRef = useRef(false);

  const targetCount = LAYOUT_CONFIG[layout].photoCount;
  const targetAspect = layout === 'postcard' ? 16 / 9 : 4 / 3;

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            facingMode: 'user',
            focusMode: 'continuous',
            focusDistance: { ideal: 0 }
          } as MediaTrackConstraints,
          audio: false
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error("Camera error:", err);
        setError("Unable to access camera. Please check permissions.");
      }
    };
    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startCountdownRef = useRef<() => void>();

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current && !isCapturingRef.current) {
      isCapturingRef.current = true;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        const videoAspect = video.videoWidth / video.videoHeight;
        let sWidth = video.videoWidth;
        let sHeight = video.videoHeight;
        let sx = 0;
        let sy = 0;

        if (videoAspect > targetAspect) {
          sWidth = video.videoHeight * targetAspect;
          sx = (video.videoWidth - sWidth) / 2;
        } else {
          sHeight = video.videoWidth / targetAspect;
          sy = (video.videoHeight - sHeight) / 2;
        }

        canvas.width = targetAspect > 1.5 ? 1280 : 960;
        canvas.height = canvas.width / targetAspect;

        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);

        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);

        setCapturedPhotos(prev => {
          const newPhotos = [...prev, dataUrl];

          setTimeout(() => {
            isCapturingRef.current = false;
            if (newPhotos.length >= targetCount) {
              setTimeout(() => onComplete(newPhotos), 1000);
            } else if (startCountdownRef.current) {
              setTimeout(() => startCountdownRef.current!(), 1500);
            }
          }, 0);

          return newPhotos;
        });
      } else {
        isCapturingRef.current = false;
      }
    }
  }, [targetAspect, targetCount, onComplete]);

  const startCountdown = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    let count = 3;
    setCountdown(count);

    intervalRef.current = setInterval(() => {
      count--;
      if (count === 0) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        setCountdown(null);
        setTimeout(() => capturePhoto(), 100);
      } else {
        setCountdown(count);
      }
    }, 1000);
  }, [capturePhoto]);

  startCountdownRef.current = startCountdown;

  const handleStartSession = () => {
    startCountdown();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen relative z-10 w-full classic-gradient p-4">
       {/* Ambient Overlay Assets */}
       <div className="absolute inset-0 gold-shimmer opacity-20 pointer-events-none"></div>

      {error ? (
        <div className="bg-red-900/50 border border-red-500 text-red-100 p-6 rounded-sm font-serif">
          {error}
        </div>
      ) : (
        <div 
          className="relative w-full max-w-3xl bg-black rounded-lg overflow-hidden shadow-2xl border-4 border-amber-200/20 transition-all duration-500"
          style={{ 
              aspectRatio: `${targetAspect}`,
              maxHeight: '75vh' // Ensure it fits on mobile screens with UI below
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100 filter contrast-110 saturate-110" 
          />
          <canvas ref={canvasRef} className="hidden" />
          
          {isFlashing && <div className="absolute inset-0 bg-white z-50 flash-overlay" />}

          {/* UI Overlays */}
          <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 md:p-6">
            <div className="flex justify-between items-start">
               <div className="bg-slate-900/60 backdrop-blur px-4 py-1 md:px-6 md:py-2 rounded-full text-amber-100 font-serif border border-amber-200/20 text-xs md:text-base">
                 Exposure {capturedPhotos.length + 1} / {targetCount}
               </div>
               <div className="hidden md:block text-amber-200/80 text-sm font-serif italic tracking-wider">
                 Deep Blue Studio
               </div>
            </div>
            
            {/* Center Countdown */}
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center z-50">
                <div className="text-[80px] md:text-[140px] font-serif font-bold text-amber-100 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)]">
                  {countdown}
                </div>
              </div>
            )}

            <div className="flex justify-center pb-2 md:pb-4">
              {capturedPhotos.length === 0 && countdown === null && (
                 <button
                 onClick={handleStartSession}
                 className="pointer-events-auto bg-amber-200 hover:bg-white text-slate-900 rounded-full p-4 md:p-6 shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all transform hover:scale-105 active:scale-95 group"
               >
                 <Camera className="w-8 h-8 md:w-10 md:h-10 text-slate-900" />
               </button>
              )}
            </div>
          </div>
          
          {/* Progress indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
            {Array.from({ length: targetCount }).map((_, i) => (
              <div 
                key={i}
                className={`w-2 h-2 rounded-full border border-amber-200 transition-colors duration-300 ${
                  i < capturedPhotos.length ? 'bg-amber-200' : 'bg-transparent'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 md:mt-8 text-center text-amber-100/60 font-serif text-base md:text-lg tracking-wide px-4">
        {capturedPhotos.length === 0 && !countdown && "Tap the camera to begin your session."}
        {countdown && "Hold pose..."}
        {capturedPhotos.length > 0 && "Capture complete."}
      </div>
    </div>
  );
};

export default CameraCapture;