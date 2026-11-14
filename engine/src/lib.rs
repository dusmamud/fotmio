//! Fotmio compression engine — bytes-in / bytes-out.
//! Contract: `docs/ENGINE_API.md` (project root ke `docs/` me).
//!
//! Pipeline: decode (image crate) -> EXIF auto-orient (kamadak-exif)
//! -> optional resize -> encode (JPEG / WebP / PNG).
//! Target-size mode: max-quality encode -> quality binary search
//! (max 10 attempts, 2% tolerance) -> dimension fallback x0.85
//! (max 8 passes, min dimension 64).

use std::cell::RefCell;
use std::io::Cursor;

#[cfg(test)]
use image::codecs::jpeg::JpegEncoder;
use image::codecs::png::PngEncoder;
#[cfg(target_arch = "wasm32")]
use image::codecs::webp::WebPEncoder;
use image::imageops::FilterType;
use image::{DynamicImage, ExtendedColorType, GenericImageView, ImageEncoder, ImageFormat};
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

// ---------------------------------------------------------------------------
// Contract types (docs/ENGINE_API.md)
// ---------------------------------------------------------------------------

#[derive(Debug, Clone, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CompressOptions {
    /// "target" | "quality" | "maxDimension"
    pub mode: String,
    #[serde(default)]
    pub target_bytes: Option<u64>,
    /// mode=quality par 1-100; mode=target par upper bound.
    #[serde(default)]
    pub quality: Option<u8>,
    #[serde(default)]
    pub max_width: Option<u32>,
    #[serde(default)]
    pub max_height: Option<u32>,
    /// "jpeg" | "webp" | "png" | "same"
    #[serde(default)]
    pub format: Option<String>,
    #[serde(default)]
    pub strip_metadata: Option<bool>,
    /// Alpha flatten ke liye background, hex e.g. "#ffffff".
    #[serde(default)]
    pub background: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompressResult {
    pub format: String,
    pub input_bytes: usize,
    pub output_bytes: usize,
    pub width: u32,
    pub height: u32,
    pub out_width: u32,
    pub out_height: u32,
    pub quality_used: u8,
    pub scale_used: f64,
    pub target_met: bool,
    pub attempts: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum OutFormat {
    Jpeg,
    Webp,
    Png,
}

impl OutFormat {
    fn as_str(&self) -> &'static str {
        match self {
            OutFormat::Jpeg => "jpeg",
            OutFormat::Webp => "webp",
            OutFormat::Png => "png",
        }
    }
}

// ---------------------------------------------------------------------------
// WASM interface (wasm-bindgen) — contract ki pragmatic v1 shape
// ---------------------------------------------------------------------------

thread_local! {
    static LAST_RESULT_JSON: RefCell<String> = const { RefCell::new(String::new()) };
}

fn set_last_result(json: String) {
    LAST_RESULT_JSON.with(|cell| *cell.borrow_mut() = json);
}

/// Image bytes lo, compressed bytes wapas do. Metadata `last_result_json()` se milega.
/// Error par khaali Vec return hota hai aur last_result_json me `{"error": "..."}` milta hai.
#[wasm_bindgen]
pub fn compress_image(input: &[u8], options_json: &str) -> Vec<u8> {
    match compress_with_json(input, options_json) {
        Ok((bytes, result)) => {
            set_last_result(serde_json::to_string(&result).unwrap_or_default());
            bytes
        }
        Err(e) => {
            let err_json = serde_json::json!({ "error": e }).to_string();
            set_last_result(err_json);
            Vec::new()
        }
    }
}

/// Pichli `compress_image` call ka CompressResult JSON (bina image bytes ke).
#[wasm_bindgen]
pub fn last_result_json() -> String {
    LAST_RESULT_JSON.with(|cell| cell.borrow().clone())
}

// ---------------------------------------------------------------------------
// Core (native tests + wasm wrapper dono yahi use karte hain)
// ---------------------------------------------------------------------------

pub fn compress_with_json(
    input: &[u8],
    options_json: &str,
) -> Result<(Vec<u8>, CompressResult), String> {
    let options: CompressOptions =
        serde_json::from_str(options_json).map_err(|e| format!("options JSON invalid: {e}"))?;
    compress_core(input, &options)
}

