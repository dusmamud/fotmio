# Fotmio Engine — Build Notes (v1, 2026-11-13)

Crate: `fotmio-engine` — crate-type `cdylib + rlib`, wasm-bindgen exports:
`compress_image(input: &[u8], options_json: &str) -> Vec<u8>` aur
`last_result_json() -> String` (thread-local me last CompressResult ka JSON;
error par `{"error": "..."}` aur khaali Vec return).

Contract: `docs/ENGINE_API.md`. Options/Result JSON bilkul contract ke fields
(camelCase) par hai — serde structs `CompressOptions` / `CompressResult`.

## Verify results (saboot)

- `cargo test` — **2/2 PASS**:
  - `target_mode_hits_50kb_jpeg`: code-generated 800x600 gradient+noise JPEG
    (input > 51,200 bytes) ko target 50 KB (51200) par compress kiya —
    output ≤ 51200, `targetMet=true`, output asal JPEG (magic bytes verify).
  - `quality_mode_single_encode`: quality 50, `qualityUsed=50`, `attempts=1`.
- `wasm-pack build --target web --out-dir ../ui/src/engine/wasm` — **PASS**
  (exit 0). Output: `fotmio_engine_bg.wasm` **2,115,209 bytes (~2.0 MB)**,
  `fotmio_engine.js` + `.d.ts`; d.ts me `compress_image` aur
  `last_result_json` dono exports verify kiye.
  - Ek environment note: pehli run me wasm-pack ka `wasm-opt` (binaryen)
    download fail hua tha (network), isliye Cargo.toml me
    `[package.metadata.wasm-pack.profile.release] wasm-opt = false` rakha
    hai — build hermetic hai, size optimization baad me CI par wasm-opt ke
    saath napna hai.

## Per-format encoder — asal me kya laga

| Format | Native build (desktop/cdylib) | WASM build (web/mobile) |
|---|---|---|
| JPEG | **mozjpeg** crate (0.10.13, `default-features=false` — is sandbox me `nasm` nahi hai, isliye SIMD/nasm features band; progressive mode ON, quality = contract wali) | **image crate ka JpegEncoder** (fallback) — mozjpeg-sys ka C build wasm32 par nahi banta, isliye `#[cfg(target_arch = "wasm32")]` se alag path |
| WebP | **libwebp** (`webp` crate 0.3): quality < 100 par lossy (alpha background par flatten), quality ≥ 100 par lossless (alpha preserve) | **image crate ka WebPEncoder — sirf LOSSLESS** (fallback): wasm par WebP quality slider ka asar nahi padta aur alpha preserve rehta hai |
| PNG | image crate PngEncoder — lossless re-encode (dono builds me yahi) | image crate PngEncoder — lossless re-encode |

Dono cfg paths (native + wasm32) compile verify hain: native `cargo test`
aur wasm32 release build dono PASS.

oxipng abhi NAHI joda (task ke hisaab se v1.1 ka hook hai) — PNG sirf
lossless re-encode hai.

## Target-size algorithm

Contract bilkul waisa implement hai:
1. Max quality (options.quality, default 90, clamp 1–100) par 1 encode — fit ho to done.
2. Quality 1..(qmax-1) binary search, per-dimension-phase max 10 attempts;
   result ≤ target aur ≥ 98% target (2% tolerance band) ho to turant stop,
   warna best valid (sabse badi ≤ target) rakho.
3. Quality floor par bhi overshoot ho to dimension fallback ×0.85
   (max 8 passes, min dimension 64), har pass par search repeat.
4. Poori search me format/background settings fixed.
5. Target kabhi na mile to ab tak ki sabse chhoti output best-effort return
   hoti hai aur result me `targetMet=false` aata hai.

Modes: `quality` = seedha ek encode di gayi quality par (default 82);
`maxDimension` = maxWidth/maxHeight ke andar Lanczos3 resize (sirf shrink,
aspect same) + ek encode. maxWidth/maxHeight quality mode me bhi diye jayein
to pehle fit-within resize lagta hai.

Pipeline: decode (image crate) → EXIF orientation (kamadak-exif se
Orientation tag padh kar rotate/flip apply; EXIF na mile/fail ho to bina
orient aage) → resize → encode.

## Known limitations (v1)

1. **Metadata carry NAHI hota — stripMetadata=false par bhi.** Saare formats
   pixels ko re-encode karte hain, isliye EXIF/GPS/ICC output me nahi jata.
   Ye privacy-first default ke hisaab se theek hai, lekin `stripMetadata:
   false` ka "keep" behaviour v1 me implement NAHI hai (contract ke result
   JSON me koi field nahi badla gaya — ye sirf yahan note hai).
2. **WASM JPEG** mozjpeg ki jagah image-crate encoder hai — same quality par
   output native (mozjpeg) se aam taur par thodi badi hogi.
3. **WASM WebP lossless-only** hai — target mode me WebP ke liye quality
   search size nahi ghata payegi; wahan dimension fallback hi kaam karega.
   (Native par libwebp lossy hai, wahan search normal chalti hai.)
4. **PNG target mode**: PNG lossless hai, quality ka size par koi asar nahi —
   search ke encodes same size dege, phir dimension fallback se target hit
   hoga. Kaam karta hai, lekin PNG par attempts zyada lag sakte hain.
5. EXIF orientation sirf wahi formats par milega jisme kamadak-exif container
   padh sakta hai (JPEG/TIFF/PNG/WebP EXIF); HEIC input v1 ke decode scope
   me nahi hai (stack ke hisaab se OS-native decode wrapper ki zimmedari hai).
6. ICC profiles re-encode me drop ho jate hain (Display P3 → sRGB conversion
   abhi nahi hai) — rang halke dull ho sakte hain P3 photos par. v1.1 item.
7. `compress_image` error par khaali Vec deta hai; wajah `last_result_json()`
   ke `{"error": ...}` me milti hai. UI ko khaali output = error samajhna hoga.
