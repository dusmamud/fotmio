/* i18n setup — two locales only (locked decision): en-IN and hi-IN.
 *
 * - `locale`  : writable store with the active locale
 * - `t`       : readable store holding the active Dictionary, so components
 *               use `$t.select.heading` etc. and re-render on switch
 * - default   : a saved choice (localStorage) wins; otherwise the browser
 *               language decides (hi* -> hi-IN, everything else -> en-IN)
 * - `interpolate` fills {placeholders} in dictionary strings. */

import { derived, writable, type Readable } from 'svelte/store'
import enIN, { type Dictionary } from './en-IN'
import hiIN from './hi-IN'

export type Locale = 'en-IN' | 'hi-IN'
export type { Dictionary }

const dictionaries: Record<Locale, Dictionary> = {
  'en-IN': enIN,
  'hi-IN': hiIN,
}

const STORAGE_KEY = 'fotmio-locale'

function detectLocale(): Locale {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'en-IN' || stored === 'hi-IN') return stored
    const lang = (navigator.language || 'en').toLowerCase().replace('_', '-')
    if (lang === 'hi' || lang.startsWith('hi-')) return 'hi-IN'
  } catch {
    /* storage / navigator unavailable — fall through to en-IN */
  }
  return 'en-IN'
}

export const locale = writable<Locale>(detectLocale())

export const t: Readable<Dictionary> = derived(locale, ($locale) => dictionaries[$locale])

export function setLocale(next: Locale): void {
  locale.set(next)
}

locale.subscribe((value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* storage unavailable — choice applies to this session only */
  }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = value
    document.title = `Fotmio – ${dictionaries[value].app.tagline}`
  }
})

/** Fill {name}-style placeholders: interpolate('Hi {name}', { name: 'Asha' }) */
export function interpolate(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    values[key] !== undefined ? String(values[key]) : match,
  )
}
