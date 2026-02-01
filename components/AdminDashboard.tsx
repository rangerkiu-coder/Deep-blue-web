import React, { useState, useRef, useEffect } from 'react';
import { getGallery, deletePhotoFromGallery, clearGallery, SavedPhoto, GalleryResult } from '../utils/storage';
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
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPhotos, setTotalPhotos] = useState(0);

  const photoModalTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);

  const startPhotoModalTimeout = () => {
    if (photoModalTimeoutRef.current) {
      clearTimeout(photoModalTimeoutRef.current);
    }
    photoModalTimeoutRef.current = setTimeout(() => {
      setSelectedPhoto(null);
    }, 10000);
  };

  const clearPhotoModalTimeout = () => {
    if (photoModalTimeoutRef.current) {
      clearTimeout(photoModalTimeoutRef.current);
      photoModalTimeoutRef.current = null;
    }
  };

  const resetPhotoModalTimeout = () => {
    startPhotoModalTimeout();
  };

  useEffect(() => {
    if (selectedPhoto) {
      startPhotoModalTimeout();
    } else {
      clearPhotoModalTimeout();
    }

    return () => {
      clearPhotoModalTimeout();
    };
  }, [selectedPhoto]);

  // Authentication Logic
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234') {
        setIsAuthenticated(true);
        loadPhotos(1);
        loadCustomStickers();
    } else {
        alert('Incorrect PIN');
        setPin('');
    }
  };

  const loadPhotos = async (page: number = currentPage) => {
    setLoading(true);
    try {
        const result: GalleryResult = await getGallery(page, 30);
        setPhotos(result.photos);
        setCurrentPage(result.page);
        setTotalPages(result.totalPages);
        setTotalPhotos(result.total);
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
      await deletePhotoFromGallery(id);
      await loadPhotos(currentPage);
      setCurrentPhotoIndex(0);
    }
  };

  const handleClearAll = async () => {
    if (confirm('WARNING: This will delete ALL photos. This cannot be undone.')) {
      await clearGallery();
      setPhotos([]);
      setCurrentPhotoIndex(0);
      setCurrentPage(1);
      setTotalPages(0);
      setTotalPhotos(0);
    }
  };

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      loadPhotos(page);
      setCurrentPhotoIndex(0);
    }
  };

  const handleDownload = async (photo: SavedPhoto) => {
    try {
      const downloadUrl = photo.fullSizeUrl || photo.dataUrl;

      if (downloadUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `deep-blue-archive-${photo.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        const response = await fetch(downloadUrl);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `deep-blue-archive-${photo.id}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download photo');
    }
  };

  const scrollThumbnails = (direction: 'left' | 'right') => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = 200;
      thumbnailScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollToCurrentThumbnail = () => {
    if (thumbnailScrollRef.current) {
      const thumbnailWidth = 64;
      const gap = 8;
      const scrollPosition = currentPhotoIndex * (thumbnailWidth + gap);
      thumbnailScrollRef.current.scrollTo({
        left: scrollPosition - thumbnailScrollRef.current.clientWidth / 2 + thumbnailWidth / 2,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (selectedPhoto) {
      scrollToCurrentThumbnail();
    }
  }, [currentPhotoIndex, selectedPhoto]);

  const goToPrevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    resetPhotoModalTimeout();
  };

  const goToNextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    resetPhotoModalTimeout();
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
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
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
                 <span className="hidden sm:inline">{totalPhotos} Photos Stored</span>
                 <span className="sm:hidden">{totalPhotos} Items</span>
                 <button
                    onClick={async () => {
                      for (const photo of photos) {
                        await handleDownload(photo);
                        await new Promise(resolve => setTimeout(resolve, 100));
                      }
                    }}
                    disabled={photos.length === 0}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-amber-500/20 border-2 border-amber-500 text-amber-200 font-semibold rounded hover:bg-amber-500/30 hover:border-amber-400 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                    <Download className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span className="hidden sm:inline">Download All</span><span className="sm:hidden">Download</span>
                 </button>
                 <button
                    onClick={handleClearAll}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-red-500/20 border-2 border-red-500 text-red-300 font-semibold rounded hover:bg-red-500/30 hover:border-red-400 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                 >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" /> <span>Clear All</span>
                 </button>
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
              <>
                <div className="flex-1 overflow-y-auto p-4 md:p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {photos.map((photo, index) => (
                      <div
                        key={photo.id}
                        className="group relative aspect-[2/3] bg-slate-900 rounded-lg overflow-hidden border border-white/10 hover:border-amber-200/50 transition-all cursor-pointer shadow-lg hover:shadow-2xl hover:scale-[1.02]"
                        onClick={() => {
                          setSelectedPhoto(photo);
                          setCurrentPhotoIndex(index);
                        }}
                      >
                        <img
                          src={photo.dataUrl}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-xs">
                            <div className="text-amber-200 font-serif mb-1">
                              Photo #{photo.id.slice(-8)}
                            </div>
                            <div className="text-slate-400 text-xs">
                              {new Date(photo.timestamp).toLocaleDateString()}
                            </div>
                            {photo.phoneNumber && (
                              <div className="text-amber-100 text-xs mt-1">
                                📱 {photo.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-8 flex flex-col items-center gap-4 pb-4">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-2 rounded-lg bg-slate-900 border border-white/10 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                        >
                          <ChevronLeft size={24} />
                        </button>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 text-sm whitespace-nowrap">
                            Page {currentPage} of {totalPages}
                          </span>
                          <input
                            type="range"
                            min="1"
                            max={totalPages}
                            value={currentPage}
                            onChange={(e) => goToPage(parseInt(e.target.value))}
                            className="w-48 h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-200"
                          />
                        </div>

                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-2 rounded-lg bg-slate-900 border border-white/10 text-amber-200 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
                        >
                          <ChevronRight size={24} />
                        </button>
                      </div>

                      <div className="text-slate-500 text-xs">
                        Showing {((currentPage - 1) * 30) + 1} - {Math.min(currentPage * 30, totalPhotos)} of {totalPhotos} photos
                      </div>
                    </div>
                  )}
                </div>

                {selectedPhoto && (
                  <div
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
                    onClick={() => {
                      clearPhotoModalTimeout();
                      setSelectedPhoto(null);
                    }}
                    onMouseMove={resetPhotoModalTimeout}
                    onKeyDown={resetPhotoModalTimeout}
                  >
                    <button
                      onClick={() => {
                        clearPhotoModalTimeout();
                        setSelectedPhoto(null);
                      }}
                      className="absolute top-4 right-4 z-10 bg-slate-900/80 hover:bg-slate-800 text-white p-3 rounded-full border border-white/10 shadow-lg transition-all"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>

                    <div className="relative w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                      <div className="relative bg-slate-900 rounded-lg overflow-hidden border border-white/20 shadow-2xl">
                        <div className="p-4 md:p-6 bg-slate-900 border-b border-white/10">
                          <div className="flex gap-3 flex-wrap">
                            <button
                              onClick={() => {
                                handleDownload(photos[currentPhotoIndex]);
                                resetPhotoModalTimeout();
                              }}
                              className="flex-1 bg-amber-200 text-slate-950 py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-white transition-colors text-sm"
                            >
                              <Download size={16} /> Download
                            </button>
                            <button
                              onClick={() => {
                                clearPhotoModalTimeout();
                                handleDelete(photos[currentPhotoIndex].id);
                                setSelectedPhoto(null);
                              }}
                              className="px-4 py-3 border border-red-500/50 text-red-400 rounded-lg hover:bg-red-500/10 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Trash2 size={16} /> Delete
                            </button>
                          </div>
                        </div>

                        <div className="aspect-[2/3] w-full relative max-h-[70vh]">
                          <img
                            src={photos[currentPhotoIndex]?.dataUrl}
                            alt="Photo"
                            className="w-full h-full object-contain bg-slate-950"
                          />
                        </div>

                        <div className="p-4 md:p-6 bg-slate-900 border-t border-white/10">
                          <div className="flex items-center justify-between">
                            <div className="text-slate-400 text-xs md:text-sm font-mono">
                              <div>Photo #{photos[currentPhotoIndex]?.id.slice(-8)}</div>
                              <div className="text-slate-500 text-xs mt-1">
                                {new Date(photos[currentPhotoIndex]?.timestamp).toLocaleString()}
                              </div>
                              {photos[currentPhotoIndex]?.phoneNumber && (
                                <div className="text-amber-200 text-xs mt-1 flex items-center gap-1">
                                  <span className="text-slate-500">Phone:</span> {photos[currentPhotoIndex].phoneNumber}
                                </div>
                              )}
                            </div>
                            <div className="text-amber-200 font-serif text-sm">
                              {currentPhotoIndex + 1} / {photos.length}
                            </div>
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
                      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 max-w-[90%]">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollThumbnails('left');
                            resetPhotoModalTimeout();
                          }}
                          className="flex-shrink-0 bg-slate-900/90 hover:bg-slate-800 text-amber-200 p-2 rounded-full border border-white/20 transition-all"
                        >
                          <ChevronLeft size={20} />
                        </button>

                        <div
                          ref={thumbnailScrollRef}
                          className="flex gap-2 overflow-x-auto scrollbar-hide"
                          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {photos.map((photo, index) => (
                            <button
                              key={photo.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setCurrentPhotoIndex(index);
                                setSelectedPhoto(photo);
                                resetPhotoModalTimeout();
                              }}
                              className={`flex-shrink-0 w-12 h-16 md:w-16 md:h-24 rounded border-2 transition-all overflow-hidden ${
                                index === currentPhotoIndex
                                  ? 'border-amber-200 opacity-100 scale-110'
                                  : 'border-white/30 opacity-50 hover:opacity-75'
                              }`}
                            >
                              <img
                                src={photo.dataUrl}
                                alt={`Thumbnail`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            scrollThumbnails('right');
                            resetPhotoModalTimeout();
                          }}
                          className="flex-shrink-0 bg-slate-900/90 hover:bg-slate-800 text-amber-200 p-2 rounded-full border border-white/20 transition-all"
                        >
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
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