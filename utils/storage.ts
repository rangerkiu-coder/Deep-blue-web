import { supabase } from './supabase';

export interface SavedPhoto {
  id: string;
  timestamp: number;
  dataUrl: string;
}

export const savePhotoToGallery = async (dataUrl: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('photos')
      .insert({
        image_data: dataUrl
      });

    if (error) {
      console.error("Error saving photo to database:", error);
      throw error;
    }

    console.log('Photo saved to database');
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

    return data.map(photo => ({
      id: photo.id,
      timestamp: new Date(photo.created_at).getTime(),
      dataUrl: photo.image_data
    }));
  } catch (e) {
    console.error("Error fetching gallery:", e);
    return [];
  }
};

export const deletePhotoFromGallery = async (id: string): Promise<SavedPhoto[]> => {
  try {
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