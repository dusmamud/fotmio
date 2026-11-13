/* Shared engine types — mirrors docs/ENGINE_API.md (UI <-> Rust engine contract).
   The engine is bytes-in / bytes-out: it never touches the file system. */

export type EngineMode = 'target' | 'quality' | 'maxDimension'
export type EngineFormat = 'jpeg' | 'webp' | 'png' | 'same'
export type OutputFormat = 'jpeg' | 'webp' | 'png'

export interface CompressOptions {
  mode: EngineMode
  /** mode=target: desired output size in bytes (e.g. 50 KB = 51200). */
  targetBytes?: number
  /** mode=quality: 1–100. In target mode this is the upper bound for the search. */
  quality?: number
  /** mode=maxDimension: cap for the output width in px. */
  maxWidth?: number
  /** mode=maxDimension: cap for the output height in px. */
  maxHeight?: number
  format: EngineFormat
  /** Strip EXIF/GPS metadata. Default true (privacy-first). */
  stripMetadata: boolean
  /** Fill colour used when flattening transparency (JPEG), e.g. "#ffffff". */
  background: string
}

export interface CompressResult {
  format: OutputFormat
  inputBytes: number
  outputBytes: number
  width: number
  height: number
  outWidth: number
  outHeight: number
  /** Quality the encoder actually used (target search picks this). */
  qualityUsed: number
  /** < 1.0 when the dimension fallback had to shrink the image. */
  scaleUsed: number
  /** outputBytes <= targetBytes (target mode only). */
  targetMet: boolean
  /** How many encodes the search needed. */
  attempts: number
}

export interface CompressedOutput {
  data: Uint8Array
  meta: CompressResult
  /** Which implementation produced this result. */
  engine: 'wasm' | 'fallback'
}