pub fn compress_core(
    input: &[u8],
    options: &CompressOptions,
) -> Result<(Vec<u8>, CompressResult), String> {
    let input_bytes = input.len();
    let input_format = image::guess_format(input).ok();

    // 1) Decode.
    let decoded = image::load_from_memory(input).map_err(|e| format!("image decode fail: {e}"))?;

    // 2) EXIF auto-orient (fail ho to bina orient aage badho).
    let img = match read_exif_orientation(input) {
        Some(orientation) => apply_orientation(decoded, orientation),
        None => decoded,
    };
    let (base_w, base_h) = img.dimensions();

    // Output format resolve: "same" -> input format; unknown input -> JPEG.
    let out_format = resolve_out_format(options.format.as_deref(), input_format);
    let background = parse_background(options.background.as_deref());

    let quality_default: u8 = 82;
    let (out_bytes, out_img, quality_used, attempts) = match options.mode.as_str() {
        "target" => {
            let base = fit_within(&img, options.max_width, options.max_height);
            let r = target_search(&base, out_format, options, background)?;
            (r.bytes, r.img, r.quality, r.attempts)
        }
        "maxDimension" => {
            let resized = fit_within(&img, options.max_width, options.max_height);
            let q = clamp_quality(options.quality.unwrap_or(quality_default));
            let bytes = encode(&resized, out_format, q, background)?;
            (bytes, resized, q, 1)
        }
        // "quality" (aur koi bhi unknown mode ke liye yahi safe default)
        _ => {
            let resized = fit_within(&img, options.max_width, options.max_height);
            let q = clamp_quality(options.quality.unwrap_or(quality_default));
            let bytes = encode(&resized, out_format, q, background)?;
            (bytes, resized, q, 1)
        }
    };

    let (out_w, out_h) = out_img.dimensions();
    let target_met = match options.target_bytes {
        Some(t) => (out_bytes.len() as u64) <= t,
        None => false,
    };
    let result = CompressResult {
        format: out_format.as_str().to_string(),
        input_bytes,
        output_bytes: out_bytes.len(),
        width: base_w,
        height: base_h,
        out_width: out_w,
        out_height: out_h,
        quality_used,
        scale_used: if base_w > 0 {
            out_w as f64 / base_w as f64
        } else {
            1.0
        },
        target_met,
        attempts,
    };
    Ok((out_bytes, result))
}

fn clamp_quality(q: u8) -> u8 {
    q.clamp(1, 100)
}

fn resolve_out_format(requested: Option<&str>, input_format: Option<ImageFormat>) -> OutFormat {
    match requested {
        Some("jpeg") => OutFormat::Jpeg,
        Some("webp") => OutFormat::Webp,
        Some("png") => OutFormat::Png,
        // "same" / missing / unknown -> input format rakho
        _ => match input_format {
            Some(ImageFormat::Png) => OutFormat::Png,
            Some(ImageFormat::WebP) => OutFormat::Webp,
            _ => OutFormat::Jpeg,
        },
    }
}

fn parse_background(value: Option<&str>) -> (u8, u8, u8) {
    let fallback = (255, 255, 255);
    let Some(raw) = value else { return fallback };
    let hex = raw.trim().strip_prefix('#').unwrap_or(raw.trim());
    if hex.len() != 6 {
        return fallback;
    }
    let parse = |s: &str| u8::from_str_radix(s, 16).ok();
    match (parse(&hex[0..2]), parse(&hex[2..4]), parse(&hex[4..6])) {
        (Some(r), Some(g), Some(b)) => (r, g, b),
        _ => fallback,
    }
}

// ---------------------------------------------------------------------------
// EXIF orientation (kamadak-exif) — fail = None, koi error nahi
// ---------------------------------------------------------------------------

fn read_exif_orientation(input: &[u8]) -> Option<u32> {
    let mut cursor = Cursor::new(input);
    let reader = exif::Reader::new();
    let exif_data = reader.read_from_container(&mut cursor).ok()?;
    let field = exif_data.get_field(exif::Tag::Orientation, exif::In::PRIMARY)?;
    field.value.get_uint(0)
}

