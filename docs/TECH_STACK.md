# Image Compressor App — LOCKED TECH STACK

**Status: LOCKED by user, 2026-11-13.**
Fresh project (user instruction: ShrinkIt ko ignore karna hai — purani app se koi connection nahi).
Research basis: 3-agent Exa cross-verified research, 2026-11-13 (framework comparison, compression engines, competitor/features) + architecture verification (engine = assembled libraries + own logic; wrappers need no native-language apps; single monorepo — Hub33 example).

## Product shape

- Ek app, 5 jagah: **Android, iOS, Windows, macOS, Web**
- Flow: **Image select → Target size set → Result screen**
- Shartein: app size chhota, maximum features + full control, fast
- 100% offline / privacy-first (Dusrel DNA): koi upload, koi account, koi ads nahi

## Sirf 2 language

- **TypeScript** → UI
- **Rust** → Engine
- Kotlin/Swift sirf tab, agar koi plugin missing ho (is app me known features ke liye nahi chahiye)

## 1. UI Layer (ek codebase, sab jagah)

- Language: TypeScript (+ HTML/CSS)
- Framework: **Svelte** (compile-away, sabse chhota bundle, tez)
- Build tool: **Vite**
- Styling: CSS / Tailwind; dark mode OS sync
- i18n: English + Hindi (JSON dictionary, kumbuild pattern)

## 2. Engine — ek Rust crate, do roop

- **WASM** (wasm-pack / wasm-bindgen) → Web + mobile WebView
- **Native cdylib** → Tauri desktop (full speed)
- Design rule: core **bytes-in / bytes-out** (browser me filesystem nahi); file I/O wrapper ka kaam
- Batch: native par rayon (parallel), WASM par Web Workers

## 3. Codecs (format-wise)

| Format | Library | Notes |
|---|---|---|
| JPEG main | **Jpegli** | Human-rater study: same quality par MozJPEG se ~26%, libjpeg-turbo se ~36% kam bits |
| JPEG Max mode | MozJPEG | 4–7× slow — sirf "Max quality (slow)" option |
| JPEG preview | libjpeg-turbo | Fast first pass / estimate |
| WebP | **libwebp** | Native `target_size` — encoder khud search karta hai; method 4 default, 6 max |
| PNG lossless | **oxipng** | `-o 2` default, `-o 4` high; Zopfli sirf desktop Max opt-in (35–70× time ≈ ~1% extra) |
| PNG lossy | ❌ SKIP | **libimagequant/pngquant = GPLv3 ya $950/yr commercial license** — iski jagah lossy WebP/AVIF |
| AVIF | **libavif + libaom** | Best quality-per-byte; speed 6–8; target mode me iterations 2–3 hi (mobile par slow) |
| JPEG XL | libjxl | v1 me NAHI; baad me opt-in (Android gallery/Edge support gap) |
| HEIC | Input only | OS native decode; **encode NEVER** (x265 GPL + HEVC patent pools) |
| Helpers | `image` crate (decode), `fast_image_resize` (SIMD, Lanczos3/Catmull-Rom), `kamadak-exif`, **lcms2** (ICC, Display P3 → sRGB) | |

## 4. Target-Size Logic (apni likhi hui — product ka dil; libcaesium pattern as reference/base)

1. Max quality par 1 encode — fit ho to done
2. Quality 1–100 **binary search** (~7–10 encodes), poori search me subsampling/progressive/metadata settings FIXED
3. **2% tolerance** par stop — user promise: "target ya usse kam, best quality" (byte-exact guarantee koi nahi deta)
4. Quality min par bhi bada ho tabhi **dimension fallback** (0.85× steps, max ~8 passes, min dim 64) — quality pehle, resize aakhir me
5. Slow encoders (AVIF/JXL) ke liye entropy-based first guess, phir 2–3 verification encodes
6. Pipeline order: `decode → EXIF auto-orient → resize → encode → metadata write-back (optional)`
   - EXIF modes: Strip All / Keep All / Privacy-only strip (GPS, serial) / copyright rakho
   - ICC rule: ya rakho, ya sRGB convert — andha strip kabhi nahi (P3 colors dull ho jate hain)

## 5. Wrappers (sirf config/shell, app code nahi)

| Platform | Tech | Plugins |
|---|---|---|
| Web | **PWA** (Service Worker offline + installable manifest) | — |
| Android / iOS | **Capacitor** | `@capacitor/camera` (select), `@capacitor/filesystem`, `@capacitor/share` — sab official |
| Windows / macOS | **Tauri 2** | `dialog` (file picker), `fs` — official; share ke liye community sharesheet plugin (Tauri ka official share plugin nahi hai) |

## 6. Repo — ek monorepo

```
repo/
├── ui/        → Svelte app (sab jagah yahi UI)
├── engine/    → Rust crate (codecs + target-size logic)
├── desktop/   → Tauri config
├── mobile/    → Capacitor config
Tooling: pnpm workspaces + Turborepo
```

(Real-world saboot: Hub33 — apps/web + Tauri desktop "UI: Reuses apps/web (zero duplication)" + Capacitor mobile, ek Turborepo monorepo.)

## 7. Build & Release

- GitHub Actions: har platform ki alag job (ek repo ≠ ek build)
- Web → static PWA deploy · Android → **AAB** (Play; direct APK ho to split-per-abi) · iOS/macOS → **macOS runner + Xcode**, signing/notarization (Apple ki shart) · Windows → installer / MSIX (MS Store)
- Release se pehle **SBOM/license audit** lazmi (koi GPL dependency chhup kar na aaye)

## 8. NAHI use hoga

- ❌ pngquant/libimagequant (GPL/$950) · ❌ HEIC encode (patent + GPL) · ❌ libvips (LGPL, ~16 MB, iOS static-link dikkat) · ❌ ImageMagick bundle (bada, slow) · ❌ flutter_image_compress-type plugins (control zero) · ❌ Cloud upload (privacy)

## 9. Caveats (research se verified)

- WebView UI: native feel ~90–95% realistic (3-screen utility app me fark practically nahi dikhta); purane Android WebView (Chromium 83–99) par blank-screen risk; iOS par badi 50MP photos ek-ek karke process (WebView memory)
- Rust stack ka exact binary size UNVERIFIED hai — pehle prototype build par AAB/APK analyzer se napna hai
- Features (research-locked direction): teen mode (Target Size / Quality / Max Dimension), KB chips 20/50/100/200/500/1MB + **Govt Form preset pack (SSC 20–50 KB, UPSC 20–300 KB, passport 35×45 mm, white background fill)**, batch + folder + drag-drop + share-sheet input, live estimate, compare slider + zoom, EXIF strip/keep + GPS warning, rename patterns + output folder rules, original kabhi default overwrite nahi

## Naam — LOCKED

- **Naam LOCKED by user, 2026-11-13: Fotmio**
- Full name: **Fotmio – Photo Compressor & Image Resizer** · Short name: **Fotmio**
- User decision: domain/trademark check NAHI karna hai ("Domain trademark check karne ki jarurat nahi hai") — ye step user ke kehne par skip kiya gaya.
- Naam research summary: 100+ coined candidates, 3-agent collision check; Fotmio par App Store API 0 results, Play Store/web par koi brand/app/company nahi mila. Rejected: PixFit (pixfit.ai exist), ByteFit (usi naam ka competitor compressor app exist), Pixora/Kompact/Kompix/Pixpress/Sizely (existing compressor apps).
- User ne 2026-11-13 ko isi locked stack ke saath **code likhna start karne** ka order diya; beech me jo sawaal aaye, user se puchne hain.
