<script lang="ts">
  import { formatBytes, savingsPercent } from './format'
  import { interpolate, t, type Dictionary } from './i18n'
  import type { PhotoResult } from './models'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Card } from '$lib/components/ui/card'
  import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group'
  import Download from 'lucide-svelte/icons/download'
  import TriangleAlert from 'lucide-svelte/icons/triangle-alert'

  let { result }: { result: PhotoResult } = $props()

  let view = $state<'before' | 'after'>('after')
  const meta = result.meta
  const resized = meta.outWidth !== meta.width || meta.outHeight !== meta.height
  const originalDims = `${meta.width}×${meta.height}`

  /** Localized "42.0% smaller" / "3.1% larger" / "Same size" label. */
  function savingsLabel(
    original: number,
    output: number,
    labels: Dictionary['results'],
  ): string {
    const pct = savingsPercent(original, output)
    const percent = `${Math.abs(pct).toFixed(1)}%`
    if (pct > 0) return interpolate(labels.smaller, { percent })
    if (pct < 0) return interpolate(labels.larger, { percent })
    return labels.sameSize
  }
</script>

<Card class="gap-3 overflow-hidden py-4">
  <div class="flex items-center gap-2 px-4">
    <h3 class="flex-1 truncate text-sm font-semibold" title={result.name}>{result.name}</h3>
    <Badge
      variant="secondary"
      title={result.engine === 'wasm'
        ? $t.resultCard.rustEngineTitle
        : $t.resultCard.browserEngineTitle}
    >
      {result.engine === 'wasm' ? $t.resultCard.rustEngine : $t.resultCard.browserEngine}
    </Badge>
  </div>

  <div
    class="relative"
    style="background: repeating-conic-gradient(var(--muted) 0% 25%, var(--card) 0% 50%) 0 0 / 22px 22px"
  >
    <img
      class="aspect-[16/10] w-full object-contain"
      src={view === 'after' ? result.url : result.originalUrl}
      alt={interpolate(
        view === 'after' ? $t.resultCard.compressedAlt : $t.resultCard.originalAlt,
        { name: result.name },
      )}
    />
    <ToggleGroup
      value={view}
      onValueChange={(v) => v && (view = v as 'before' | 'after')}
      class="absolute bottom-2 left-1/2 -translate-x-1/2 gap-0.5 rounded-full bg-slate-950/80 p-0.5 shadow-lg backdrop-blur"
      aria-label={$t.resultCard.previewVersion}
    >
      <ToggleGroupItem
        value="before"
        class="h-7 border-0 bg-transparent px-3 text-xs text-slate-300 shadow-none hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-slate-900 data-[state=on]:hover:bg-white"
      >
        {$t.resultCard.before}
      </ToggleGroupItem>
      <ToggleGroupItem
        value="after"
        class="h-7 border-0 bg-transparent px-3 text-xs text-slate-300 shadow-none hover:bg-white/10 hover:text-white data-[state=on]:bg-white data-[state=on]:text-slate-900 data-[state=on]:hover:bg-white"
      >
        {$t.resultCard.after}
      </ToggleGroupItem>
    </ToggleGroup>
  </div>

  <div class="flex flex-col gap-3 px-4">
    <p class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-[15px] tabular-nums">
        <span class="text-muted-foreground">{formatBytes(result.originalBytes)}</span>
        <span aria-hidden="true">→</span>
        <strong>{formatBytes(meta.outputBytes)}</strong>
      </span>
      <Badge variant="success">{savingsLabel(result.originalBytes, meta.outputBytes, $t.results)}</Badge>
    </p>

    {#if !meta.targetMet}
      <p class="flex items-start gap-2 rounded-md bg-warning/15 px-3 py-2 text-[13px] text-warning">
        <TriangleAlert class="mt-px size-4 shrink-0" aria-hidden="true" />
        <span>{$t.resultCard.targetNotMet}</span>
      </p>
    {/if}

    <dl class="grid grid-cols-3 gap-2">
      <div class="rounded-lg bg-muted/70 px-2.5 py-2">
        <dt class="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {$t.resultCard.format}
        </dt>
        <dd class="truncate text-[13px] font-semibold">{meta.format.toUpperCase()}</dd>
      </div>
      <div class="rounded-lg bg-muted/70 px-2.5 py-2">
        <dt class="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {$t.resultCard.dimensions}
        </dt>
        <dd class="text-[13px] font-semibold tabular-nums">
          {meta.outWidth}×{meta.outHeight}
          {#if resized}
            <span class="block text-[11px] font-normal text-muted-foreground">
              {interpolate($t.resultCard.was, { dimensions: originalDims })}
            </span>
          {/if}
        </dd>
      </div>
      <div class="rounded-lg bg-muted/70 px-2.5 py-2">
        <dt class="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
          {$t.resultCard.qualityUsed}
        </dt>
        <dd class="truncate text-[13px] font-semibold">
          {meta.format === 'png' ? $t.resultCard.lossless : meta.qualityUsed}
        </dd>
      </div>
    </dl>

    <Button href={result.url} download={result.downloadName} class="w-full">
      <Download />
      {$t.resultCard.download}
    </Button>
  </div>
</Card>