fn apply_orientation(img: DynamicImage, orientation: u32) -> DynamicImage {
    match orientation {
        2 => img.fliph(),
        3 => img.rotate180(),
        4 => img.flipv(),
        5 => img.rotate90().fliph(),
        6 => img.rotate90(),
        7 => img.rotate270().fliph(),
        8 => img.rotate270(),
        _ => img, // 1 = normal, baaki unknown = as-is
    }
}

// ---------------------------------------------------------------------------
// Resize helper
// ---------------------------------------------------------------------------

/// maxWidth/maxHeight ke andar fit karo (sirf shrink, aspect ratio same).
fn fit_within(img: &DynamicImage, max_w: Option<u32>, max_h: Option<u32>) -> DynamicImage {
    let (w, h) = img.dimensions();
    let mw = max_w.unwrap_or(w);
    let mh = max_h.unwrap_or(h);
    if w <= mw && h <= mh {
        img.clone()
    } else {
        img.resize(mw, mh, FilterType::Lanczos3)
    }
}

// ---------------------------------------------------------------------------
// Alpha flatten (JPEG / WebP-lossy ke liye background par)
// ---------------------------------------------------------------------------

fn flatten(img: &DynamicImage, bg: (u8, u8, u8)) -> DynamicImage {
    let rgba = img.to_rgba8();
    let mut out = image::RgbImage::new(rgba.width(), rgba.height());
    for (x, y, p) in rgba.enumerate_pixels() {
        let a = p[3] as u32;
        let blend =
            |fg: u8, bgc: u8| -> u8 { ((fg as u32 * a + bgc as u32 * (255 - a)) / 255) as u8 };
        out.put_pixel(
            x,
            y,
            image::Rgb([blend(p[0], bg.0), blend(p[1], bg.1), blend(p[2], bg.2)]),
        );
    }
    DynamicImage::ImageRgb8(out)
}

/// ImageEncoder::write_image ke liye helper: image ko uske color type ke
/// hisaab se raw bytes me badal kar encoder ko deta hai (alpha ho to RGBA,
/// warna RGB — taaki PNG/WebP me faltu alpha channel na jude).
fn write_encoded(encoder: impl ImageEncoder, img: &DynamicImage) -> Result<(), image::ImageError> {
    let (w, h) = img.dimensions();
    match img.color() {
        image::ColorType::Rgb8 => {
            encoder.write_image(img.to_rgb8().as_raw(), w, h, ExtendedColorType::Rgb8)
        }
        _ => encoder.write_image(img.to_rgba8().as_raw(), w, h, ExtendedColorType::Rgba8),
    }
}

// ---------------------------------------------------------------------------
// Encoders
// ---------------------------------------------------------------------------

fn encode(
    img: &DynamicImage,
    format: OutFormat,
    quality: u8,
    bg: (u8, u8, u8),
) -> Result<Vec<u8>, String> {
    match format {
        OutFormat::Jpeg => {
            let flat = flatten(img, bg);
            encode_jpeg(&flat, quality)
        }
        OutFormat::Webp => encode_webp(img, quality, bg),
        OutFormat::Png => {
            // Lossless re-encode: pixels phir se encode hote hain, isliye
            // EXIF/GPS metadata saath carry nahi hota (privacy-first default).
            let mut buf = Vec::new();
            let encoder = PngEncoder::new(&mut buf);
            write_encoded(encoder, img).map_err(|e| format!("png encode fail: {e}"))?;
            Ok(buf)
        }
    }
}

// --- JPEG: mozjpeg-rs (pure Rust MozJPEG) — sab platforms par ek hi encoder ---
//
// Pehle native par C mozjpeg aur wasm (web/mobile) par image crate ka basic
// JpegEncoder tha. Woh basic encoder bina trellis/progressive/Huffman-optimize
// ke itni badi files banata tha ki chhote targets (jaise 56 KB -> 20 KB) par
// quality search kisi bhi quality par fit nahi hota tha aur engine chup-chaap
// dimensions shrink kar deta tha — result bekar quality + chhoti dimensions.
// mozjpeg-rs 100% safe Rust hai, isliye wasm32 par bhi wahi asal MozJPEG
// (trellis quantization + progressive + optimized Huffman) chalta hai.
// Benchmark (1280x575 photo, 56 KB -> 20 KB): purana web path q=6 + 1088x488
// (PSNR 24.7 dB); mozjpeg-rs full-size q=15 (PSNR 28.1 dB), dimensions same.
fn encode_jpeg(img: &DynamicImage, quality: u8) -> Result<Vec<u8>, String> {
    let rgb = img.to_rgb8();
    let (w, h) = rgb.dimensions();
    mozjpeg_rs::Encoder::progressive_balanced()
        .quality(quality)
        .encode_rgb(rgb.as_raw(), w, h)
        .map_err(|e| format!("mozjpeg encode fail: {e}"))
}

