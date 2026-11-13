/* Small display helpers shared by the screens. */

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '—'
  if (bytes < 1024) return `${bytes} B`
  const kb = bytes / 1024
  if (kb < 1024) return `${kb >= 100 ? Math.round(kb) : trim(kb)} KB`
  const mb = kb / 1024
  return `${mb >= 100 ? Math.round(mb) : trim(mb)} MB`
}

function trim(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, '')
}

/** Signed saving of `output` vs `original` in percent (negative = grew).
    The words around the number come from the i18n dictionary — see
    savingsLabel() in the result components. */
export function savingsPercent(original: number, output: number): number {
  if (original <= 0) return 0
  return (1 - output / original) * 100
}

/** "photo.jpg" + jpeg -> "photo-fotmio.jpg" */
export function downloadName(originalName: string, format: string): string {
  const base = originalName.replace(/\.[^.]+$/, '') || 'photo'
  return `${base}-fotmio.${format}`
}
