<script lang="ts">
  import type { EngineFormat, EngineMode } from '../engine'
  import { interpolate, t } from './i18n'
  import type { UiSettings } from './models'
  import { Badge } from '$lib/components/ui/badge'
  import { Button } from '$lib/components/ui/button'
  import { Card, CardContent } from '$lib/components/ui/card'
  import { Input } from '$lib/components/ui/input'
  import { Label } from '$lib/components/ui/label'
  import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from '$lib/components/ui/select'
  import { Separator } from '$lib/components/ui/separator'
  import { Slider } from '$lib/components/ui/slider'
  import { Switch } from '$lib/components/ui/switch'
  import { Tabs, TabsContent, TabsList, TabsTrigger } from '$lib/components/ui/tabs'
  import { ToggleGroup, ToggleGroupItem } from '$lib/components/ui/toggle-group'
  import ArrowLeft from 'lucide-svelte/icons/arrow-left'
  import LoaderCircle from 'lucide-svelte/icons/loader-circle'

  interface Props {
    settings: UiSettings
    count: number
    busy: boolean
    progressLabel: string
    onBack: () => void
    onCompress: () => void
  }

  let { settings = $bindable(), count, busy, progressLabel, onBack, onCompress }: Props =
    $props()

  const CHIPS: Array<{ label: string; kb: number }> = [
    { label: '20 KB', kb: 20 },
    { label: '50 KB', kb: 50 },
    { label: '100 KB', kb: 100 },
    { label: '200 KB', kb: 200 },
    { label: '500 KB', kb: 500 },
    { label: '1 MB', kb: 1024 },
  ]

  type PresetId = 'ssc' | 'upsc' | 'passport'
  let activePreset = $state<PresetId | null>(null)

  function applyPreset(id: PresetId) {
    activePreset = id
    settings.mode = 'target'
    if (id === 'ssc') {
      settings.targetKB = 50
      settings.format = 'jpeg'
    } else if (id === 'upsc') {
      settings.targetKB = 300
      settings.format = 'jpeg'
    } else {
      settings.targetKB = 50
      settings.format = 'jpeg'
      settings.background = '#ffffff'
    }
  }

  function pickChip(kb: number) {
    activePreset = null
    settings.targetKB = kb
  }

  function dimensionValue(value: number | null): string {
    return value === null ? '' : String(value)
  }

  function parseDimension(raw: string): number | null {
    const n = parseInt(raw, 10)
    return Number.isFinite(n) && n > 0 ? n : null
  }

  function formatHelp(format: EngineFormat): string {
    return $t.target.formatHelp[format]
  }
</script>

