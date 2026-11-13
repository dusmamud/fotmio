<script lang="ts">
  import { onDestroy } from 'svelte'
  import { get } from 'svelte/store'
  import { compressImage, type CompressOptions } from './engine'
  import { downloadName } from './lib/format'
  import { interpolate, locale, setLocale, t } from './lib/i18n'
  import {
    defaultSettings,
    type FailedPhoto,
    type PhotoResult,
    type SelectedImage,
    type UiSettings,
  } from './lib/models'
  import SelectScreen from './lib/SelectScreen.svelte'
  import TargetScreen from './lib/TargetScreen.svelte'
  import ResultScreen from './lib/ResultScreen.svelte'

  let screen = $state<1 | 2 | 3>(1)
  let images = $state<SelectedImage[]>([])
  let rejected = $state<string[]>([])
  let settings = $state<UiSettings>({ ...defaultSettings })
  let results = $state<PhotoResult[]>([])
  let failures = $state<FailedPhoto[]>([])
  let busy = $state(false)
  let progressLabel = $state('')
  let dark = $state(
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark',
  )

  let idCounter = 0
  const nextId = () => `img-${Date.now()}-${idCounter++}`

  const stepLabels = $derived([$t.app.steps.select, $t.app.steps.settings, $t.app.steps.results])

  function toggleTheme() {
    dark = !dark
    document.documentElement.dataset.theme = dark ? 'dark' : 'light'
    try {
      localStorage.setItem('fotmio-theme', dark ? 'dark' : 'light')
    } catch {
      /* storage unavailable — theme still applies for this session */
    }
  }

  function probe(file: File): Promise<{ url: string; width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => resolve({ url, width: img.naturalWidth, height: img.naturalHeight })
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('unreadable'))
      }
      img.src = url
    })
  }

  async function addFiles(files: File[]) {
    const bad: string[] = []
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        bad.push(file.name)
        continue
      }
      try {
        const info = await probe(file)
        images = [...images, { id: nextId(), file, ...info }]
      } catch {
        bad.push(file.name)
      }
    }
    rejected = bad
  }

  function removeImage(id: string) {
    const img = images.find((i) => i.id === id)
    if (img) URL.revokeObjectURL(img.url)
    images = images.filter((i) => i.id !== id)
  }

  function clearImages() {
    for (const img of images) URL.revokeObjectURL(img.url)
    images = []
    rejected = []
  }

  function buildOptions(): CompressOptions {
    const kb = Number.isFinite(settings.targetKB) && settings.targetKB > 0 ? settings.targetKB : 50
    return {
      mode: settings.mode,
      targetBytes: settings.mode === 'target' ? Math.round(kb * 1024) : undefined,
      quality: settings.quality,
      maxWidth: settings.mode === 'maxDimension' ? (settings.maxWidth ?? undefined) : undefined,
      maxHeight: settings.mode === 'maxDimension' ? (settings.maxHeight ?? undefined) : undefined,
      format: settings.format,
      stripMetadata: settings.stripMetadata,
      background: settings.background || '#ffffff',
    }
  }

  async function startCompress() {
    if (busy || images.length === 0) return
    busy = true
    results = []
    failures = []
    const options = buildOptions()
    const mimeOf = { jpeg: 'image/jpeg', webp: 'image/webp', png: 'image/png' } as const
    const done: PhotoResult[] = []
    const failed: FailedPhoto[] = []

    for (let i = 0; i < images.length; i++) {
      const img = images[i]
      progressLabel = interpolate(get(t).target.progress, {
        current: i + 1,
        total: images.length,
        name: img.file.name,
      })
      try {
        const input = new Uint8Array(await img.file.arrayBuffer())
        const out = await compressImage(input, img.file.type, options)
        const blob = new Blob([out.data.buffer as ArrayBuffer], { type: mimeOf[out.meta.format] })
        done.push({
          id: img.id,
          name: img.file.name,
          originalUrl: img.url,
          originalBytes: img.file.size,
          blob,
          url: URL.createObjectURL(blob),
          downloadName: downloadName(img.file.name, out.meta.format),
          meta: out.meta,
          engine: out.engine,
        })
      } catch (err) {
        failed.push({
          name: img.file.name,
          message: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    results = done
    failures = failed
    busy = false
    progressLabel = ''
    screen = 3
  }

  function compressMore() {
    for (const r of results) URL.revokeObjectURL(r.url)
    results = []
    failures = []
    clearImages()
    screen = 1
  }

  onDestroy(() => {
    for (const img of images) URL.revokeObjectURL(img.url)
    for (const r of results) URL.revokeObjectURL(r.url)
  })
</script>

<div class="shell">
  <header class="topbar">
    <div class="brand">
      <span class="logo" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="9.5" cy="9.5" r="1.8" fill="currentColor" stroke="none" />
          <path d="m21 16-4.8-4.8a1.6 1.6 0 0 0-2.2 0L7 18" />
        </svg>
      </span>
      <div>
        <h1>Fotmio</h1>
        <p>{$t.app.tagline}</p>
      </div>
    </div>
    <div class="header-actions">
      <div class="lang-switch" role="group" aria-label={$t.app.language}>
        <button
          type="button"
          class:active={$locale === 'en-IN'}
          aria-pressed={$locale === 'en-IN'}
          onclick={() => setLocale('en-IN')}>EN</button
        >
        <button
          type="button"
          class:active={$locale === 'hi-IN'}
          aria-pressed={$locale === 'hi-IN'}
          onclick={() => setLocale('hi-IN')}>हिंदी</button
        >
      </div>
      <button
        type="button"
        class="theme-toggle"
        onclick={toggleTheme}
        aria-label={dark ? $t.app.switchToLight : $t.app.switchToDark}
        title={dark ? $t.app.switchToLight : $t.app.switchToDark}
      >
        {#if dark}
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        {:else}
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        {/if}
      </button>
    </div>
  </header>

  <p class="privacy">
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" />
      <path d="m9 11.5 2 2 4-4" />
    </svg>
    {$t.app.privacy}
  </p>

  <ol class="steps" aria-label={$t.app.progress}>
    {#each stepLabels as label, i (label)}
      <li class:active={screen === i + 1} class:done={screen > i + 1}>
        <span class="dot">{i + 1}</span> {label}
      </li>
      {#if i < stepLabels.length - 1}<li class="sep" aria-hidden="true"></li>{/if}
    {/each}
  </ol>

  <main>
    {#if screen === 1}
      <SelectScreen
        {images}
        {rejected}
        onAdd={addFiles}
        onRemove={removeImage}
        onClear={clearImages}
        onNext={() => (screen = 2)}
      />
    {:else if screen === 2}
      <TargetScreen
        bind:settings
        count={images.length}
        {busy}
        {progressLabel}
        onBack={() => (screen = 1)}
        onCompress={startCompress}
      />
    {:else}
      <ResultScreen
        {results}
        {failures}
        onAgain={compressMore}
        onBackToSettings={() => (screen = 2)}
      />
    {/if}
  </main>

  <footer>
    <p>{$t.app.footer}</p>
  </footer>
</div>

<style>
  .shell {
    max-width: 980px;
    margin: 0 auto;
    padding: 20px 18px 40px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    min-height: 100vh;
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .logo {
    width: 46px;
    height: 46px;
    border-radius: 12px;
    background: var(--primary);
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex: none;
  }
  .brand h1 {
    margin: 0;
    font-size: 1.55rem;
    line-height: 1.1;
    letter-spacing: -0.01em;
  }
  .brand p {
    margin: 0;
    color: var(--text-2);
    font-size: 0.9rem;
  }
  .header-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .lang-switch {
    display: flex;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 3px;
    gap: 2px;
  }
  .lang-switch button {
    border: none;
    background: transparent;
    color: var(--text-2);
    font-weight: 700;
    font-size: 0.85rem;
    padding: 6px 13px;
    border-radius: 999px;
  }
  .lang-switch button.active {
    background: var(--primary);
    color: #fff;
  }
  .theme-toggle {
    width: 42px;
    height: 42px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .theme-toggle:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
  .privacy {
    margin: 0;
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--success);
    background: var(--success-soft);
    border-radius: 10px;
    padding: 8px 12px;
    font-size: 0.88rem;
    font-weight: 600;
  }
  .privacy svg {
    flex: none;
  }
  .steps {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0;
    padding: 0;
    color: var(--text-3);
    font-weight: 600;
    font-size: 0.92rem;
    flex-wrap: wrap;
  }
  .steps .dot {
    width: 24px;
    height: 24px;
    border-radius: 999px;
    border: 2px solid var(--border);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.8rem;
    margin-right: 2px;
    vertical-align: -6px;
  }
  .steps li.active {
    color: var(--primary);
  }
  .steps li.active .dot {
    border-color: var(--primary);
    background: var(--primary);
    color: #fff;
  }
  .steps li.done {
    color: var(--success);
  }
  .steps li.done .dot {
    border-color: var(--success);
    background: var(--success);
    color: #fff;
  }
  .steps .sep {
    flex: 1;
    max-width: 42px;
    height: 2px;
    background: var(--border);
    border-radius: 2px;
  }
  main {
    flex: 1;
  }
  footer {
    color: var(--text-3);
    font-size: 0.85rem;
    text-align: center;
  }
  footer p {
    margin: 0;
  }
</style>
