import { supabase } from './supabase';

export interface SavedPhoto {
  id: string;
  timestamp: number;
  dataUrl: string;
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

export const savePhotoToGallery = async (dataUrl: string): Promise<void> => {
  try {
    const photoId = crypto.randomUUID();
    const fileName = `${photoId}.jpg`;
    const storagePath = `photos/${fileName}`;

    const blob = dataUrlToBlob(dataUrl);

    const { error: uploadError } = await supabase.storage
      .from('photos')
      .upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false
      });

    if (uploadError) {
      console.error("Error uploading photo to storage:", uploadError);
      throw uploadError;
    }

    const { error: dbError } = await supabase
      .from('photos')
      .insert({
        id: photoId,
        storage_path: storagePath
      });

    if (dbError) {
      console.error("Error saving photo metadata to database:", dbError);
      await supabase.storage.from('photos').remove([fileName]);
      throw dbError;
    }

    console.log('Photo saved to Supabase Storage');
  } catch (e) {
    console.error("Error saving photo:", e);
    throw e;
  }
};

export const getGallery = async (): Promise<SavedPhoto[]> => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching gallery:", error);
      return [];
    }

    if (!data) return [];

    return data.map(photo => {
      let dataUrl = '';

      if (photo.storage_path) {
        const fileName = photo.storage_path.replace('photos/', '');
        const { data: urlData } = supabase.storage
          .from('photos')
          .getPublicUrl(fileName);
        dataUrl = urlData.publicUrl;
        console.log('Generated public URL:', dataUrl, 'for file:', fileName);
      } else if (photo.image_data) {
        dataUrl = photo.image_data;
      }

      return {
        id: photo.id,
        timestamp: new Date(photo.created_at).getTime(),
        dataUrl
      };
    });
  } catch (e) {
    console.error("Error fetching gallery:", e);
    return [];
  }
};

export const deletePhotoFromGallery = async (id: string): Promise<SavedPhoto[]> => {
  try {
    const { data: photo } = await supabase
      .from('photos')
      .select('storage_path')
      .eq('id', id)
      .maybeSingle();

    if (photo?.storage_path) {
      const fileName = photo.storage_path.replace('photos/', '');
      await supabase.storage
        .from('photos')
        .remove([fileName]);
    }

    const { error } = await supabase
      .from('photos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting photo:", error);
    }

    return await getGallery();
  } catch (e) {
    console.error("Error deleting photo:", e);
    return [];
  }
};

export const clearGallery = async (): Promise<void> => {
  try {
    const { data: photos } = await supabase
      .from('photos')
      .select('storage_path');

    if (photos) {
      const filesToDelete = photos
        .filter(p => p.storage_path)
        .map(p => p.storage_path.replace('photos/', ''));

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