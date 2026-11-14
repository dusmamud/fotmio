<script lang="ts">
  import type { EngineFormat, EngineMode } from '../engine'
  import { interpolate, t } from './i18n'
  import type { UiSettings } from './models'

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

  function setMode(mode: EngineMode) {
    settings.mode = mode
  }

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

<section class="screen">
  <div class="screen-head">
    <h2>{$t.target.heading}</h2>
    <p>
      {count === 1
        ? $t.target.appliedOne
        : interpolate($t.target.appliedMany, { count })}
    </p>
  </div>

  <div class="seg" role="tablist" aria-label={$t.target.modeAria}>
    <button
      type="button"
      role="tab"
      aria-selected={settings.mode === 'target'}
      class:active={settings.mode === 'target'}
      onclick={() => setMode('target')}>{$t.target.tabs.target}</button
    >
    <button
      type="button"
      role="tab"
      aria-selected={settings.mode === 'quality'}
      class:active={settings.mode === 'quality'}
      onclick={() => setMode('quality')}>{$t.target.tabs.quality}</button
    >
    <button
      type="button"
      role="tab"
      aria-selected={settings.mode === 'maxDimension'}
      class:active={settings.mode === 'maxDimension'}
      onclick={() => setMode('maxDimension')}>{$t.target.tabs.resize}</button
    >
  </div>
  <p class="mode-help">{$t.target.help[settings.mode]}</p>

  <div class="layout">
    <div class="panel main-panel">
      {#if settings.mode === 'target'}
        <div class="field">
          <span class="label" id="presets-label">{$t.target.presets.label}</span>
          <div class="chips" role="group" aria-labelledby="presets-label">
            <button
              type="button"
              class="chip preset"
              class:active={activePreset === 'ssc'}
              onclick={() => applyPreset('ssc')}>{$t.target.presets.ssc}</button
            >
            <button
              type="button"
              class="chip preset"
              class:active={activePreset === 'upsc'}
              onclick={() => applyPreset('upsc')}>{$t.target.presets.upsc}</button
            >
            <button
              type="button"
              class="chip preset"
              class:active={activePreset === 'passport'}
              onclick={() => applyPreset('passport')}>{$t.target.presets.passport}</button
            >
          </div>
        </div>
        <div class="field">
          <span class="label" id="chips-label">{$t.target.targetSize}</span>
          <div class="chips" role="group" aria-labelledby="chips-label">
            {#each CHIPS as chip (chip.kb)}
              <button
                type="button"
                class="chip"
                class:active={activePreset === null && settings.targetKB === chip.kb}
                onclick={() => pickChip(chip.kb)}>{chip.label}</button
              >
            {/each}
          </div>
        </div>
        <div class="field narrow">
          <label class="label" for="custom-kb">{$t.target.customSize}</label>
          <div class="input-suffix">
            <input
              id="custom-kb"
              class="input"
              type="number"
              min="5"
              max="51200"
              step="1"
              bind:value={settings.targetKB}
              oninput={() => (activePreset = null)}
            />
            <span>{$t.target.kb}</span>
          </div>
        </div>
      {/if}

      {#if settings.mode === 'maxDimension'}
        <div class="dims">
          <div class="field">
            <label class="label" for="max-w">{$t.target.maxWidth}</label>
            <input
              id="max-w"
              class="input"
              type="number"
              min="1"
              placeholder={$t.target.noLimit}
              value={dimensionValue(settings.maxWidth)}
              oninput={(e) => (settings.maxWidth = parseDimension(e.currentTarget.value))}
            />
          </div>
          <div class="field">
            <label class="label" for="max-h">{$t.target.maxHeight}</label>
            <input
              id="max-h"
              class="input"
              type="number"
              min="1"
              placeholder={$t.target.noLimit}
              value={dimensionValue(settings.maxHeight)}
              oninput={(e) => (settings.maxHeight = parseDimension(e.currentTarget.value))}
            />
          </div>
        </div>
      {/if}

      <div class="field">
        <label class="label" for="quality">
          {settings.mode === 'target' ? $t.target.qualityCap : $t.target.quality}
          <span class="value">{settings.quality}</span>
        </label>
        <input id="quality" type="range" min="1" max="100" step="1" bind:value={settings.quality} />
        <div class="range-scale"><span>{$t.target.smallerFile}</span><span>{$t.target.betterQuality}</span></div>
      </div>

      <label class="toggle">
        <input type="checkbox" bind:checked={settings.stripMetadata} />
        <span class="track" aria-hidden="true"></span>
        <span class="toggle-text">
          <strong>{$t.target.stripTitle}</strong>
          <small>{$t.target.stripHelp}</small>
        </span>
      </label>
    </div>

    <div class="panel side-panel">
      <div class="field">
        <label class="label" for="format">{$t.target.outputFormat}</label>
        <select id="format" class="input" bind:value={settings.format}>
          <option value="same">{$t.target.sameAsOriginal}</option>
          <option value="jpeg">JPEG</option>
          <option value="webp">WebP</option>
          <option value="png">PNG</option>
        </select>
        <p class="help">{formatHelp(settings.format)}</p>
      </div>

      {#if settings.format !== 'png'}
        <div class="field">
          <label class="label" for="bg">{$t.target.backgroundFill}</label>
          <div class="color-row">
            <input id="bg" type="color" bind:value={settings.background} />
            <input
              type="text"
              class="input hex"
              bind:value={settings.background}
              aria-label={$t.target.backgroundHexAria}
              spellcheck="false"
            />
          </div>
          <p class="help">{$t.target.backgroundHelp}</p>
        </div>
      {/if}
    </div>
  </div>

  <div class="actionbar">
    <div class="actions">
      <button type="button" class="btn ghost" onclick={onBack} disabled={busy}>
        {$t.target.back}
      </button>
    </div>
    <div class="actions">
      <button type="button" class="btn primary lg" onclick={onCompress} disabled={busy || count === 0}>
        {#if busy}
          <span class="spinner" aria-hidden="true"></span>
          {progressLabel || $t.target.compressing}
        {:else}
          {interpolate(count === 1 ? $t.target.compressOne : $t.target.compressMany, { count })}
        {/if}
      </button>
    </div>
  </div>
</section>

<style>
  .mode-help {
    margin: -8px 0 0;
    color: var(--text-2);
    max-width: 65ch;
  }
  .layout {
    display: grid;
    grid-template-columns: 1.65fr 1fr;
    gap: 16px;
    align-items: start;
  }
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: clamp(16px, 2.6vw, 24px);
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip.preset {
    border-style: dashed;
  }
  .chip.preset.active {
    border-style: solid;
  }
  .field.narrow {
    max-width: 240px;
  }
  .input-suffix {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .input-suffix span {
    color: var(--text-2);
    font-weight: 600;
  }
  .dims {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
  }
  input[type='range'] {
    width: 100%;
    height: 32px;
    accent-color: var(--primary);
    cursor: pointer;
  }
  .range-scale {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--text-3);
    margin-top: -6px;
  }
  .color-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  input[type='color'] {
    width: 54px;
    height: 46px;
    padding: 2px;
    border: 1px solid var(--border);
    border-radius: 11px;
    background: var(--surface);
    cursor: pointer;
    flex: none;
  }
  .hex {
    max-width: 130px;
    text-transform: lowercase;
  }
  .toggle {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    cursor: pointer;
    padding-top: 2px;
  }
  .toggle input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .toggle .track {
    flex: none;
    width: 48px;
    height: 28px;
    border-radius: 999px;
    background: var(--surface-3);
    position: relative;
    transition: background 0.15s;
    margin-top: 1px;
  }
  .toggle .track::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 22px;
    height: 22px;
    border-radius: 999px;
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    transition: transform 0.15s;
  }
  .toggle input:checked + .track {
    background: var(--primary);
  }
  .toggle input:checked + .track::after {
    transform: translateX(20px);
    background: #fff;
  }
  .toggle input:focus-visible + .track {
    outline: 2px solid var(--primary);
    outline-offset: 2px;
  }
  .toggle-text {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .toggle-text strong {
    font-size: 0.95rem;
  }
  .toggle-text small {
    color: var(--text-2);
    font-size: 0.86rem;
  }
  .spinner {
    width: 17px;
    height: 17px;
    border-radius: 999px;
    border: 2.5px solid rgb(255 255 255 / 0.35);
    border-top-color: #fff;
    animation: spin 0.7s linear infinite;
    flex: none;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 860px) {
    .layout {
      grid-template-columns: 1fr;
    }
  }
  @media (max-width: 560px) {
    .dims {
      grid-template-columns: 1fr;
    }
  }
</style>
