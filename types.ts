export type LayoutType = 'postcard' | 'strips';

export interface Sticker {
  id: string;
  type: StickerType | string; // StickerType for built-in, string URL for custom
  x: number; // Percentage 0-100 relative to canvas width
  y: number; // Percentage 0-100 relative to canvas height
  scale: number;
  rotation: number;
  isCustom?: boolean; // Flag to indicate if this is a custom uploaded sticker
}

export type StickerType =
  | 'betta'
  | 'starfish'
  | 'shell'
  | 'bubble'
  | 'seaweed'
  | 'coral'
  | 'crab'
  | 'octopus'
  | 'bow'
  | 'sparkles'
  | 'heart'
  | 'jellyfish_cute'
  | 'star_cute'
  | 'clam_cute'
  | 'seahorse'
  | 'narwhal'
  | 'fish'
  | 'shark'
  | 'sailboat'
  | 'turtle'
  | 'dolphin'
  | 'whale'
  | 'pufferfish'
  | 'pearl'
  | 'anchor'
  | 'treasure_chest'
  | 'sea_otter'
  | 'penguin'
  | 'mermaid_tail';

export interface AppState {
  step: 'home' | 'capture' | 'editor' | 'admin';
  layout: LayoutType;
  photos: string[]; // Base64 data URLs
  stickers: Sticker[];
}

export const LAYOUT_CONFIG = {
  postcard: {
    photoCount: 3,
    width: 1200,
    height: 1800,
    aspectRatio: 16/9,
    name: 'The Portrait',
    description: 'A classic 4x6 vertical layout showcasing 3 cinematic portraits.'
  },
  strips: {
    photoCount: 4,
    width: 1200, // Two 2x6 strips side by side = 4x6
    height: 1800,
    aspectRatio: 4/3,
    name: 'Twin Strips',
    description: 'Capture 4 moments, printed as two identical photo strips.'
  }
};