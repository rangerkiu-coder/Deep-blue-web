import React, { useState, useEffect } from 'react';
import { Send, Settings, Upload, CheckCircle, XCircle, Clock, Image as ImageIcon, ArrowLeft } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { getGallery, SavedPhoto } from '../utils/storage';

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

export function WhatsAppSender() {
  const [showConfig, setShowConfig] = useState(false);
  const [config, setConfig] = useState<ApiConfig>({ api_key: '', sender_number: '' });
  const [recipientNumber, setRecipientNumber] = useState('');
  const [caption, setCaption] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sentMessages, setSentMessages] = useState<SentMessage[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryPhotos, setGalleryPhotos] = useState<SavedPhoto[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);

  useEffect(() => {
    loadConfig();
    loadSentMessages();
  }, []);

  const loadConfig = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Not authenticated');
        setLoading(false);
        return;
      }

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
      setLoading(false);
    } catch (err) {
      console.error('Error loading config:', err);
      setError('Failed to load configuration');
      setLoading(false);
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

  const loadGallery = async () => {
    try {
      setLoadingGallery(true);
      const result = await getGallery(1, 50);
      setGalleryPhotos(result.photos);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-amber-200 text-lg animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-900 border border-amber-200/20 rounded-2xl shadow-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-amber-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-3xl font-serif text-amber-200">WhatsApp Image Sender</h1>
            </div>
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
              <h2 className="text-xl font-serif text-amber-100 mb-4">API Configuration</h2>
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
                <h2 className="text-xl font-serif text-amber-100">Send Image</h2>

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
                        loadGallery();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-amber-500/50 hover:border-amber-500 rounded-lg transition-colors text-amber-200"
                    >
                      <ImageIcon className="w-5 h-5" />
                      <span>From Gallery</span>
                    </button>
                  </div>

                  {showGallery && (
                    <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-amber-200/20 max-h-96 overflow-y-auto">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-amber-100">Select from Gallery</h3>
                        <button
                          onClick={() => setShowGallery(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <XCircle className="w-5 h-5" />
                        </button>
                      </div>
                      {loadingGallery ? (
                        <div className="text-center py-4 text-slate-400">Loading gallery...</div>
                      ) : galleryPhotos.length === 0 ? (
                        <div className="text-center py-4 text-slate-400">No photos in gallery</div>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {galleryPhotos.map((photo) => (
                            <button
                              key={photo.id}
                              onClick={() => selectFromGallery(photo)}
                              className="aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-amber-500 transition-all"
                            >
                              <img
                                src={photo.dataUrl}
                                alt="Gallery"
                                className="w-full h-full object-cover"
                              />
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
                <h2 className="text-xl font-serif text-amber-100 mb-4">Sent Messages</h2>
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
    </div>
  );
}
