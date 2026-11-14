<script lang="ts">
  import { formatBytes } from './format'
  import { interpolate, t } from './i18n'
  import type { SelectedImage } from './models'
  import { Alert, AlertDescription } from '$lib/components/ui/alert'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent } from '$lib/components/ui/card'
  import { cn } from '$lib/utils'
  import ArrowRight from 'lucide-svelte/icons/arrow-right'
  import CircleAlert from 'lucide-svelte/icons/circle-alert'
  import CloudUpload from 'lucide-svelte/icons/cloud-upload'
  import Layers from 'lucide-svelte/icons/layers'
  import Plus from 'lucide-svelte/icons/plus'
  import ShieldCheck from 'lucide-svelte/icons/shield-check'
  import X from 'lucide-svelte/icons/x'
  import Zap from 'lucide-svelte/icons/zap'

  interface Props {
    images: SelectedImage[]
    rejected: string[]
    onAdd: (files: File[]) => void
    onRemove: (id: string) => void
    onClear: () => void
    onNext: () => void
  }

  let { images, rejected, onAdd, onRemove, onClear, onNext }: Props = $props()

  let dragging = $state(false)
  let inputEl: HTMLInputElement | undefined = $state()

  const totalBytes = $derived(images.reduce((sum, img) => sum + img.file.size, 0))

  function pickFiles(list: FileList | null) {
    if (list && list.length > 0) onAdd(Array.from(list))
    if (inputEl) inputEl.value = ''
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    dragging = false
    if (event.dataTransfer) onAdd(Array.from(event.dataTransfer.files))
  }

  function openPicker() {
    inputEl?.click()
  }
</script>

<section class="flex flex-col gap-4 sm:gap-5">
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{$t.select.heading}</h2>
    <p class="mt-1 text-sm text-muted-foreground sm:text-[15px]">{$t.select.intro}</p>
  </div>

  <div
    class={cn(
      'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed bg-card px-4 text-center shadow-xs transition-colors hover:border-primary/60 hover:bg-accent/40',
      images.length > 0 ? 'py-5 sm:py-6' : 'py-9 sm:py-14',
      dragging && 'border-primary bg-accent/60',
    )}
    role="button"
    tabindex="0"
    aria-label={$t.select.addImages}
    onclick={openPicker}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openPicker()
      }
    }}
    ondragover={(e) => {
      e.preventDefault()
      dragging = true
    }}
    ondragleave={() => (dragging = false)}
    ondrop={handleDrop}
  >
    <span class="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-14" aria-hidden="true">
      <CloudUpload class="size-6 sm:size-7" />
    </span>
    <p class="text-base font-semibold sm:text-lg">{$t.select.dropTitle}</p>
    <p class="text-[13px] text-muted-foreground sm:text-sm">
      {$t.select.dropOr}
      <span class="font-semibold text-primary underline underline-offset-2">{$t.select.dropBrowse}</span>
      {$t.select.dropFormats}
    </p>
    <input
      bind:this={inputEl}
      type="file"
      accept="image/*"
      multiple
      class="hidden"
      onchange={(e) => pickFiles(e.currentTarget.files)}
    />
  </div>

  {#if rejected.length > 0}
    <Alert variant="destructive">
      <CircleAlert />
      <AlertDescription>
        {interpolate(rejected.length === 1 ? $t.select.skippedOne : $t.select.skippedMany, {
          count: rejected.length,
          names: rejected.join(', '),
        })}
      </AlertDescription>
    </Alert>
  {/if}

  {#if images.length > 0}
    <ul class="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
      {#each images as img (img.id)}
        <li class="relative rounded-xl border bg-card p-1.5 shadow-xs">
          <img
            class="aspect-[4/3] w-full rounded-lg object-cover"
            src={img.url}
            alt={img.file.name}
          />
          <Button
            variant="secondary"
            size="icon"
            class="absolute top-2 right-2 size-7 rounded-full shadow-sm"
            onclick={() => onRemove(img.id)}
            aria-label={interpolate($t.select.remove, { name: img.file.name })}
          >
            <X class="size-4" />
          </Button>
          <div class="px-1 pt-1.5 pb-0.5">
            <p class="truncate text-[13px] font-medium">{img.file.name}</p>
            <p class="text-xs text-muted-foreground">
              {formatBytes(img.file.size)} · {img.width}×{img.height}
            </p>
          </div>
        </li>
      {/each}
      <li class="flex">
        <div
          class="flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-input py-4 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          role="button"
          tabindex="0"
          aria-label={$t.select.addMore}
          onclick={openPicker}
          onkeydown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              openPicker()
            }
          }}
        >
          <Plus class="size-6" />
          <span class="text-sm font-medium">{$t.select.addMore}</span>
        </div>
      </li>
    </ul>
  {:else}
    <div class="flex flex-col gap-2.5">
      <h3 class="text-[13px] font-semibold tracking-wider text-muted-foreground uppercase">
        {$t.select.features.heading}
      </h3>
      <div class="grid gap-3 sm:grid-cols-3">
        <Card class="gap-0 py-4">
          <CardContent class="flex flex-col gap-1.5 px-4">
            <span class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck class="size-5" />
            </span>
            <p class="text-sm font-semibold">{$t.select.features.offlineTitle}</p>
            <p class="text-[13px] leading-snug text-muted-foreground">{$t.select.features.offlineText}</p>
          </CardContent>
        </Card>
        <Card class="gap-0 py-4">
          <CardContent class="flex flex-col gap-1.5 px-4">
            <span class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Zap class="size-5" />
            </span>
            <p class="text-sm font-semibold">{$t.select.features.speedTitle}</p>
            <p class="text-[13px] leading-snug text-muted-foreground">{$t.select.features.speedText}</p>
          </CardContent>
        </Card>
        <Card class="gap-0 py-4">
          <CardContent class="flex flex-col gap-1.5 px-4">
            <span class="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Layers class="size-5" />
            </span>
            <p class="text-sm font-semibold">{$t.select.features.batchTitle}</p>
            <p class="text-[13px] leading-snug text-muted-foreground">{$t.select.features.batchText}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  {/if}

  {#if images.length > 0}
    <div class="fixed inset-x-0 bottom-0 z-40 border-t bg-background/85 backdrop-blur-md">
      <div class="mx-auto flex w-full max-w-[1080px] items-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-6">
        <span class="mr-auto min-w-0 truncate text-sm font-medium">
          {interpolate(images.length === 1 ? $t.select.selectedOne : $t.select.selectedMany, {
            count: images.length,
            total: formatBytes(totalBytes),
          })}
        </span>
        <Button variant="outline" onclick={onClear}>{$t.select.clearAll}</Button>
        <Button size="lg" class="flex-1 sm:flex-none" onclick={onNext}>
          {$t.select.continue}
          <ArrowRight />
        </Button>
      </div>
    </div>
  {/if}
</section>
