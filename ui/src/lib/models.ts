/* UI-side models (screens + App state). Engine types live in ../engine. */

import type { CompressResult, EngineFormat, EngineMode } from '../engine'

export interface SelectedImage {
  id: string
  file: File
  /** Object URL for the thumbnail/preview. Owned by App — revoked on remove. */
  url: string
  width: number
  height: number
}

export interface PhotoResult {
  id: string
  name: string
  originalUrl: string
  originalBytes: number
  blob: Blob
  /** Object URL of the compressed file (download + preview). */
  url: string
  downloadName: string
  meta: CompressResult
  engine: 'wasm' | 'fallback'
}

export interface FailedPhoto {
  name: string
  message: string
}

export interface UiSettings {
  mode: EngineMode
  /** Target size in KB (1 KB = 1024 bytes), used in target mode. */
  targetKB: number
  quality: number
  maxWidth: number | null
  maxHeight: number | null
  format: EngineFormat
  stripMetadata: boolean
  background: string
}

export const defaultSettings: UiSettings = {
  mode: 'target',
  targetKB: 50,
  quality: 82,
  maxWidth: null,
  maxHeight: null,
  format: 'same',
  stripMetadata: true,
  background: '#ffffff',
}
