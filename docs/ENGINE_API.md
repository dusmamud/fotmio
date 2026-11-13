# Fotmio Engine API Contract (UI <-> Rust Engine)

Engine ka core rule (locked stack): **bytes-in / bytes-out**. File padhna/likhna UI/wrapper ka kaam hai, engine sirf image bytes leta hai aur compressed bytes deta hai.

## WASM interface (wasm-bindgen)

```ts
// ui/src/engine/wasm se generate hoga (wasm-pack)
export function compress_image(
  input: Uint8Array,
  options_json: string        // CompressOptions ka JSON
): string                      // CompressResult ka JSON (bytes alag call se milenge — neeche dekho)
```

### Pragmatic v1 shape (binary-safe)

WASM se bade bytes JSON me nahi bhejenge. Interface ye rakho:

- `compress_image(input: Uint8Array, options_json: string): Uint8Array`
  Output bytes seedha return honge.
- `last_result_json(): string`
  Pichli `compress_image` call ka metadata JSON (neeche CompressResult, `data` field ke bina).

## CompressOptions

```jsonc
{
  "mode": "target" | "quality" | "maxDimension",
  "targetBytes": 51200,          // mode=target par (e.g. 50 KB = 51200)
  "quality": 82,                 // mode=quality par 1-100; target mode me upper bound
  "maxWidth": 1920,              // optional; mode=maxDimension par lazmi
  "maxHeight": 1920,             // optional
  "format": "jpeg" | "webp" | "png" | "same",
  "stripMetadata": true,         // EXIF/GPS strip (default true — privacy-first)
  "background": "#ffffff"        // alpha -> JPEG/WebP flatten ke liye fill color
}
```

## CompressResult (metadata)

```jsonc
{
  "format": "jpeg",
  "inputBytes": 5242880,
  "outputBytes": 50176,
  "width": 3000,
  "height": 4000,
  "outWidth": 3000,
  "outHeight": 4000,
  "qualityUsed": 63,             // target search ne jo quality chuni
  "scaleUsed": 1.0,              // dimension fallback hua to < 1.0
  "targetMet": true,             // outputBytes <= targetBytes (mode=target par)
  "attempts": 6                  // kitne encode lage
}
```

## Target-size algorithm (locked)

1. Max quality (min(quality, 100)) par 1 encode — fit ho to done.
2. Quality 1..100 binary search, max 10 attempts; **2% tolerance**: result target ke andar aur target ke 98% se upar ho to ruk jao.
3. Quality minimum par bhi overshoot ho to dimension fallback: scale x0.85 steps (max 8 passes, min dimension 64), har pass par search repeat.
4. Poori search me format/background/strip settings FIXED rahenge.

## v1 codec scope

- JPEG encode: `mozjpeg` crate (Jpegli ka mature Rust binding abhi nahi hai — Jpegli C API binding baad ka upgrade hai; stack doc me note hai)
- WebP encode: `webp` crate (libwebp)
- PNG: decode + lossless re-encode via `image` crate; oxipng optimization pass jodne ka hook rakho (v1.1)
- AVIF: v1 me NAHI (WASM me bahut slow) — v2 opt-in
- Decode + resize + EXIF orientation: `image` crate + apna orientation handling
