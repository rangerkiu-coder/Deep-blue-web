import React, { useState, useRef, useEffect } from 'react';
import { LayoutType, Sticker } from '../types';
import { generateComposite } from '../utils/canvasUtils';
import { savePhotoToGallery } from '../utils/storage';
import { Save, Palette, Image as ImageIcon, Sliders, X, RotateCw } from 'lucide-react';
import { getCustomStickers, CustomSticker } from '../utils/stickerStorage';
import PhoneInputModal from './PhoneInputModal';

interface Props {
  photos: string[];
  layout: LayoutType;
  onRestart: () => void;
}


const FRAME_COLORS = [
  { name: 'Classic White', hex: '#ffffff' },
  { name: 'Cream', hex: '#fffbeb' },
  { name: 'Soft Rose', hex: '#ffe4e6' },
  { name: 'Pale Azure', hex: '#e0f2fe' },
  { name: 'Mint', hex: '#d1fae5' },
  { name: 'Lavender', hex: '#f3e8ff' },
  { name: 'Peach', hex: '#ffedd5' },
  { name: 'Lemon', hex: '#fef9c3' },
  { name: 'Slate Gray', hex: '#cbd5e1' },
  { name: 'Obsidian', hex: '#0f172a' },
];

const PhotoEditor: React.FC<Props> = ({ photos, layout, onRestart }) => {
  const [frameColor, setFrameColor] = useState<string>('#ffffff');
  const [isExporting, setIsExporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'paper' | 'stickers'>('stickers');
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [showPhoneInput, setShowPhoneInput] = useState(false);
  const [previewScale, setPreviewScale] = useState<number>(56);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [activeStickerId, setActiveStickerId] = useState<string | null>(null);
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>([]);
  const [pendingPhotoDataUrl, setPendingPhotoDataUrl] = useState<string | null>(null);
  const [confirmationTimeLeft, setConfirmationTimeLeft] = useState<number>(15);

  const containerRef = useRef<HTMLDivElement>(null);
  const confirmationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const confirmationCountdownRef = useRef<NodeJS.Timeout | null>(null);
  const draggingRef = useRef<{
    id: string;
    mode: 'move' | 'transform';
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
    initialScale: number;
    initialRotation: number;
  } | null>(null);

  useEffect(() => {
    loadCustomStickers();
    return () => {
      clearConfirmationTimers();
    };
  }, []);

  const loadCustomStickers = async () => {
    const stickers = await getCustomStickers();
    setCustomStickers(stickers);
  };

  const addSticker = (imageUrl: string) => {
    const newSticker: Sticker = {
      id: Math.random().toString(36).substr(2, 9),
      type: imageUrl,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0,
      isCustom: true
    };
    setStickers([...stickers, newSticker]);
    setActiveStickerId(newSticker.id);
  };

  const removeSticker = (id: string, e?: React.MouseEvent | React.PointerEvent) => {
    e?.stopPropagation();
    setStickers(stickers.filter(s => s.id !== id));
    if (activeStickerId === id) setActiveStickerId(null);
  };

  const updateStickerScale = (newScale: number) => {
    if (!activeStickerId) return;
    setStickers(prev => prev.map(s => s.id === activeStickerId ? { ...s, scale: newScale } : s));
  };

  const handlePointerDown = (e: React.PointerEvent, id: string, mode: 'move' | 'transform') => {
    e.stopPropagation();
    e.preventDefault();
    setActiveStickerId(id);
    setActiveTab('stickers');
    const sticker = stickers.find(s => s.id === id);
    if (!sticker) return;
    draggingRef.current = {
      id,
      mode,
      startX: e.clientX,
      startY: e.clientY,
      initialX: sticker.x,
      initialY: sticker.y,
      initialScale: sticker.scale,
      initialRotation: sticker.rotation
    };
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current || !containerRef.current) return;
    e.preventDefault();

    const { id, mode, startX, startY, initialX, initialY } = draggingRef.current;
    const containerRect = containerRef.current.getBoundingClientRect();

    if (mode === 'move') {
      const deltaXPx = e.clientX - startX;
      const deltaYPx = e.clientY - startY;
      const deltaXPct = (deltaXPx / containerRect.width) * 100;
      const deltaYPct = (deltaYPx / containerRect.height) * 100;

      let nextX = Math.max(0, Math.min(100, initialX + deltaXPct));
      let nextY = Math.max(0, Math.min(100, initialY + deltaYPct));

      setStickers(prev => prev.map(s => s.id === id ? { ...s, x: nextX, y: nextY } : s));
    } else if (mode === 'transform') {
      const sticker = stickers.find(s => s.id === id);
      if (!sticker) return;
      const centerX = containerRect.left + (initialX / 100) * containerRect.width;
      const centerY = containerRect.top + (initialY / 100) * containerRect.height;
      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const angleRad = Math.atan2(dy, dx);
      const angleDeg = angleRad * (180 / Math.PI);
      const rotation = angleDeg - 45;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const baseRadius = (containerRect.width * 0.125) / 1.414;
      const newScale = Math.max(0.2, distance / baseRadius);

      setStickers(prev => prev.map(s => s.id === id ? { ...s, rotation: rotation, scale: newScale } : s));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingRef.current) {
      (e.target as Element).releasePointerCapture(e.pointerId);
      draggingRef.current = null;
    }
  };

  const activeSticker = stickers.find(s => s.id === activeStickerId);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const dataUrl = await generateComposite(layout, photos, stickers, frameColor);
      setPendingPhotoDataUrl(dataUrl);
      setShowPhoneInput(true);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while creating your masterpiece.");
    } finally {
      setIsExporting(false);
    }
  };

  const startConfirmationCountdown = () => {
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
    }
    if (confirmationCountdownRef.current) {
      clearTimeout(confirmationCountdownRef.current);
    }
    setConfirmationTimeLeft(15);

    confirmationTimeoutRef.current = setTimeout(() => {
      onRestart();
    }, 15000);

    const startTime = Date.now();
    const updateCountdown = () => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, Math.ceil((15000 - elapsed) / 1000));
      setConfirmationTimeLeft(remaining);

      if (remaining > 0) {
        confirmationCountdownRef.current = setTimeout(updateCountdown, 1000);
      }
    };
    updateCountdown();
  };

  const clearConfirmationTimers = () => {
    if (confirmationTimeoutRef.current) {
      clearTimeout(confirmationTimeoutRef.current);
    }
    if (confirmationCountdownRef.current) {
      clearTimeout(confirmationCountdownRef.current);
    }
  };

  const handlePhoneSubmit = async (phoneNumber: string) => {
    if (!pendingPhotoDataUrl) return;

    setIsExporting(true);
    try {
      await savePhotoToGallery(pendingPhotoDataUrl, phoneNumber);
      setShowPhoneInput(false);
      setShowSaveConfirmation(true);
      setPendingPhotoDataUrl(null);
      startConfirmationCountdown();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving your photo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleSkipPhone = async () => {
    if (!pendingPhotoDataUrl) return;

    setIsExporting(true);
    try {
      await savePhotoToGallery(pendingPhotoDataUrl);
      setShowPhoneInput(false);
      setShowSaveConfirmation(true);
      setPendingPhotoDataUrl(null);
      startConfirmationCountdown();
    } catch (err) {
      console.error(err);
      alert("Something went wrong while saving your photo.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCancelPhoneInput = () => {
    setShowPhoneInput(false);
    setPendingPhotoDataUrl(null);
  };

  return (
    <div className="flex flex-row h-[100dvh] w-full relative z-20 overflow-hidden bg-slate-950">
      
      {/* 1. Canvas Preview Area (Left side, takes remaining width) */}
      <div
        className="flex-1 h-full relative overflow-hidden bg-slate-900 flex items-center justify-center p-2"
        onPointerDown={() => setActiveStickerId(null)}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)' }}>
        </div>

        {/* The Scalable Canvas Container */}
        <div
          ref={containerRef}
          className="relative shrink-0 transition-all group border-4 border-slate-800 shadow-2xl touch-none"
          style={{
             height: `${previewScale}vh`,
             width: 'auto',
             aspectRatio: '2/3',
             background: frameColor,
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        > 
           {/* Aspect Ratio Enforcer: Invisible SVG matches the 2/3 aspect ratio to prevent collapse */}
           <svg 
              viewBox="0 0 200 300" 
              className="w-full h-full opacity-0 pointer-events-none block" 
              style={{ maxHeight: '100%', maxWidth: '100%' }}
           />

           {/* ================= Photos Layer ================= */}
           <div className="absolute inset-0 p-4 flex flex-col items-center z-10 select-none">
              {layout === 'postcard' && (
                <div className="w-full h-full flex flex-col gap-2 items-center justify-start py-6 px-2">
                  {photos.map((src, i) => (
                    <div key={i} className="bg-transparent shadow-md w-full flex-1 relative overflow-hidden">
                        <img src={src} alt={`Capture ${i}`} className="w-full h-full object-cover block pointer-events-none" />
                    </div>
                  ))}
                  <div className="h-4 md:h-6 w-full"></div>
                </div>
              )}
              
              {layout === 'strips' && (
                <div className="w-full h-full flex gap-[1.67%] justify-center px-[6.25%] py-[4.17%] items-center">
                  {[0, 1].map(stripIdx => {
                    return (
                      <div key={stripIdx} className="flex-1 h-full flex flex-col py-[2%] px-[4.85%] gap-[1.8%]" style={{ backgroundColor: frameColor }}>
                        {photos.slice(0, 4).map((src, i) => (
                          <div key={`${stripIdx}-${i}`} className="w-full relative overflow-hidden pointer-events-none" style={{ aspectRatio: '4/3' }}>
                            <img src={src} className="absolute inset-0 w-full h-full object-cover" alt="strip" />
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
           </div>

           {/* ================= Stickers Layer ================= */}
           {stickers.map(sticker => (
             <div
               key={sticker.id}
               style={{
                 position: 'absolute',
                 left: `${sticker.x}%`,
                 top: `${sticker.y}%`,
                 width: `${12.5 * sticker.scale}%`,
                 height: 'auto',
                 transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
                 cursor: activeStickerId === sticker.id ? 'move' : 'grab',
                 touchAction: 'none'
               }}
               className={`group transition-all duration-75 ${activeStickerId === sticker.id ? 'z-50' : 'z-40'}`}
             >
                <div
                    onPointerDown={(e) => handlePointerDown(e, sticker.id, 'move')}
                    className={`relative transition-all duration-200 rounded-lg ${
                        activeStickerId === sticker.id
                        ? 'ring-2 ring-amber-300 ring-offset-2 ring-offset-transparent shadow-[0_0_15px_rgba(251,191,36,0.3)] bg-white/5'
                        : 'hover:ring-1 hover:ring-white/30'
                    }`}>
                    <img
                      src={sticker.type}
                      alt="Custom sticker"
                      className="w-full h-full drop-shadow-lg select-none pointer-events-none object-contain"
                    />

                    {activeStickerId === sticker.id && (
                        <>
                            <button
                                onPointerDown={(e) => removeSticker(sticker.id, e)}
                                className="absolute -top-8 -right-8 bg-red-500 text-white rounded-full p-3 shadow-lg hover:bg-red-600 transition-colors z-50 transform hover:scale-110 active:scale-90"
                            >
                                <X size={16} />
                            </button>
                            <div
                                onPointerDown={(e) => handlePointerDown(e, sticker.id, 'transform')}
                                className="absolute -bottom-8 -right-8 bg-amber-400 text-slate-900 rounded-full p-3 shadow-lg hover:bg-amber-300 transition-colors z-50 cursor-nwse-resize transform hover:scale-110 active:scale-90"
                            >
                                <RotateCw size={16} />
                            </div>
                        </>
                    )}
                </div>
             </div>
           ))}

        </div>
      </div>

      {/* 2. Tools Panel (Right side sidebar) */}
      <div className="w-72 lg:w-64 xl:w-72 h-full flex-shrink-0 bg-slate-950 border-l border-white/5 flex flex-col p-4 md:p-5 z-30 overflow-hidden">
        {/* Retouching Header & Tabs */}
        <div className="shrink-0 mb-4 sticky top-0 bg-slate-950 z-10">
            <h2 className="text-xl md:text-2xl font-serif text-amber-100 mb-4">Retouching</h2>

            {/* Preview Scale Slider */}
            <div className="mb-4 p-3 bg-slate-900/50 rounded-lg border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs uppercase tracking-widest text-amber-100 flex items-center gap-2">
                  <Sliders size={12} /> Preview Size
                </label>
                <span className="text-xs text-amber-200 font-mono">{previewScale}%</span>
              </div>
              <input
                type="range"
                min="40"
                max="98"
                step="1"
                value={previewScale}
                onChange={(e) => setPreviewScale(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            <div className="flex border-b border-white/10">
                <button 
                  onClick={() => setActiveTab('stickers')}
                  className={`flex-1 py-3 text-center text-xs md:text-sm uppercase tracking-widest font-serif transition-all flex items-center justify-center gap-2 ${activeTab === 'stickers' ? 'text-amber-200 border-b-2 border-amber-200 bg-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  <ImageIcon size={14} /> Embellish
                </button>
                <button 
                  onClick={() => setActiveTab('paper')}
                  className={`flex-1 py-3 text-center text-xs md:text-sm uppercase tracking-widest font-serif transition-all flex items-center justify-center gap-2 ${activeTab === 'paper' ? 'text-amber-200 border-b-2 border-amber-200 bg-white/5' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
                >
                  <Palette size={14} /> Paper
                </button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-1">
            {activeTab === 'stickers' && (
              <div className="animate-fade-in space-y-4">
                  {activeSticker && (
                    <div className="p-4 bg-slate-900/50 rounded-lg border border-amber-200/20">
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-xs uppercase tracking-widest text-amber-100 flex items-center gap-2">
                          <Sliders size={12} /> Size
                        </label>
                        <span className="text-xs text-amber-200 font-mono">{(activeSticker.scale * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.05"
                        value={activeSticker.scale}
                        onChange={(e) => updateStickerScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    </div>
                  )}

                  {customStickers.length > 0 ? (
                    <div>
                      <h3 className="text-xs uppercase tracking-widest text-amber-100 mb-3">Available Stickers</h3>
                      <div className="grid grid-cols-3 gap-2">
                        {customStickers.map(sticker => (
                          <button
                            key={sticker.id}
                            onClick={() => addSticker(sticker.image_url)}
                            className="aspect-square bg-slate-900 rounded border border-white/5 hover:border-amber-200/40 hover:bg-slate-800 transition-all p-1 flex items-center justify-center w-full active:scale-95 group"
                          >
                            <img
                              src={sticker.image_url}
                              alt={sticker.name}
                              className="w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500">
                      <ImageIcon size={32} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No stickers available yet</p>
                      <p className="text-xs mt-1">Contact admin to add stickers</p>
                    </div>
                  )}
              </div>
            )}

            {activeTab === 'paper' && (
              <div className="animate-fade-in pt-2">
                  <div className="flex flex-wrap gap-4 justify-center">
                      {FRAME_COLORS.map(color => (
                      <button
                          key={color.name}
                          onClick={() => setFrameColor(color.hex)}
                          className={`w-16 h-16 rounded-full border border-white/10 transition-all transform hover:scale-110 active:scale-95 shadow-lg ${frameColor === color.hex ? 'ring-4 ring-amber-200 ring-offset-4 ring-offset-slate-950 scale-110' : ''}`}
                          style={{ backgroundColor: color.hex }}
                          title={color.name}
                      />
                      ))}
                  </div>
                  <p className="text-center text-slate-500 mt-6 text-sm font-serif italic">Select a paper stock for your print.</p>
              </div>
            )}
        </div>

        {/* Actions - Fixed at bottom of tools panel */}
        <div className="pt-4 border-t border-white/5 bg-slate-950 mt-2">
           <button
             onClick={handleExport}
             disabled={isExporting}
             className="w-full bg-amber-200 text-slate-900 py-3 rounded font-serif font-bold tracking-wide flex items-center justify-center gap-2 hover:bg-white hover:shadow-[0_0_20px_rgba(253,230,138,0.3)] transition-all disabled:opacity-50 text-sm active:scale-[0.98] mb-2"
           >
             {isExporting ? '...' : <><Save size={16} /> Save</>}
           </button>

           <button 
             onClick={onRestart}
             className="w-full text-slate-500 py-2 text-xs uppercase tracking-widest hover:text-red-400 transition-colors"
           >
             Start Over
           </button>
        </div>
      </div>

      {/* Phone Input Modal */}
      {showPhoneInput && (
        <PhoneInputModal
          onSubmit={handlePhoneSubmit}
          onSkip={handleSkipPhone}
          onCancel={handleCancelPhoneInput}
          isSubmitting={isExporting}
        />
      )}

      {/* Save Confirmation Modal */}
      {showSaveConfirmation && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-200/20 rounded-lg shadow-2xl max-w-md w-full p-8 text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-amber-200/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Save size={32} className="text-amber-200" />
              </div>
              <h2 className="text-2xl font-serif text-white mb-2">Photo Saved!</h2>
              <p className="text-slate-300 text-lg">
                You can print your photo at Counter for <span className="text-amber-200 font-bold">RM 10</span>
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  clearConfirmationTimers();
                  setShowSaveConfirmation(false);
                }}
                className="flex-1 bg-transparent border border-amber-200/30 text-amber-100 py-3 rounded font-serif hover:bg-amber-200/5 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  clearConfirmationTimers();
                  onRestart();
                }}
                className="flex-1 bg-amber-200 text-slate-900 py-3 rounded font-serif font-bold hover:bg-white hover:shadow-[0_0_20px_rgba(253,230,138,0.3)] transition-all"
              >
                Back to Home
              </button>
            </div>

            <p className="text-center text-slate-600 text-xs mt-4 flex items-center justify-center gap-2">
              <span>Returning to home in</span>
              <span className="text-amber-200 font-mono font-semibold">{confirmationTimeLeft}s</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoEditor;