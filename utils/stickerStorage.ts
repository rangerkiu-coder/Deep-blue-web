import { supabase } from './supabase';

export interface CustomSticker {
  id: string;
  name: string;
  image_url: string;
  file_type: string;
  created_at: string;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/webp', 'image/jpeg', 'image/jpg', 'image/svg+xml'];

export const validateStickerFile = (file: File): string | null => {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `Invalid file type. Allowed types: PNG, WEBP, JPG, SVG`;
  }

  if (file.size > MAX_FILE_SIZE) {
    return `File too large. Maximum size: 2MB`;
  }

  return null;
};

export const uploadStickers = async (files: File[]): Promise<{ success: CustomSticker[], errors: { file: string, error: string }[] }> => {
  const success: CustomSticker[] = [];
  const errors: { file: string, error: string }[] = [];

  for (const file of files) {
    const validationError = validateStickerFile(file);
    if (validationError) {
      errors.push({ file: file.name, error: validationError });
      continue;
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('stickers')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        errors.push({ file: file.name, error: uploadError.message });
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('stickers')
        .getPublicUrl(filePath);

      const { data: dbData, error: dbError } = await supabase
        .from('custom_stickers')
        .insert({
          name: file.name,
          image_url: publicUrlData.publicUrl,
          file_type: file.type
        })
        .select()
        .single();

      if (dbError) {
        await supabase.storage.from('stickers').remove([filePath]);
        errors.push({ file: file.name, error: dbError.message });
        continue;
      }

      success.push(dbData);
    } catch (err) {
      errors.push({ file: file.name, error: err instanceof Error ? err.message : 'Unknown error' });
    }
  }

  return { success, errors };
};

export const getCustomStickers = async (): Promise<CustomSticker[]> => {
  try {
    const { data, error } = await supabase
      .from('custom_stickers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching custom stickers:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Error fetching custom stickers:', err);
    return [];
  }
};

export const deleteCustomSticker = async (sticker: CustomSticker): Promise<boolean> => {
  try {
    const urlParts = sticker.image_url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    const { error: storageError } = await supabase.storage
      .from('stickers')
      .remove([fileName]);

    if (storageError) {
      console.error('Error deleting sticker from storage:', storageError);
    }

    const { error: dbError } = await supabase
      .from('custom_stickers')
      .delete()
      .eq('id', sticker.id);

    if (dbError) {
      console.error('Error deleting sticker from database:', dbError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error deleting custom sticker:', err);
    return false;
  }
};
