export interface DuotoneConfig {
    bg: string;
    filter: string;
    blendMode?: string;
}

export interface ImageFilterConfig {
    brightness: number;
    contrast: number;
    saturate: number;
    blur: number;
    grayscale: number;
    sepia: number;
    hueRotate: number;
    preset: string;
    pixelsFilter?: string;
    processedImageUrl?: string;
    duotone?: DuotoneConfig;
    intensity: number; // 0-100
}
