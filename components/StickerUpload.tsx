import React, { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { uploadStickers, deleteCustomSticker, CustomSticker } from '../utils/stickerStorage';

interface Props {
  onStickersUpdated: () => void;
  customStickers: CustomSticker[];
  onAddSticker: (imageUrl: string) => void;
}

interface UploadStatus {
  file: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export const StickerUpload: React.FC<Props> = ({ onStickersUpdated, customStickers, onAddSticker }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatuses, setUploadStatuses] = useState<UploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    );
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadStatuses(selectedFiles.map(file => ({
      file: file.name,
      status: 'uploading'
    })));

    const result = await uploadStickers(selectedFiles);

    const newStatuses: UploadStatus[] = [];
    selectedFiles.forEach(file => {
      const success = result.success.find(s => s.name === file.name);
      const error = result.errors.find(e => e.file === file.name);

      if (success) {
        newStatuses.push({ file: file.name, status: 'success' });
      } else if (error) {
        newStatuses.push({ file: file.name, status: 'error', error: error.error });
      }
    });

    setUploadStatuses(newStatuses);
    setIsUploading(false);

    if (result.success.length > 0) {
      onStickersUpdated();
      setTimeout(() => {
        setSelectedFiles([]);
        setUploadStatuses([]);
      }, 2000);
    }
  };

  const handleDeleteSticker = async (sticker: CustomSticker) => {
    const success = await deleteCustomSticker(sticker);
    if (success) {
      onStickersUpdated();
    }
  };

  return (
    <div className="space-y-4">
      {customStickers.length > 0 && (
        <div>
          <h3 className="text-xs uppercase tracking-widest text-amber-100 mb-3">My Stickers</h3>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {customStickers.map(sticker => (
              <div key={sticker.id} className="relative group">
                <button
                  onClick={() => onAddSticker(sticker.image_url)}
                  className="aspect-square bg-slate-900 rounded border border-white/5 hover:border-amber-200/40 hover:bg-slate-800 transition-all p-1 flex items-center justify-center w-full active:scale-95"
                >
                  <img
                    src={sticker.image_url}
                    alt={sticker.name}
                    className="w-full h-full object-contain opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all"
                  />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSticker(sticker);
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="Delete sticker"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xs uppercase tracking-widest text-amber-100 mb-3">Upload Stickers</h3>

        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
            isDragging
              ? 'border-amber-200 bg-amber-200/5'
              : 'border-white/10 hover:border-white/20'
          }`}
        >
          <Upload className="mx-auto mb-2 text-slate-400" size={32} />
          <p className="text-sm text-slate-300 mb-2">
            Drag & drop images here
          </p>
          <p className="text-xs text-slate-500 mb-3">
            PNG, JPG, WEBP, SVG (max 2MB each)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-800 text-slate-200 px-4 py-2 rounded text-sm hover:bg-slate-700 transition-colors"
          >
            Browse Files
          </button>
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-4 space-y-2">
            {selectedFiles.map((file, index) => {
              const status = uploadStatuses.find(s => s.file === file.name);
              return (
                <div
                  key={index}
                  className="flex items-center justify-between bg-slate-900 rounded p-2 text-sm"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {status?.status === 'success' && (
                      <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    )}
                    {status?.status === 'error' && (
                      <AlertCircle size={16} className="text-red-400 flex-shrink-0" />
                    )}
                    {(!status || status.status === 'uploading') && (
                      <div className="w-4 h-4 border-2 border-amber-200 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    )}
                    <span className="text-slate-300 truncate" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                  {!status && (
                    <button
                      onClick={() => removeFile(index)}
                      className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0"
                    >
                      <X size={16} />
                    </button>
                  )}
                  {status?.status === 'error' && (
                    <span className="text-xs text-red-400 ml-2">{status.error}</span>
                  )}
                </div>
              );
            })}

            {!isUploading && uploadStatuses.length === 0 && (
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="w-full bg-amber-200 text-slate-900 py-2 rounded font-serif font-bold hover:bg-white transition-all disabled:opacity-50"
              >
                Upload {selectedFiles.length} {selectedFiles.length === 1 ? 'Sticker' : 'Stickers'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