<section class="flex flex-col gap-4 sm:gap-5">
  <div>
    <h2 class="text-xl font-bold tracking-tight sm:text-2xl">{$t.target.heading}</h2>
    <p class="mt-1 text-sm text-muted-foreground sm:text-[15px]">
      {count === 1
        ? $t.target.appliedOne
        : interpolate($t.target.appliedMany, { count })}
    </p>
  </div>

  <Tabs
    value={settings.mode}
    onValueChange={(v) => (settings.mode = v as EngineMode)}
    class="w-full"
  >
    <TabsList aria-label={$t.target.modeAria}>
      <TabsTrigger value="target">{$t.target.tabs.target}</TabsTrigger>
      <TabsTrigger value="quality">{$t.target.tabs.quality}</TabsTrigger>
      <TabsTrigger value="maxDimension">{$t.target.tabs.resize}</TabsTrigger>
    </TabsList>
    <p class="text-sm text-muted-foreground">{$t.target.help[settings.mode]}</p>

    <div class="mt-2 grid items-start gap-4 lg:grid-cols-[1.6fr_1fr]">
      <Card class="gap-0 py-0">
        <CardContent class="flex flex-col gap-5 px-4 py-5 sm:px-6">
          <TabsContent value="target" class="mt-0">
            <div class="flex flex-col gap-5">
              <div class="flex flex-col gap-2">
                <Label>{$t.target.presets.label}</Label>
                <ToggleGroup
                  value={activePreset ?? ''}
                  onValueChange={(v) => v && applyPreset(v as PresetId)}
                >
                  <ToggleGroupItem value="ssc" class="border-dashed data-[state=on]:border-solid">
                    {$t.target.presets.ssc}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="upsc" class="border-dashed data-[state=on]:border-solid">
                    {$t.target.presets.upsc}
                  </ToggleGroupItem>
                  <ToggleGroupItem value="passport" class="border-dashed data-[state=on]:border-solid">
                    {$t.target.presets.passport}
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div class="flex flex-col gap-2">
                <Label>{$t.target.targetSize}</Label>
                <ToggleGroup
                  value={activePreset === null ? String(settings.targetKB) : ''}
                  onValueChange={(v) => v && pickChip(Number(v))}
                >
                  {#each CHIPS as chip (chip.kb)}
                    <ToggleGroupItem value={String(chip.kb)}>{chip.label}</ToggleGroupItem>
                  {/each}
                </ToggleGroup>
              </div>
              <div class="flex flex-col gap-2">
                <Label for="custom-kb">{$t.target.customSize}</Label>
                <div class="flex max-w-56 items-center gap-2">
                  <Input
                    id="custom-kb"
                    type="number"
                    min="5"
                    max="51200"
                    step="1"
                    bind:value={settings.targetKB}
                    oninput={() => (activePreset = null)}
                  />
                  <span class="text-sm font-medium text-muted-foreground">{$t.target.kb}</span>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="maxDimension" class="mt-0">
            <div class="grid gap-4 min-[420px]:grid-cols-2">
              <div class="flex flex-col gap-2">
                <Label for="max-w">{$t.target.maxWidth}</Label>
                <Input
                  id="max-w"
                  type="number"
                  min="1"
                  placeholder={$t.target.noLimit}
                  value={dimensionValue(settings.maxWidth)}
                  oninput={(e) => (settings.maxWidth = parseDimension(e.currentTarget.value))}
                />
              </div>
              <div class="flex flex-col gap-2">
                <Label for="max-h">{$t.target.maxHeight}</Label>
                <Input
                  id="max-h"
                  type="number"
                  min="1"
                  placeholder={$t.target.noLimit}
                  value={dimensionValue(settings.maxHeight)}
                  oninput={(e) => (settings.maxHeight = parseDimension(e.currentTarget.value))}
                />
              </div>
            </div>
          </TabsContent>

          <Separator />

          <div class="flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <Label for="quality-slider">
                {settings.mode === 'target' ? $t.target.qualityCap : $t.target.quality}
              </Label>
              <Badge variant="secondary" class="tabular-nums">{settings.quality}</Badge>
            </div>
            <Slider id="quality-slider" bind:value={settings.quality} min={1} max={100} step={1} />
            <div class="flex justify-between text-xs text-muted-foreground">
              <span>{$t.target.smallerFile}</span>
              <span>{$t.target.betterQuality}</span>
            </div>
          </div>

          <div class="flex items-start gap-3">
            <Switch id="strip-meta" bind:checked={settings.stripMetadata} />
            <div class="flex flex-col gap-0.5">
              <Label for="strip-meta">{$t.target.stripTitle}</Label>
              <p class="text-[13px] text-muted-foreground">{$t.target.stripHelp}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card class="gap-0 py-0">
        <CardContent class="flex flex-col gap-5 px-4 py-5 sm:px-6">
          <div class="flex flex-col gap-2">
            <Label for="format">{$t.target.outputFormat}</Label>
            <Select
              value={settings.format}
              onValueChange={(v) => (settings.format = v as EngineFormat)}
            >
              <SelectTrigger id="format" class="w-full">
                <SelectValue placeholder={$t.target.sameAsOriginal}>
                  {settings.format === 'same'
                    ? $t.target.sameAsOriginal
                    : settings.format.toUpperCase()}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="same" label={$t.target.sameAsOriginal} />
                  <SelectItem value="jpeg" label="JPEG" />
                  <SelectItem value="webp" label="WebP" />
                  <SelectItem value="png" label="PNG" />
                </SelectGroup>
              </SelectContent>
            </Select>
            <p class="text-[13px] text-muted-foreground">{formatHelp(settings.format)}</p>
          </div>

          {#if settings.format !== 'png'}
            <div class="flex flex-col gap-2">
              <Label for="bg-color">{$t.target.backgroundFill}</Label>
              <div class="flex items-center gap-2">
                <input
                  id="bg-color"
                  type="color"
                  bind:value={settings.background}
                  class="h-10 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-background p-1 shadow-xs"
                />
                <Input
                  type="text"
                  class="w-28 lowercase"
                  bind:value={settings.background}
                  aria-label={$t.target.backgroundHexAria}
                  spellcheck="false"
                />
              </div>
              <p class="text-[13px] text-muted-foreground">{$t.target.backgroundHelp}</p>
            </div>
          {/if}
        </CardContent>
      </Card>
    </div>
  </Tabs>

  <div class="fixed inset-x-0 bottom-0 z-40 border-t bg-background/85 backdrop-blur-md">
    <div class="mx-auto flex w-full max-w-[1080px] items-center gap-2 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:gap-3 sm:px-6">
      <Button variant="outline" onclick={onBack} disabled={busy}>
        <ArrowLeft />
        {$t.target.back}
      </Button>
      <Button size="lg" class="flex-1 sm:flex-none" onclick={onCompress} disabled={busy || count === 0}>
        {#if busy}
          <LoaderCircle class="animate-spin" />
          {progressLabel || $t.target.compressing}
        {:else}
          {interpolate(count === 1 ? $t.target.compressOne : $t.target.compressMany, { count })}
        {/if}
      </Button>
    </div>
  </div>
</section>
