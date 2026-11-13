/* =============================================================================
   FALLBACK ENGINE (JS / Canvas API) — NOT the real Fotmio engine.

   This is a stand-in used only when the Rust/WASM engine in ./wasm/ has not
   been built yet, so the app stays fully usable during development. It
   compresses with the browser's Canvas encoder (JPEG / WebP / PNG):

   - quality mode : one canvas encode at the requested quality
   - target mode  : binary search over canvas quality (same locked algorithm
                    as the Rust engine: max quality first, 2% tolerance,
                    then a x0.85 dimension fallback)
   - resize mode  : downscale to fit maxWidth / maxHeight, then encode

   Known fallback limits vs. the Rust engine: no MozJPEG/Jpegli, no oxipng,
   no ICC handling, PNG output is lossless-only (target mode then relies on
   the dimension fallback). Re-encoding through canvas always drops EXIF, so
   stripMetadata is honoured implicitly; "keep metadata" is only available
   with the WASM engine.
   ============================================================================= */

import type {
  CompressedOutput,
  CompressOptions,
  CompressResult,
  OutputFormat,
} from './types'

const MIME: Record<OutputFormat, string> = {
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  png: 'image/png',
}

function resolveFormat(inputMime: string, requested: CompressOptions['format']): OutputFormat {
  if (requested !== 'same') return requested
  if (inputMime === 'image/png') return 'png'
  if (inputMime === 'image/webp') return 'webp'
  return 'jpeg'
}

function loadBitmap(bytes: Uint8Array): Promise<ImageBitmap> {
  // 'from-image' applies EXIF orientation, matching the engine pipeline order.
  return createImageBitmap(new Blob([bytes.buffer as ArrayBuffer]), {
    imageOrientation: 'from-image',
  })
}

interface EncodeOutcome {
  bytes: Uint8Array
  width: number
  height: number
}

async function encodeOnce(
  bitmap: ImageBitmap,
  format: OutputFormat,
  quality: number,
  scale: number,
  background: string,
): Promise<EncodeOutcome> {
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas 2D context is not available in this browser.')
  if (format === 'jpeg') {
    // JPEG has no alpha channel — flatten onto the chosen background colour.
    ctx.fillStyle = background || '#ffffff'
    ctx.fillRect(0, 0, width, height)
  }
  ctx.drawImage(bitmap, 0, 0, width, height)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, MIME[format], format === 'png' ? undefined : quality / 100),
  )
  if (!blob) throw new Error(`Browser could not encode ${format.toUpperCase()}.`)
  return { bytes: new Uint8Array(await blob.arrayBuffer()), width, height }
}

export async function compressWithFallback(
  input: Uint8Array,
  inputMime: string,
  options: CompressOptions,
): Promise<CompressedOutput> {
  const format = resolveFormat(inputMime, options.format)
  const bitmap = await loadBitmap(input)
  try {
    const cap = Math.min(100, Math.max(1, Math.round(options.quality ?? 82)))
    let attempts = 0
    let best: { outcome: EncodeOutcome; quality: number; scale: number } | null = null

    /** Encode at (quality, scale) and remember it if it is the best fit so far. */
    const attempt = async (
      quality: number,
      scale: number,
      wantFit: (size: number) => boolean,
    ): Promise<EncodeOutcome> => {
      const outcome = await encodeOnce(bitmap, format, quality, scale, options.background)
      attempts++
      if (wantFit(outcome.bytes.length)) {
        if (!best || outcome.bytes.length > best.outcome.bytes.length) {
          best = { outcome, quality, scale }
        }
      }
      return outcome
    }

    if (options.mode === 'quality') {
      const outcome = await encodeOnce(bitmap, format, cap, 1, options.background)
      attempts = 1
      best = { outcome, quality: cap, scale: 1 }
    } else if (options.mode === 'maxDimension') {
      const maxW = options.maxWidth && options.maxWidth > 0 ? options.maxWidth : Infinity
      const maxH = options.maxHeight && options.maxHeight > 0 ? options.maxHeight : Infinity
      const scale = Math.min(1, maxW / bitmap.width, maxH / bitmap.height)
      const outcome = await encodeOnce(bitmap, format, cap, scale, options.background)
      attempts = 1
      best = { outcome, quality: cap, scale }
    } else {
      // ---- target mode: locked algorithm (see docs/ENGINE_API.md) ----
      const target = options.targetBytes ?? 0
      if (target <= 0) throw new Error('Target size is missing.')
      let scale = 1
      let done = false
      for (let pass = 0; pass <= 8 && !done; pass++) {
        // Step 1: one encode at max quality — many photos already fit here.
        const first = await attempt(cap, scale, (s) => s <= target)
        if (first.bytes.length <= target) {
          // Fits. Within the 2% tolerance band, or already at max quality
          // (cannot get closer without lowering quality): accept.
          done = true
          break
        }
        // Step 2: binary search quality 1..cap (skipped for lossless PNG).
        if (format !== 'png') {
          let lo = 1
          let hi = cap - 1
          while (lo <= hi && attempts < 10 + pass * 10) {
            const mid = Math.floor((lo + hi) / 2)
            const out = await attempt(mid, scale, (s) => s <= target)
            if (out.bytes.length <= target) {
              if (out.bytes.length >= target * 0.98) {
                done = true
                break
              }
              lo = mid + 1 // fits with room to spare — try better quality
            } else {
              hi = mid - 1
            }
          }
          if (done || best) break
        }
        // Step 3: dimension fallback (x0.85), only if nothing fit yet.
        if (best) break
        const nextScale = scale * 0.85
        if (Math.min(bitmap.width, bitmap.height) * nextScale < 64) break
        scale = nextScale
      }
      if (!best) {
        // Nothing ever fit — return the smallest encode we can produce so the
        // user still gets a file, flagged as target-not-met.
        const outcome = await encodeOnce(bitmap, format, 1, scale, options.background)
        attempts++
        best = { outcome, quality: 1, scale }
      }
    }

    const chosen = best as { outcome: EncodeOutcome; quality: number; scale: number }
    const meta: CompressResult = {
      format,
      inputBytes: input.length,
      outputBytes: chosen.outcome.bytes.length,
      width: bitmap.width,
      height: bitmap.height,
      outWidth: chosen.outcome.width,
      outHeight: chosen.outcome.height,
      qualityUsed: format === 'png' ? 100 : chosen.quality,
      scaleUsed: chosen.scale,
      targetMet:
        options.mode === 'target'
          ? chosen.outcome.bytes.length <= (options.targetBytes ?? 0)
          : true,
      attempts,
    }
    return { data: chosen.outcome.bytes, meta, engine: 'fallback' }
  } finally {
    bitmap.close()
  }
}
