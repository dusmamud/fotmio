/* Locale dictionary: English (India) — the source of truth for the
   Dictionary type. Every UI string lives here (or in hi-IN.ts);
   components must not hard-code copy. Placeholders use {name} syntax
   and are filled with interpolate() from ./index. */

const enIN = {
  app: {
    tagline: 'Photo Compressor & Image Resizer',
    privacy:
      '100% offline — your photos never leave this device. No uploads, no account, no ads.',
    steps: {
      select: 'Select',
      settings: 'Settings',
      results: 'Results',
    },
    progress: 'Progress',
    language: 'Language',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    footer: 'Fotmio by Dusrel — free, private, offline photo compression for every device.',
  },
  select: {
    heading: 'Select photos',
    intro:
      'Everything is processed on this device — nothing is uploaded, ever. Add one photo or a whole batch.',
    addImages: 'Add images',
    dropTitle: 'Drag & drop images here',
    dropOr: 'or',
    dropBrowse: 'browse your files',
    dropFormats: '— JPEG, PNG, WebP and more',
    skippedOne: 'Skipped {count} file that could not be read as an image: {names}',
    skippedMany: 'Skipped {count} files that could not be read as an image: {names}',
    remove: 'Remove {name}',
    selectedOne: '{count} photo · {total} total',
    selectedMany: '{count} photos · {total} total',
    clearAll: 'Clear all',
    continue: 'Continue',
    addMore: 'Add more',
    features: {
      heading: 'Why Fotmio?',
      offlineTitle: '100% private & offline',
      offlineText: 'Photos are compressed on this device — nothing is ever uploaded.',
      speedTitle: 'Fast Rust engine',
      speedText: 'A native-speed engine finds the best quality that fits your size.',
      batchTitle: 'Batch & any format',
      batchText: 'Compress many photos at once — JPEG, PNG, WebP and more.',
    },
  },
  target: {
    heading: 'Compression settings',
    appliedOne: 'These settings will apply to the selected photo.',
    appliedMany: 'These settings will apply to all {count} selected photos.',
    modeAria: 'Compression mode',
    tabs: {
      target: 'Target Size',
      quality: 'Quality',
      resize: 'Resize',
    },
    help: {
      target:
        'Fotmio finds the highest quality that still fits your target size — the setting you need for online forms and portals with a KB limit.',
      quality:
        'One quality level for every photo. Higher means closer to the original, lower means a smaller file.',
      maxDimension:
        'Shrink large photos to a maximum width and height. Photos are never enlarged.',
    },
    targetSize: 'Target size',
    presets: {
      label: 'Form presets',
      ssc: 'SSC · 50 KB',
      upsc: 'UPSC · 300 KB',
      passport: 'Passport · White BG',
    },
    customSize: 'Custom size',
    kb: 'KB',
    maxWidth: 'Max width (px)',
    maxHeight: 'Max height (px)',
    noLimit: 'No limit',
    quality: 'Quality',
    qualityCap: 'Quality cap',
    smallerFile: 'Smaller file',
    betterQuality: 'Better quality',
    outputFormat: 'Output format',
    sameAsOriginal: 'Same as original',
    formatHelp: {
      same: 'Keeps each photo in the format it already is.',
      jpeg: 'Widest compatibility — accepted everywhere. Transparency is flattened onto the background colour below.',
      webp: 'Usually smaller than JPEG at the same quality, and supported by all modern browsers and apps.',
      png: 'Lossless, so files stay large. Best for graphics and screenshots; a photo target size is reached by resizing if needed.',
    },
    backgroundFill: 'Background fill',
    backgroundHexAria: 'Background colour hex value',
    backgroundHelp: 'Fills transparent areas when a photo is saved without transparency.',
    stripTitle: 'Strip metadata (EXIF & GPS)',
    stripHelp: 'Removes location and camera details from the compressed files. Recommended.',
    back: 'Back',
    compressing: 'Compressing…',
    compressOne: 'Compress {count} photo',
    compressMany: 'Compress {count} photos',
    progress: 'Compressing {current} of {total} — {name}',
  },
  results: {
    heading: 'Results',
    summaryOne: '{count} photo compressed: {original} → {output} · {savings}',
    summaryMany: '{count} photos compressed: {original} → {output} · {savings}',
    smaller: '{percent} smaller',
    larger: '{percent} larger',
    sameSize: 'Same size',
    noneCompressed: 'No photos were compressed — see the problems below.',
    failedHeadingOne: 'Could not compress {count} file',
    failedHeadingMany: 'Could not compress {count} files',
    backToSettings: 'Back to settings',
    compressMore: 'Compress more photos',
  },
  resultCard: {
    rustEngine: 'Rust engine',
    browserEngine: 'Browser engine',
    rustEngineTitle: 'Compressed by the Rust/WASM engine',
    browserEngineTitle: 'Compressed by the built-in browser fallback engine',
    previewVersion: 'Preview version',
    before: 'Before',
    after: 'After',
    compressedAlt: 'Compressed version of {name}',
    originalAlt: 'Original version of {name}',
    targetNotMet:
      'The target size could not be reached at these settings — this is the smallest file Fotmio could produce for this photo.',
    format: 'Format',
    dimensions: 'Dimensions',
    qualityUsed: 'Quality used',
    lossless: 'Lossless',
    was: '(was {dimensions})',
    download: 'Download',
  },
}

export type Dictionary = typeof enIN
export default enIN
