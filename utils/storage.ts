import { supabase } from './supabase';
import { compressImage } from './imageCompression';

export interface SavedPhoto {
  id: string;
  timestamp: number;
  dataUrl: string;
  fullSizeUrl?: string;
  phoneNumber?: string;
}

const dataUrlToBlob = (dataUrl: string): Blob => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const savePhotoToGallery = async (dataUrl: string, phoneNumber?: string): Promise<void> => {
  try {
    const photoId = crypto.randomUUID();
    const fullFileName = `${photoId}-full.jpg`;
    const previewFileName = `${photoId}-preview.jpg`;
    const fullStoragePath = `photos/${fullFileName}`;
    const previewStoragePath = `photos/${previewFileName}`;

    const compressedPreview = await compressImage(dataUrl, 800, 0.7);

    const fullBlob = dataUrlToBlob(dataUrl);
    const previewBlob = dataUrlToBlob(compressedPreview);

    const [fullUpload, previewUpload] = await Promise.all([
      supabase.storage.from('photos').upload(fullFileName, fullBlob, {
        contentType: 'image/jpeg',
        upsert: false
      }),
      supabase.storage.from('photos').upload(previewFileName, previewBlob, {
        contentType: 'image/jpeg',
        upsert: false
      })
    ]);

    if (fullUpload.error) {
      console.error("Error uploading full photo:", fullUpload.error);
      throw fullUpload.error;
    }

    if (previewUpload.error) {
      console.error("Error uploading preview:", previewUpload.error);
      await supabase.storage.from('photos').remove([fullFileName]);
      throw previewUpload.error;
    }

    const { error: dbError } = await supabase
      .from('photos')
      .insert({
        id: photoId,
        storage_path: fullStoragePath,
        preview_path: previewStoragePath,
        phone_number: phoneNumber || null
      });

    if (dbError) {
      console.error("Error saving photo metadata to database:", dbError);
      await supabase.storage.from('photos').remove([fullFileName, previewFileName]);
      throw dbError;
    }

    console.log('Photo and preview saved to Supabase Storage');
  } catch (e) {
    console.error("Error saving photo:", e);
    throw e;
  }
};

export interface GalleryResult {
  photos: SavedPhoto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const getTotalPhotoCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('photos')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Error getting photo count:", error);
      return 0;
    }

    return count || 0;
  } catch (e) {
    console.error("Error getting photo count:", e);
    return 0;
  }
};

export const getGallery = async (page: number = 1, pageSize: number = 30): Promise<GalleryResult> => {
  try {
    const offset = (page - 1) * pageSize;

    const [countResult, photosResult] = await Promise.all([
      getTotalPhotoCount(),
      supabase
        .from('photos')
        .select('id, storage_path, preview_path, created_at, phone_number')
        .order('created_at', { ascending: false })
        .range(offset, offset + pageSize - 1)
    ]);

    const total = countResult;
    const { data, error } = photosResult;

    if (error) {
      console.error("Error fetching gallery:", error);
      return {
        photos: [],
        total: 0,
        page,
        pageSize,
        totalPages: 0
      };
    }

    if (!data) {
      return {
        photos: [],
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      };
    }

    const legacyPhotoIds = data
      .filter(photo => !photo.storage_path && !photo.preview_path)
      .map(photo => photo.id);

    let legacyPhotosData: { [key: string]: string } = {};

    if (legacyPhotoIds.length > 0) {
      const { data: legacyData, error: legacyError } = await supabase
        .from('photos')
        .select('id, image_data')
        .in('id', legacyPhotoIds);

      if (!legacyError && legacyData) {
        legacyPhotosData = legacyData.reduce((acc, photo) => {
          if (photo.image_data) {
            acc[photo.id] = photo.image_data;
          }
          return acc;
        }, {} as { [key: string]: string });
      }
    }

    const photosWithUrls = data.map((photo) => {
      let dataUrl = '';
      let fullSizeUrl = '';

      if (photo.preview_path && photo.storage_path) {
        const previewFileName = photo.preview_path.replace('photos/', '');
        const fullFileName = photo.storage_path.replace('photos/', '');

        const previewUrlData = supabase.storage
          .from('photos')
          .getPublicUrl(previewFileName);

        const fullUrlData = supabase.storage
          .from('photos')
          .getPublicUrl(fullFileName);

        dataUrl = previewUrlData.data.publicUrl;
        fullSizeUrl = fullUrlData.data.publicUrl;
      } else if (photo.storage_path) {
        const fileName = photo.storage_path.replace('photos/', '');
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);
        dataUrl = urlData.publicUrl;
        fullSizeUrl = urlData.publicUrl;
      } else if (legacyPhotosData[photo.id]) {
        dataUrl = legacyPhotosData[photo.id];
        fullSizeUrl = legacyPhotosData[photo.id];
      }

      return {
        id: photo.id,
        timestamp: new Date(photo.created_at).getTime(),
        dataUrl,
        fullSizeUrl,
        phoneNumber: photo.phone_number || undefined
      };
    });

    return {
      photos: photosWithUrls,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
  } catch (e) {
    console.error("Error fetching gallery:", e);
    return {
      photos: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0
    };
  }
};

export const deletePhotoFromGallery = async (id: string): Promise<void> => {
  try {
    const { data: photo } = await supabase
      .from('photos')
      .select('storage_path, preview_path')
      .eq('id', id)
      .maybeSingle();

    if (photo) {
      const filesToDelete = [];
      if (photo.storage_path) {
        filesToDelete.push(photo.storage_path.replace('photos/', ''));
      }
      if (photo.preview_path) {
        filesToDelete.push(photo.preview_path.replace('photos/', ''));
      }

      if (filesToDelete.length > 0) {
        await supabase.storage.from('photos').remove(filesToDelete);
      }
    }

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting photo:", error);
    }
  } catch (e) {
    console.error("Error deleting photo:", e);
  }
};

export const clearGallery = async (): Promise<void> => {
  try {
    const { data: photos } = await supabase
      .from('photos')
      .select('storage_path, preview_path');

    if (photos) {
      const filesToDelete: string[] = [];
      photos.forEach(p => {
        if (p.storage_path) filesToDelete.push(p.storage_path.replace('photos/', ''));
        if (p.preview_path) filesToDelete.push(p.preview_path.replace('photos/', ''));
      });

      if (filesToDelete.length > 0) {
        await supabase.storage
          .from('photos')
          .remove(filesToDelete);
      }
    }

    const { error } = await supabase
      .from('photos')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');

    if (error) {
      console.error("Error clearing gallery:", error);
    }
  } catch (e) {
    console.error("Error clearing gallery:", e);
  }
};