import React, { useState, useRef, useEffect } from 'react';
import { getGallery, deletePhotoFromGallery, clearGallery, SavedPhoto, GalleryResult } from '../utils/storage';
import { ArrowLeft, Trash2, Download, Image as ImageIcon, Lock, Sticker as StickerIcon, ChevronLeft, ChevronRight, Send, Settings, Upload, CheckCircle, XCircle, Clock, MessageSquare } from 'lucide-react';
import { StickerUpload } from './StickerUpload';
import { getCustomStickers, CustomSticker } from '../utils/stickerStorage';
import { supabase } from '../utils/supabase';

interface Props {
  onBack: () => void;
}

interface ApiConfig {
  id?: string;
  api_key: string;
  sender_number: string;
}

interface SentMessage {
  id: string;
  recipient_number: string;
  image_url: string;
  caption: string;
  sent_at: string;
  status: 'pending' | 'success' | 'failed';
  error_message?: string;
}

const AdminDashboard: React.FC<Props> = ({ onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState('');
  const [photos, setPhotos] = useState<SavedPhoto[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'photos' | 'stickers' | 'whatsapp'>('photos');
  const [customStickers, setCustomStickers] = useState<CustomSticker[]>([]);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<SavedPhoto | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPhotos, setTotalPhotos] = useState(0);

  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<ApiConfig>({ api_key: '', sender_number: '' });
  const [recipientNumber, setRecipientNumber] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<SavedPhoto[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [filterWithPhone, setFilterWithPhone] = useState(true);

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
        loadWhatsAppConfig();
        loadSentMessages();
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

  const loadWhatsAppConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('whatsapp_api_config')
        .select('*')
        .eq('admin_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setConfig(data);
      } else {
        setShowConfig(true);
      }
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Failed to load configuration');
    }
  };

  const loadSentMessages = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('whatsapp_sent_messages')
        .select('*')
        .eq('admin_id', user.id)
        .order('sent_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setSentMessages(data || []);
    } catch (err) {
      console.error('Error loading sent messages:', err);
    }
  };

  const loadGalleryForWhatsApp = async () => {
    try {
      setLoadingGallery(true);
      const result = await getGallery(1, 100);
      const filteredPhotos = filterWithPhone
        ? result.photos.filter(p => p.phoneNumber)
        : result.photos;
      setGalleryPhotos(filteredPhotos);
    } catch (err) {
      console.error('Error loading gallery:', err);
      setError('Failed to load gallery');
    } finally {
      setLoadingGallery(false);
    }
  };

  const saveConfig = async () => {
    try {
      setError('');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!config.api_key || !config.sender_number) {
        setError('Please fill in all fields');
        return;
      }

      const configData = {
        admin_id: user.id,
        api_key: config.api_key,
        sender_number: config.sender_number,
        updated_at: new Date().toISOString(),
      };

      if (config.id) {
        const { error } = await supabase
          .from('whatsapp_api_config')
          .update(configData)
          .eq('id', config.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('whatsapp_api_config')
          .insert(configData)
          .select()
          .single();
        if (error) throw error;
        setConfig(data);
      }

      setSuccess('Configuration saved successfully');
      setShowConfig(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error saving config:', err);
      setError('Failed to save configuration');
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setShowGallery(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectFromGallery = (photo: SavedPhoto) => {
    setSelectedImage(photo.fullSizeUrl || photo.dataUrl);
    if (photo.phoneNumber) {
      setRecipientNumber(photo.phoneNumber);
    }
    setShowGallery(false);
  };

  const sendImage = async () => {
    try {
      setError('');
      setSending(true);

      if (!selectedImage) {
        setError('Please select an image');
        return;
      }

      if (!recipientNumber) {
        setError('Please enter recipient number');
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-whatsapp-image`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            recipientNumber,
            imageUrl: selectedImage.startsWith('http') ? selectedImage : undefined,
            imageBase64: selectedImage.startsWith('data:') ? selectedImage : undefined,
            caption,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to send image');
      }

      setSuccess('Image sent successfully!');
      setSelectedImage(null);
      setRecipientNumber('');
      setCaption('');
      loadSentMessages();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error sending image:', err);
      setError(err instanceof Error ? err.message : 'Failed to send image');
    } finally {
      setSending(false);
    }
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
             {activeTab === 'whatsapp' && (
               <>
                 <span className="hidden sm:inline">{sentMessages.length} Messages Sent</span>
                 <span className="sm:hidden">{sentMessages.length} Sent</span>
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
          <button
            onClick={() => setActiveTab('whatsapp')}
            className={`flex-1 py-3 text-center text-xs md:text-sm uppercase tracking-widest font-serif transition-all flex items-center justify-center gap-2 ${
              activeTab === 'whatsapp'
                ? 'text-amber-200 border-b-2 border-amber-200 bg-white/5'
                : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
            }`}
          >
            <MessageSquare size={14} /> WhatsApp
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
                          <div className="flex items-center justify-between mb-3">
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

        {activeTab === 'whatsapp' && (
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-serif text-amber-200">WhatsApp Image Sender</h2>
                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-200 border border-amber-200/30 rounded-lg transition-colors"
                >
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300">
                  {error}
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 bg-green-900/30 border border-green-500/50 rounded-lg text-green-300">
                  {success}
                </div>
              )}

              {showConfig && (
                <div className="mb-6 p-6 bg-slate-800 rounded-xl border border-amber-200/20">
                  <h3 className="text-xl font-serif text-amber-100 mb-4">API Configuration</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Ustaz AI API Key
                      </label>
                      <input
                        type="password"
                        value={config.api_key}
                        onChange={(e) => setConfig({ ...config, api_key: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="Enter your Ustaz AI API key"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Sender Number (Your WhatsApp Device Number)
                      </label>
                      <input
                        type="text"
                        value={config.sender_number}
                        onChange={(e) => setConfig({ ...config, sender_number: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="60123456789"
                      />
                    </div>
                    <button
                      onClick={saveConfig}
                      className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded-lg transition-colors"
                    >
                      Save Configuration
                    </button>
                  </div>
                </div>
              )}

              {!showConfig && config.api_key && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif text-amber-100">Send Image</h3>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Select Image Source
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                            id="image-upload"
                          />
                          <label
                            htmlFor="image-upload"
                            className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-amber-500/50 hover:border-amber-500 rounded-lg cursor-pointer transition-colors text-amber-200"
                          >
                            <Upload className="w-5 h-5" />
                            <span>Upload New</span>
                          </label>
                        </div>
                        <button
                          onClick={() => {
                            setShowGallery(true);
                            loadGalleryForWhatsApp();
                          }}
                          className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-amber-500/50 hover:border-amber-500 rounded-lg transition-colors text-amber-200"
                        >
                          <ImageIcon className="w-5 h-5" />
                          <span>From Gallery</span>
                        </button>
                      </div>

                      {showGallery && (
                        <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-amber-200/20 max-h-[500px] overflow-y-auto">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-amber-100">Select from Gallery</h4>
                            <button
                              onClick={() => setShowGallery(false)}
                              className="text-slate-400 hover:text-white"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="mb-3 pb-3 border-b border-amber-200/20 space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={filterWithPhone}
                                onChange={async (e) => {
                                  setFilterWithPhone(e.target.checked);
                                  setLoadingGallery(true);
                                  try {
                                    const result = await getGallery(1, 100);
                                    const filteredPhotos = e.target.checked
                                      ? result.photos.filter(p => p.phoneNumber)
                                      : result.photos;
                                    setGalleryPhotos(filteredPhotos);
                                  } catch (err) {
                                    console.error('Error loading gallery:', err);
                                  } finally {
                                    setLoadingGallery(false);
                                  }
                                }}
                                className="w-4 h-4 rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                              />
                              <span className="text-sm text-slate-300">Only show photos with phone numbers</span>
                            </label>
                            <div className="text-xs text-slate-500">
                              Showing {galleryPhotos.length} photo{galleryPhotos.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          {loadingGallery ? (
                            <div className="text-center py-4 text-slate-400">Loading gallery...</div>
                          ) : galleryPhotos.length === 0 ? (
                            <div className="text-center py-4 text-slate-400">
                              {filterWithPhone ? 'No photos with phone numbers found' : 'No photos in gallery'}
                            </div>
                          ) : (
                            <div className="grid grid-cols-3 gap-2">
                              {galleryPhotos.map((photo) => (
                                <button
                                  key={photo.id}
                                  onClick={() => selectFromGallery(photo)}
                                  className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-amber-500 transition-all group"
                                >
                                  <img
                                    src={photo.dataUrl}
                                    alt="Gallery"
                                    className="w-full h-full object-cover"
                                  />
                                  {photo.phoneNumber && (
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                      <div className="absolute bottom-0 left-0 right-0 p-2">
                                        <div className="text-xs text-white font-semibold truncate">
                                          {photo.phoneNumber}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  {photo.phoneNumber && (
                                    <div className="absolute top-1 right-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                                      📱
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {selectedImage && (
                        <div className="mt-4 relative">
                          <img
                            src={selectedImage}
                            alt="Selected"
                            className="w-full h-48 object-cover rounded-lg border-2 border-amber-500/50"
                          />
                          <button
                            onClick={() => setSelectedImage(null)}
                            className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Recipient Number
                      </label>
                      <input
                        type="text"
                        value={recipientNumber}
                        onChange={(e) => setRecipientNumber(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        placeholder="60123456789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        Caption (Optional)
                      </label>
                      <textarea
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-white rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        rows={3}
                        placeholder="Enter caption..."
                      />
                    </div>

                    <button
                      onClick={sendImage}
                      disabled={sending || !selectedImage || !recipientNumber}
                      className="w-full py-3 bg-green-600 hover:bg-green-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      {sending ? (
                        <>
                          <Clock className="w-5 h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5" />
                          Send Image
                        </>
                      )}
                    </button>
                  </div>

                  <div>
                    <h3 className="text-xl font-serif text-amber-100 mb-4">Sent Messages</h3>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto">
                      {sentMessages.length === 0 ? (
                        <div className="text-center py-8 text-slate-500">
                          No messages sent yet
                        </div>
                      ) : (
                        sentMessages.map((msg) => (
                          <div
                            key={msg.id}
                            className="p-4 bg-slate-800 rounded-lg border border-amber-200/20"
                          >
                            <div className="flex items-start gap-3">
                              <img
                                src={msg.image_url}
                                alt="Sent"
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-amber-100">
                                    {msg.recipient_number}
                                  </span>
                                  {msg.status === 'success' && (
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                  )}
                                  {msg.status === 'failed' && (
                                    <XCircle className="w-4 h-4 text-red-500" />
                                  )}
                                  {msg.status === 'pending' && (
                                    <Clock className="w-4 h-4 text-yellow-500" />
                                  )}
                                </div>
                                {msg.caption && (
                                  <p className="text-sm text-slate-400 mb-1 truncate">
                                    {msg.caption}
                                  </p>
                                )}
                                <p className="text-xs text-slate-500">
                                  {new Date(msg.sent_at).toLocaleString()}
                                </p>
                                {msg.error_message && (
                                  <p className="text-xs text-red-400 mt-1">
                                    {msg.error_message}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;