// --- WebP: native = libwebp (webp crate), wasm = image crate lossless -----

#[cfg(not(target_arch = "wasm32"))]
fn encode_webp(img: &DynamicImage, quality: u8, bg: (u8, u8, u8)) -> Result<Vec<u8>, String> {
    let (w, h) = img.dimensions();
    if quality >= 100 {
        // Lossless: alpha preserve.
        let rgba = img.to_rgba8();
        let encoder = webp::Encoder::from_rgba(rgba.as_raw(), w, h);
        Ok(encoder.encode_lossless().to_vec())
    } else {
        // Lossy: JPEG ki tarah alpha ko background par flatten karo.
        let flat = flatten(img, bg);
        let rgb = flat.to_rgb8();
        let encoder = webp::Encoder::from_rgb(rgb.as_raw(), w, h);
        Ok(encoder.encode(quality as f32).to_vec())
    }
}

#[cfg(target_arch = "wasm32")]
fn encode_webp(img: &DynamicImage, _quality: u8, _bg: (u8, u8, u8)) -> Result<Vec<u8>, String> {
    // libwebp (C build) wasm32 par nahi banta — image crate ka WebP encoder
    // sirf lossless hai, isliye wasm par quality ka asar WebP par nahi padta
    // aur alpha preserve rehta hai (dekho NOTES.md).
    let mut buf = Vec::new();
    let encoder = WebPEncoder::new_lossless(&mut buf);
    write_encoded(encoder, img).map_err(|e| format!("webp encode fail: {e}"))?;
    Ok(buf)
}

// ---------------------------------------------------------------------------
// Target-size algorithm (contract — locked)
// ---------------------------------------------------------------------------

struct SearchOutcome {
    bytes: Vec<u8>,
    img: DynamicImage,
    quality: u8,
    attempts: u32,
}

fn target_search(
    base: &DynamicImage,
    format: OutFormat,
    options: &CompressOptions,
    bg: (u8, u8, u8),
) -> Result<SearchOutcome, String> {
    let target = options.target_bytes.unwrap_or(0);
    let q_max = clamp_quality(options.quality.unwrap_or(90));
    let mut attempts: u32 = 0;
    let mut current = base.clone();
    // Best-effort fallback: ab tak ki sabse chhoti output (agar target kabhi na mile).
    let mut smallest: Option<(Vec<u8>, DynamicImage, u8)> = None;

    for pass in 0..=8u32 {
        let mut phase_attempts: u32 = 0;

        // Step 1: max quality par 1 encode — fit ho to done.
        let first = encode(&current, format, q_max, bg)?;
        attempts += 1;
        phase_attempts += 1;
        track_smallest(&mut smallest, &first, &current, q_max);
        if (first.len() as u64) <= target {
            return Ok(SearchOutcome {
                bytes: first,
                img: current,
                quality: q_max,
                attempts,
            });
        }

        // Step 2: quality binary search (phase me kul max 10 attempts),
        // best valid (<= target) result rakho; 2% tolerance band me ruk jao.
        let mut best: Option<(Vec<u8>, u8)> = None;
        let mut lo: i32 = 1;
        let mut hi: i32 = q_max as i32 - 1;
        while lo <= hi && phase_attempts < 10 {
            let mid = ((lo + hi) / 2) as u8;
            let bytes = encode(&current, format, mid, bg)?;
            attempts += 1;
            phase_attempts += 1;
            track_smallest(&mut smallest, &bytes, &current, mid);
            if (bytes.len() as u64) <= target {
                if (bytes.len() as f64) >= 0.98 * target as f64 {
                    return Ok(SearchOutcome {
                        bytes,
                        img: current,
                        quality: mid,
                        attempts,
                    });
                }
                best = Some((bytes, mid));
                lo = mid as i32 + 1;
            } else {
                hi = mid as i32 - 1;
            }
        }
        if let Some((bytes, q)) = best {
            return Ok(SearchOutcome {
                bytes,
                img: current,
                quality: q,
                attempts,
            });
        }

        // Step 3: dimension fallback x0.85 (max 8 passes, min dimension 64).
        if pass == 8 {
            break;
        }
        let (w, h) = current.dimensions();
        let next_dim = |d: u32| -> u32 {
            if d > 64 {
                ((d as f64 * 0.85) as u32).max(64)
            } else {
                d
            }
        };
        let (nw, nh) = (next_dim(w), next_dim(h));
        if nw >= w && nh >= h {
            break; // aur chhota nahi ho sakta
        }
        current = current.resize_exact(nw, nh, FilterType::Lanczos3);
    }

    // Target kabhi nahi mila: sabse chhoti best-effort output (target_met=false result me jayega).
    match smallest {
        Some((bytes, img, q)) => Ok(SearchOutcome {
            bytes,
            img,
            quality: q,
            attempts,
        }),
        None => Err("target search: koi encode nahi ban paya".to_string()),
    }
}

