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
  import { Button } from '$lib/components/ui/button'
  import { cn } from '$lib/utils'
  import Check from 'lucide-svelte/icons/check'
  import ImageIcon from 'lucide-svelte/icons/image'
  import Moon from 'lucide-svelte/icons/moon'
  import ShieldCheck from 'lucide-svelte/icons/shield-check'
  import Sun from 'lucide-svelte/icons/sun'

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

<div class="flex min-h-dvh flex-col">
  <header class="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
    <div class="mx-auto flex h-14 w-full max-w-[1080px] items-center gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6">
      <div class="flex min-w-0 items-center gap-2.5">
        <span class="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-primary text-primary-foreground shadow-sm sm:size-10" aria-hidden="true">
          <ImageIcon class="size-5" />
        </span>
        <div class="min-w-0 leading-tight">
          <h1 class="truncate text-[17px] font-bold sm:text-lg">Fotmio</h1>
          <p class="hidden truncate text-xs text-muted-foreground min-[420px]:block">{$t.app.tagline}</p>
        </div>
      </div>
      <div class="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
        <div class="flex rounded-full border bg-card p-0.5 shadow-xs" role="group" aria-label={$t.app.language}>
          <button
            type="button"
            class={cn(
              'h-8 rounded-full px-3 text-[13px] font-semibold text-muted-foreground transition-colors',
              $locale === 'en-IN' && 'bg-primary text-primary-foreground',
            )}
            aria-pressed={$locale === 'en-IN'}
            onclick={() => setLocale('en-IN')}>EN</button
          >
          <button
            type="button"
            class={cn(
              'h-8 rounded-full px-3 text-[13px] font-semibold text-muted-foreground transition-colors',
              $locale === 'hi-IN' && 'bg-primary text-primary-foreground',
            )}
            aria-pressed={$locale === 'hi-IN'}
            onclick={() => setLocale('hi-IN')}>हिंदी</button
          >
        </div>
        <Button
          variant="outline"
          size="icon"
          class="rounded-full"
          onclick={toggleTheme}
          aria-label={dark ? $t.app.switchToLight : $t.app.switchToDark}
          title={dark ? $t.app.switchToLight : $t.app.switchToDark}
        >
          {#if dark}
            <Sun />
          {:else}
            <Moon />
          {/if}
        </Button>
      </div>
    </div>
  </header>

  <div class="mx-auto flex w-full max-w-[1080px] flex-1 flex-col gap-4 px-4 pt-4 sm:gap-5 sm:px-6 sm:pt-6">
    <p class="flex items-center gap-1.5 text-[13px] text-muted-foreground sm:text-sm">
      <ShieldCheck class="size-4 shrink-0 text-success" aria-hidden="true" />
      <span>{$t.app.privacy}</span>
    </p>

    {#snippet stepFace(i: number, label: string)}
      <span
        class={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold sm:size-7 sm:text-xs',
          screen === i + 1 && 'border-primary bg-primary text-primary-foreground',
          screen > i + 1 && 'border-success bg-success text-success-foreground',
          screen < i + 1 && 'border-border bg-card text-muted-foreground',
        )}
        aria-hidden="true"
      >
        {#if screen > i + 1}
          <Check class="size-3.5" strokeWidth={3.2} />
        {:else}
          {i + 1}
        {/if}
      </span>
      <span
        class={cn(
          'text-[13px] font-semibold whitespace-nowrap sm:text-sm',
          screen === i + 1 ? 'text-primary' : screen > i + 1 ? 'text-success' : 'text-muted-foreground',
        )}>{label}</span
      >
    {/snippet}

    <ol class="flex items-center gap-1.5 sm:gap-2" aria-label={$t.app.progress}>
      {#each stepLabels as label, i (label)}
        <li class="flex items-center gap-1.5 sm:gap-2">
          {#if screen > i + 1}
            <button
              type="button"
              class="flex items-center gap-1.5 sm:gap-2"
              onclick={() => (screen = (i + 1) as 1 | 2 | 3)}
            >
              {@render stepFace(i, label)}
            </button>
          {:else}
            {@render stepFace(i, label)}
          {/if}
        </li>
        {#if i < stepLabels.length - 1}
          <li class="h-0.5 min-w-2 flex-1 rounded bg-border sm:max-w-14" aria-hidden="true"></li>
        {/if}
      {/each}
    </ol>

    <main class="flex flex-1 flex-col">
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

    <footer class="pb-28 pt-2 text-center text-[13px] text-muted-foreground">
      <p>{$t.app.footer}</p>
    </footer>
  </div>
</div>
