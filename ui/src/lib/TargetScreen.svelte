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

  function setMode(mode: EngineMode) {
    settings.mode = mode
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
  <div class="head">
    <h2>{$t.target.heading}</h2>
    <p>
      {count === 1
        ? $t.target.appliedOne
        : interpolate($t.target.appliedMany, { count })}
    </p>
  </div>

  <div class="tabs" role="tablist" aria-label={$t.target.modeAria}>
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

  <div class="panel">
    {#if settings.mode === 'target'}
      <div class="field">
        <span class="label" id="chips-label">{$t.target.targetSize}</span>
        <div class="chips" role="group" aria-labelledby="chips-label">
          {#each CHIPS as chip (chip.kb)}
            <button
              type="button"
              class="chip"
              class:active={settings.targetKB === chip.kb}
              onclick={() => (settings.targetKB = chip.kb)}>{chip.label}</button
            >
          {/each}
        </div>
      </div>
      <div class="field inline">
        <label class="label" for="custom-kb">{$t.target.customSize}</label>
        <div class="input-suffix">
          <input
            id="custom-kb"
            type="number"
            min="5"
            max="51200"
            step="1"
            bind:value={settings.targetKB}
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

    <div class="field">
      <label class="label" for="format">{$t.target.outputFormat}</label>
      <select id="format" bind:value={settings.format}>
        <option value="same">{$t.target.sameAsOriginal}</option>
        <option value="jpeg">JPEG</option>
        <option value="webp">WebP</option>
        <option value="png">PNG</option>
      </select>
      <p class="help">{formatHelp(settings.format)}</p>
    </div>

    {#if settings.format !== 'png'}
      <div class="field inline">
        <label class="label" for="bg">{$t.target.backgroundFill}</label>
        <div class="color-row">
          <input id="bg" type="color" bind:value={settings.background} />
          <input
            type="text"
            class="hex"
            bind:value={settings.background}
            aria-label={$t.target.backgroundHexAria}
            spellcheck="false"
          />
        </div>
        <p class="help">{$t.target.backgroundHelp}</p>
      </div>
    {/if}

    <label class="toggle">
      <input type="checkbox" bind:checked={settings.stripMetadata} />
      <span class="track" aria-hidden="true"></span>
      <span class="toggle-text">
        <strong>{$t.target.stripTitle}</strong>
        <small>{$t.target.stripHelp}</small>
      </span>
    </label>
  </div>

  <div class="bar">
    <button type="button" class="btn ghost" onclick={onBack} disabled={busy}>
      {$t.target.back}
    </button>
    <button type="button" class="btn primary big" onclick={onCompress} disabled={busy || count === 0}>
      {#if busy}
        {progressLabel || $t.target.compressing}
      {:else}
        {interpolate(count === 1 ? $t.target.compressOne : $t.target.compressMany, { count })}
      {/if}
    </button>
  </div>
</section>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .head h2 {
    margin: 0 0 4px;
    font-size: 1.5rem;
  }
  .head p {
    margin: 0;
    color: var(--text-2);
  }
  .tabs {
    display: flex;
    background: var(--surface-2);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 4px;
    gap: 4px;
  }
  .tabs button {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text-2);
    padding: 10px 8px;
    border-radius: 9px;
    font-weight: 600;
  }
  .tabs button.active {
    background: var(--surface);
    color: var(--primary);
    box-shadow: var(--shadow);
  }
  .mode-help {
    margin: 0;
    color: var(--text-2);
    max-width: 65ch;
  }
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .field.inline {
    max-width: 260px;
  }
  .label {
    font-weight: 600;
    font-size: 0.95rem;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
  }
  .label .value {
    color: var(--primary);
    font-variant-numeric: tabular-nums;
  }
  .help {
    margin: 0;
    font-size: 0.85rem;
    color: var(--text-2);
  }
  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    border-radius: 999px;
    padding: 8px 16px;
    font-weight: 600;
  }
  .chip:hover {
    border-color: var(--primary);
  }
  .chip.active {
    background: var(--primary);
    border-color: var(--primary);
    color: #fff;
  }
  input[type='number'],
  input[type='text'],
  select {
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    color: var(--text);
    padding: 10px 12px;
    width: 100%;
  }
  input[type='number']:focus,
  input[type='text']:focus,
  select:focus {
    outline: 2px solid var(--primary);
    outline-offset: 0;
    border-color: transparent;
  }
  .input-suffix {
    display: flex;
    align-items: center;
    gap: 8px;
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
    accent-color: var(--primary);
  }
  .range-scale {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: var(--text-3);
    margin-top: -4px;
  }
  .color-row {
    display: flex;
    gap: 10px;
    align-items: center;
  }
  input[type='color'] {
    width: 52px;
    height: 42px;
    padding: 2px;
    border: 1px solid var(--border);
    border-radius: 10px;
    background: var(--surface);
    cursor: pointer;
  }
  .hex {
    max-width: 120px;
    text-transform: lowercase;
  }
  .toggle {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    cursor: pointer;
  }
  .toggle input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
  }
  .toggle .track {
    flex: none;
    width: 46px;
    height: 26px;
    border-radius: 999px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    position: relative;
    transition: background 0.15s;
    margin-top: 2px;
  }
  .toggle .track::after {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    border-radius: 999px;
    background: var(--surface);
    box-shadow: var(--shadow);
    transition: transform 0.15s;
  }
  .toggle input:checked + .track {
    background: var(--primary);
    border-color: var(--primary);
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
  }
  .toggle-text small {
    color: var(--text-2);
  }
  .bar {
    display: flex;
    justify-content: space-between;
    gap: 12px;
  }
  .btn {
    border-radius: 10px;
    padding: 11px 18px;
    font-weight: 600;
    border: 1px solid transparent;
  }
  .btn.primary {
    background: var(--primary);
    color: #fff;
  }
  .btn.primary:hover:not(:disabled) {
    background: var(--primary-dark);
  }
  .btn.primary.big {
    padding: 13px 26px;
    font-size: 1.05rem;
  }
  .btn.ghost {
    background: var(--surface);
    border-color: var(--border);
    color: var(--text);
  }
  .btn:disabled {
    opacity: 0.6;
    cursor: default;
  }
  @media (max-width: 560px) {
    .dims {
      grid-template-columns: 1fr;
    }
    .bar {
      flex-direction: column-reverse;
    }
    .bar .btn {
      width: 100%;
    }
  }
</style>