fn track_smallest(
    smallest: &mut Option<(Vec<u8>, DynamicImage, u8)>,
    bytes: &[u8],
    img: &DynamicImage,
    quality: u8,
) {
    let is_smaller = match smallest {
        Some((existing, _, _)) => bytes.len() < existing.len(),
        None => true,
    };
    if is_smaller {
        *smallest = Some((bytes.to_vec(), img.clone(), quality));
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// 800x600 gradient + deterministic noise wali test image ko JPEG bytes me encode karo.
    /// Noise ki wajah se ye high quality par 50 KB se kaafi badi rehti hai.
    fn make_noisy_jpeg() -> Vec<u8> {
        let mut state: u32 = 0x1234_5678;
        let mut next_noise = move || {
            // xorshift32
            state ^= state << 13;
            state ^= state >> 17;
            state ^= state << 5;
            (state >> 24) as u8
        };
        let mut img = image::RgbImage::new(800, 600);
        for y in 0..600u32 {
            for x in 0..800u32 {
                let grad = ((x * 255) / 800) as u8;
                let n = next_noise();
                img.put_pixel(
                    x,
                    y,
                    image::Rgb([
                        grad.wrapping_add(n),
                        ((y * 255) / 600) as u8 ^ n,
                        grad.wrapping_add(n / 2),
                    ]),
                );
            }
        }
        let dyn_img = DynamicImage::ImageRgb8(img);
        let mut buf = Vec::new();
        let encoder = JpegEncoder::new_with_quality(&mut buf, 95);
        write_encoded(encoder, &dyn_img).unwrap();
        buf
    }

    #[test]
    fn target_mode_hits_50kb_jpeg() {
        let input = make_noisy_jpeg();
        assert!(
            input.len() > 51_200,
            "test input khud 50 KB se bada hona chahiye, mila {}",
            input.len()
        );
        let options = r##"{
            "mode": "target",
            "targetBytes": 51200,
            "quality": 90,
            "format": "jpeg",
            "stripMetadata": true,
            "background": "#ffffff"
        }"##;
        let (bytes, result) = compress_with_json(&input, options).expect("compress fail");
        assert!(
            bytes.len() <= 51_200,
            "output target se bada: {}",
            bytes.len()
        );
        assert_eq!(result.format, "jpeg");
        assert!(result.target_met);
        assert_eq!(result.output_bytes, bytes.len());
        assert_eq!(
            image::guess_format(&bytes).unwrap(),
            ImageFormat::Jpeg,
            "output asal me JPEG hona chahiye"
        );
    }

    #[test]
    fn quality_mode_single_encode() {
        let input = make_noisy_jpeg();
        let options = r##"{
            "mode": "quality",
            "quality": 50,
            "format": "jpeg",
            "stripMetadata": true,
            "background": "#ffffff"
        }"##;
        let (bytes, result) = compress_with_json(&input, options).expect("compress fail");
        assert!(!bytes.is_empty());
        assert_eq!(result.format, "jpeg");
        assert_eq!(result.quality_used, 50);
        assert_eq!(result.attempts, 1);
        assert_eq!(
            image::guess_format(&bytes).unwrap(),
            ImageFormat::Jpeg,
            "output asal me JPEG hona chahiye"
        );
    }
}
