import { generateRealisticImage } from './realistic';
import { generateUnrealisticImage } from './unrealistic';
import { generateDrawingImage } from './drawing';
import { generatePixelArtImage } from './pixelart';
import { generateFastImage } from './fast';
import { generateFreeImage } from './free';

export type ImageType = 'realistic' | 'unrealistic' | 'drawing' | 'pixelart' | 'fast' | 'free';

export const IMAGE_TYPES: Record<ImageType, {
  name: string;
  description: string;
  generator: (prompt: string) => Promise<Blob>;
}> = {
  realistic: {
    name: 'Realistic',
    description: 'Generate images in real life',
    generator: generateRealisticImage,
  },
  unrealistic: {
    name: 'Un-realistic',
    description: 'Create surreal and unrealistic images',
    generator: generateUnrealisticImage,
  },
  drawing: {
    name: 'Drawing',
    description: 'Generate hand-drawn and manga style images',
    generator: generateDrawingImage,
  },
  pixelart: {
    name: 'Pixel Art',
    description: 'Create pixel art style images',
    generator: generatePixelArtImage,
  },
  fast: {
    name: 'Fast',
    description: 'Quick image generation with lower quality',
    generator: generateFastImage,
  },
  free: {
    name: 'Free',
    description: 'Generate images in lower quality',
    generator: generateFreeImage,
  },
};

export function getImageGenerator(type: ImageType) {
  return IMAGE_TYPES[type].generator;
}