import React, { useState } from 'react';
import { getGallery, deletePhotoFromGallery, clearGallery, SavedPhoto } from '../utils/storage';
import { ArrowLeft, Trash2, Download, Image as ImageIcon, Lock, Sticker as StickerIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { StickerUpload } from './StickerUpload';
import { getCustomStickers, CustomSticker } from '../utils/stickerStorage';

interface Props {
  onBack: () => void;
}

const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'stickers'>('photos');
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  // Authentication Logic
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
        setIsAuthenticated(true);
        loadPhotos();
        loadCustomStickers();
    } else {
        alert('Incorrect PIN');
        setPin('');
    }
  };

  const loadPhotos = async () => {
    setLoading(true);
    try {
        const gallery = await getGallery();
        setPhotos(gallery);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const loadCustomStickers = async () => {
    const stickers = await getCustomStickers();
    setCustomStickers(stickers);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this photo?')) {
      const updated = await deletePhotoFromGallery(id);
      setPhotos(updated);
      if (currentPhotoIndex >= updated.length && updated.length > 0) {
        setCurrentPhotoIndex(updated.length - 1);
      } else if (updated.length === 0) {
        setCurrentPhotoIndex(0);
      }
    }
  };

  const handleClearAll = async () => {
    if (confirm('WARNING: This will delete ALL photos. This cannot be undone.')) {
      await clearGallery();
      setPhotos([]);
      setCurrentPhotoIndex(0);
    }
  };

  const handleDownload = (photo: SavedPhoto) => {
    const link = document.createElement('a');
    link.href = photo.fullSizeUrl || photo.dataUrl;
    link.download = `deep-blue-archive-${photo.id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const goToPrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
  };

  const goToNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
  };

  if (!isAuthenticated) {
      return (
          <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4">
              <div className="bg-slate-900 border border-amber-200/20 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                  <div className="mx-auto bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mb-6 text-amber-200">
                      <Lock size={32} />
                  </div>
                  <h2 className="text-2xl font-serif text-amber-100 mb-2">Admin Access</h2>
                  <p className="text-slate-400 mb-6 text-sm">Enter security PIN to view archives.</p>
                  
                  <form onSubmit={handlePinSubmit} className="space-y-4">
                      <input 
                        type="password" 
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 text-center text-2xl tracking-widest text-white rounded-lg p-3 focus:border-amber-400 focus:outline-none transition-colors font-mono"
                        placeholder="••••"
                        maxLength={4}
                        autoFocus
                      />
                      <button 
                        type="submit"
                        className="w-full bg-amber-200 text-slate-900 font-bold py-3 rounded-lg hover:bg-white transition-colors"
                      >
                          Unlock
                      </button>
                  </form>
                  <button onClick={onBack} className="mt-6 text-slate-500 hover:text-slate-300 text-sm">
                      Return to App
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-200 flex flex-col font-sans">
      {/* Header */}
      <div className="bg-slate-900 border-b border-white/10 sticky top-0 z-50">
        <div className="p-4 md:p-6 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={onBack}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-serif text-amber-200">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-slate-400">
             {activeTab === 'photos' && (
               <>
                 <span className="hidden sm:inline">{photos.length} Photos Stored</span>
                 <span className="sm:hidden">{photos.length} Items</span>
                 {photos.length > 0 && (
                   <button
                      onClick={handleClearAll}
                      className="px-3 py-1.5 md:px-4 md:py-2 border border-red-500/50 text-red-400 rounded hover:bg-red-500/10 transition-colors flex items-center gap-2"
                   >
                      <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Clear All</span>
                   </button>
                 )}
               </>
             )}
             {activeTab === 'stickers' && (
               <>
                 <span className="hidden sm:inline">{customStickers.length} Custom Stickers</span>
                 <span className="sm:hidden">{customStickers.length} Items</span>
               </>
             )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-white/10">
          <button
            onClick={() => setActiveTab('photos')}
            className={`flex-1 py-3 text-center text-xs md:text-sm uppercase tracking-widest font-serif transition-all flex items-center justify-center gap-2 ${
              activeTab === 'photos'
                ? 'text-amber-200 border-b-2 border-amber-200 bg-white/5'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <ImageIcon size={14} /> Photos
          </button>
          <button
            onClick={() => setActiveTab('stickers')}
            className={`flex-1 py-3 text-center text-xs md:text-sm uppercase tracking-widest font-serif transition-all flex items-center justify-center gap-2 ${
              activeTab === 'stickers'
                ? 'text-amber-200 border-b-2 border-amber-200 bg-white/5'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <StickerIcon size={14} /> Stickers
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'photos' && (
          <>
            {loading ? (
              <div className="h-full flex items-center justify-center text-amber-200 animate-pulse">
                Loading Archive...
              </div>
            ) : photos.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                <div className="p-6 rounded-full bg-slate-900">
                  <ImageIcon size={48} />
                </div>
                <p className="text-lg md:text-xl font-light">No photos generated yet.</p>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center relative px-4 md:px-8 py-8">
                <div className="relative w-full max-w-4xl">
                  <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
                    <div className="aspect-[2/3] w-full relative">
                      {photos[currentPhotoIndex]?.dataUrl ? (
                        <img
                          src={photos[currentPhotoIndex].dataUrl}
                          alt="Archive"
                          className="w-full h-full object-contain bg-slate-950"
                          onError={(e) => {
                            console.error('Failed to load image:', photos[currentPhotoIndex].dataUrl);
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="300" viewBox="0 0 200 300"%3E%3Crect fill="%23374151" width="200" height="300"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="14" fill="%23fff" text-anchor="middle" dominant-baseline="middle"%3EImage Not Found%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                          <div className="text-center">
                            <ImageIcon size={48} className="mx-auto mb-2" />
                            <p className="text-sm">No image</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 md:p-6 bg-slate-900 border-t border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-slate-400 text-xs md:text-sm font-mono">
                          <div>Photo #{photos[currentPhotoIndex]?.id.slice(-8)}</div>
                          <div className="text-slate-500 text-xs mt-1">
                            {new Date(photos[currentPhotoIndex]?.timestamp).toLocaleString()}
                          </div>
                        </div>
                        <div className="text-amber-200 font-serif text-sm">
                          {currentPhotoIndex + 1} / {photos.length}
                        </div>
                      </div>

                      <div className="flex gap-3 flex-wrap">
                        <button
                          onClick={() => handleDownload(photos[currentPhotoIndex])}
                          className="flex-1 bg-amber-200 text-slate-950 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-white transition-colors text-sm"
                        >
                          <Download size={16} /> Download Full Size
                        </button>
                        <button
                          onClick={() => handleDelete(photos[currentPhotoIndex].id)}
                          className="px-4 py-3 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  {photos.length > 1 && (
                    <>
                      <button
                        onClick={goToPrevPhoto}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-16 bg-slate-900 hover:bg-slate-800 text-amber-200 p-3 md:p-4 rounded-full border border-white/10 shadow-lg transition-all"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={goToNextPhoto}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-16 bg-slate-900 hover:bg-slate-800 text-amber-200 p-3 md:p-4 rounded-full border border-white/10 shadow-lg transition-all"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>

                {photos.length > 1 && (
                  <div className="flex gap-2 mt-6 overflow-x-auto max-w-full px-4">
                    {photos.map((photo, index) => (
                      <button
                        key={photo.id}
                        onClick={() => setCurrentPhotoIndex(index)}
                        className={`flex-shrink-0 w-16 h-24 rounded border-2 transition-all overflow-hidden ${
                          index === currentPhotoIndex
                            ? 'border-amber-200 opacity-100 scale-110'
                            : 'border-white/10 opacity-50 hover:opacity-75'
                        }`}
                      >
                        <img
                          src={photo.dataUrl}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {activeTab === 'stickers' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-slate-900 rounded-lg border border-white/10 p-6">
              <h2 className="text-xl font-serif text-amber-100 mb-4">Manage Custom Stickers</h2>
              <p className="text-slate-400 text-sm mb-6">
                Upload custom stickers that will be available for use in the photo editor.
              </p>
              <StickerUpload
                customStickers={customStickers}
                onStickersUpdated={loadCustomStickers}
                onAddSticker={() => {}}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;