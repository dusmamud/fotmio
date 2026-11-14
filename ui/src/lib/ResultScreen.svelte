<script lang="ts">
  import { formatBytes, savingsPercent } from './format'
  import { interpolate, t, type Dictionary } from './i18n'
  import type { FailedPhoto, PhotoResult } from './models'
  import ResultCard from './ResultCard.svelte'
  import { Alert, AlertDescription, AlertTitle } from '$lib/components/ui/alert'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent } from '$lib/components/ui/card'
  import ArrowLeft from 'lucide-svelte/icons/arrow-left'
  import ArrowRight from 'lucide-svelte/icons/arrow-right'
  import CircleAlert from 'lucide-svelte/icons/circle-alert'
  import Images from 'lucide-svelte/icons/images'

  interface Props {
    results: PhotoResult[]
    failures: FailedPhoto[]
    onAgain: () => void
    onBackToSettings: () => void
  }

  let { results, failures, onAgain, onBackToSettings }: Props = $props()

  const totalOriginal = $derived(results.reduce((s, r) => s + r.originalBytes, 0))
  const totalOutput = $derived(results.reduce((s, r) => s + r.meta.outputBytes, 0))

  function savingsText(dict: Dictionary): string {
    const pct = savingsPercent(totalOriginal, totalOutput)
    const percent = `${Math.abs(pct).toFixed(1)}%`
    return pct > 0
      ? interpolate(dict.results.smaller, { percent })
      : pct < 0
        ? interpolate(dict.results.larger, { percent })
        : dict.results.sameSize
  }

  function summaryText(dict: Dictionary): string {
    return interpolate(results.length === 1 ? dict.results.summaryOne : dict.results.summaryMany, {
      count: results.length,
      original: formatBytes(totalOriginal),
      output: formatBytes(totalOutput),
      savings: savingsText(dict),
    })
  }
</script>

<section class="flex flex-col gap-4 sm:gap-5">
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{$t.results.heading}</h2>
    {#if results.length > 0}
      <p class="mt-1 text-sm text-muted-foreground sm:text-[15px]">{summaryText($t)}</p>
    {:else}
      <p class="mt-1 text-sm text-muted-foreground sm:text-[15px]">{$t.results.noneCompressed}</p>
    {/if}
  </div>

  {#if results.length > 0}
    <Card class="gap-0 py-0">
      <CardContent class="flex flex-wrap items-center gap-x-5 gap-y-3 px-4 py-4 sm:px-6">
        <div class="flex flex-col">
          <span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {$t.resultCard.before}
          </span>
          <span class="text-xl font-bold tabular-nums sm:text-2xl">{formatBytes(totalOriginal)}</span>
        </div>
        <ArrowRight class="hidden text-muted-foreground min-[400px]:block" aria-hidden="true" />
        <div class="flex flex-col">
          <span class="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase">
            {$t.resultCard.after}
          </span>
          <span class="text-xl font-bold text-primary tabular-nums sm:text-2xl">
            {formatBytes(totalOutput)}
          </span>
        </div>
        <Badge variant="success" class="ml-auto px-2.5 py-1 text-[13px]">{savingsText($t)}</Badge>
      </CardContent>
    </Card>
  {/if}

  {#if failures.length > 0}
    <Alert variant="destructive">
      <CircleAlert />
      <AlertTitle>
        {interpolate(
          failures.length === 1 ? $t.results.failedHeadingOne : $t.results.failedHeadingMany,
          { count: failures.length },
        )}
      </AlertTitle>
      <AlertDescription>
        <ul class="list-disc pl-4">
          {#each failures as f (f.name)}
            <li><strong>{f.name}</strong> — {f.message}</li>
          {/each}
        </ul>
      </AlertDescription>
    </Alert>
  {/if}

  {#if results.length > 0}
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each results as result (result.id)}
        <ResultCard {result} />
      {/each}
    </div>
  {/if}

  <div class="fixed inset-x-0 bottom-0 z-40 border-t bg-background/85 backdrop-blur-md">
    <div class="mx-auto flex w-full max-w-[1080px] items-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-6">
      <Button variant="outline" onclick={onBackToSettings}>
        <ArrowLeft />
        {$t.results.backToSettings}
      </Button>
      <Button size="lg" class="flex-1 sm:flex-none" onclick={onAgain}>
        <Images />
        {$t.results.compressMore}
      </Button>
    </div>
  </div>
</section>
