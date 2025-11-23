// PixelsJS wrapper - carrega a biblioteca via CDN e expõe os métodos

declare global {
  interface Window {
    pixelsJS: {
      filterImgData: (imgData: ImageData, filterName: string) => ImageData;
      getFilterList: () => string[];
    };
  }
}

let isLoaded = false;
let loadPromise: Promise<void> | null = null;

/**
 * Carrega o PixelsJS via CDN
 */
export const loadPixelsJS = (): Promise<void> => {
  if (isLoaded) return Promise.resolve();
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/gh/silvia-odwyer/pixels.js@0.8.1/dist/Pixels.js";
    script.async = true;
    script.onload = () => {
      isLoaded = true;
      resolve();
    };
    script.onerror = () => {
      reject(new Error("Failed to load PixelsJS"));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * Aplica um filtro PixelsJS a uma imagem
 */
export const applyPixelsFilter = async (
  imageUrl: string,
  filterName: string,
): Promise<string> => {
  await loadPixelsJS();

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (filterName && window.pixelsJS) {
          const filteredData = window.pixelsJS.filterImgData(
            imgData,
            filterName,
          );
          ctx.putImageData(filteredData, 0, 0);
        }

        resolve(canvas.toDataURL("image/png"));
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    img.src = imageUrl;
  });
};

/**
 * Lista oficial de filtros do PixelsJS
 */
export const ALL_PIXELS_FILTERS = [
  { name: "Linhas H", filter: "horizontal_lines" },
  { name: "Extreme Blue", filter: "extreme_offset_blue" },
  { name: "Extreme Green", filter: "extreme_offset_green" },
  { name: "Offset Green", filter: "offset_green" },
  { name: "Extra Blue", filter: "extra_offset_blue" },
  { name: "Extra Red", filter: "extra_offset_red" },
  { name: "Extra Green", filter: "extra_offset_green" },
  { name: "Extreme Red", filter: "extreme_offset_red" },
  { name: "Redscale", filter: "specks_redscale" },
  { name: "Eclectic", filter: "eclectic" },
  { name: "Pane", filter: "pane" },
  { name: "Linhas D", filter: "diagonal_lines" },
  { name: "Green Specks", filter: "green_specks" },
  { name: "Casino", filter: "casino" },
  { name: "Yellow Casino", filter: "yellow_casino" },
  { name: "Green Diag", filter: "green_diagonal_lines" },
  { name: "Offset", filter: "offset" },
  { name: "Offset Blue", filter: "offset_blue" },
  { name: "Neue", filter: "neue" },
  { name: "Sunset", filter: "sunset" },
  { name: "Specks", filter: "specks" },
  { name: "Wood", filter: "wood" },
  { name: "Lix", filter: "lix" },
  { name: "Ryo", filter: "ryo" },
  { name: "Bluescale", filter: "bluescale" },
  { name: "Solange", filter: "solange" },
  { name: "Evening", filter: "evening" },
  { name: "Crimson", filter: "crimson" },
  { name: "Teal", filter: "teal_min_noise" },
  { name: "Phase", filter: "phase" },
  { name: "Purple", filter: "dark_purple_min_noise" },
  { name: "Coral", filter: "coral" },
  { name: "Darkify", filter: "darkify" },
  { name: "Brilho +", filter: "incbrightness" },
  { name: "Brilho ++", filter: "incbrightness2" },
  { name: "Invert", filter: "invert" },
  { name: "Saturação", filter: "sat_adj" },
  { name: "Lemon", filter: "lemon" },
  { name: "Pink", filter: "pink_min_noise" },
  { name: "Frontward", filter: "frontward" },
  { name: "Vintage", filter: "vintage" },
  { name: "Perfume", filter: "perfume" },
  { name: "Serenity", filter: "serenity" },
  { name: "Pink Aura", filter: "pink_aura" },
  { name: "Haze", filter: "haze" },
  { name: "Cool Twilight", filter: "cool_twilight" },
  { name: "Blues", filter: "blues" },
  { name: "Horizon", filter: "horizon" },
  { name: "Mellow", filter: "mellow" },
  { name: "Solange Dark", filter: "solange_dark" },
  { name: "Solange Grey", filter: "solange_grey" },
  { name: "Zapt", filter: "zapt" },
  { name: "Eon", filter: "eon" },
  { name: "Aeon", filter: "aeon" },
  { name: "Matrix", filter: "matrix" },
  { name: "Cosmic", filter: "cosmic" },
  { name: "Min Noise", filter: "min_noise" },
  { name: "Red Noise", filter: "red_min_noise" },
  { name: "Matrix 2", filter: "matrix2" },
  { name: "Purplescale", filter: "purplescale" },
  { name: "Radio", filter: "radio" },
  { name: "Twenties", filter: "twenties" },
  { name: "Ocean", filter: "ocean" },
  { name: "A", filter: "a" },
  { name: "Pixel Blue", filter: "pixel_blue" },
  { name: "Greyscale", filter: "greyscale" },
  { name: "Grime", filter: "grime" },
  { name: "Red Grey", filter: "redgreyscale" },
  { name: "Retroviolet", filter: "retroviolet" },
  { name: "Green Grey", filter: "greengreyscale" },
  { name: "Warmth", filter: "warmth" },
  { name: "Green Med", filter: "green_med_noise" },
  { name: "Green Noise", filter: "green_min_noise" },
  { name: "Blue Noise", filter: "blue_min_noise" },
  { name: "Rosetint", filter: "rosetint" },
  { name: "Purple Noise", filter: "purple_min_noise" },
];
