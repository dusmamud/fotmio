<script lang="ts">
  import { formatBytes } from './format'
  import { interpolate, t } from './i18n'
  import type { SelectedImage } from './models'

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
</script>

<section class="screen">
  <div class="screen-head">
    <h2>{$t.select.heading}</h2>
    <p>{$t.select.intro}</p>
  </div>

  <div
    class="dropzone"
    class:dragging
    class:compact={images.length > 0}
    role="button"
    tabindex="0"
    aria-label={$t.select.addImages}
    onclick={() => inputEl?.click()}
    onkeydown={(e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        inputEl?.click()
      }
    }}
    ondragover={(e) => {
      e.preventDefault()
      dragging = true
    }}
    ondragleave={() => (dragging = false)}
    ondrop={handleDrop}
  >
    <div class="dz-icon" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="34" height="34" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 16V4m0 0 4 4m-4-4L8 8" />
        <path d="M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </svg>
    </div>
    <p class="dz-title">{$t.select.dropTitle}</p>
    <p class="dz-sub">
      {$t.select.dropOr} <span class="dz-link">{$t.select.dropBrowse}</span>
      {$t.select.dropFormats}
    </p>
    <input
      bind:this={inputEl}
      type="file"
      accept="image/*"
      multiple
      hidden
      onchange={(e) => pickFiles(e.currentTarget.files)}
    />
  </div>

  {#if rejected.length > 0}
    <p class="notice" role="status">
      {interpolate(rejected.length === 1 ? $t.select.skippedOne : $t.select.skippedMany, {
        count: rejected.length,
        names: rejected.join(', '),
      })}
    </p>
  {/if}

  {#if images.length > 0}
    <div class="grid">
      {#each images as img (img.id)}
        <figure class="card">
          <img src={img.url} alt={img.file.name} loading="lazy" />
          <button
            class="remove"
            type="button"
            title={interpolate($t.select.remove, { name: img.file.name })}
            aria-label={interpolate($t.select.remove, { name: img.file.name })}
            onclick={() => onRemove(img.id)}>×</button
          >
          <figcaption>
            <span class="name" title={img.file.name}>{img.file.name}</span>
            <span class="facts">{formatBytes(img.file.size)} · {img.width}×{img.height}</span>
          </figcaption>
        </figure>
      {/each}
      <button type="button" class="add-card" onclick={() => inputEl?.click()}>
        <span class="add-plus" aria-hidden="true">+</span>
        <span>{$t.select.addMore}</span>
      </button>
    </div>

    <div class="actionbar">
      <p class="info">
        {interpolate(images.length === 1 ? $t.select.selectedOne : $t.select.selectedMany, {
          count: images.length,
          total: formatBytes(totalBytes),
        })}
      </p>
      <div class="actions">
        <button type="button" class="btn ghost" onclick={onClear}>{$t.select.clearAll}</button>
        <button type="button" class="btn primary" onclick={onNext}>{$t.select.continue}</button>
      </div>
    </div>
  {:else}
    <div class="features">
      <h3>{$t.select.features.heading}</h3>
      <div class="feature-grid">
        <div class="feature">
          <span class="f-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-3.6 8-10V5l-8-3-8 3v7c0 6.4 8 10 8 10z" />
              <path d="m9 11.5 2 2 4-4" />
            </svg>
          </span>
          <strong>{$t.select.features.offlineTitle}</strong>
          <p>{$t.select.features.offlineText}</p>
        </div>
        <div class="feature">
          <span class="f-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M13 2 4.5 13.5H11L9.5 22 19 10h-6.5L13 2z" />
            </svg>
          </span>
          <strong>{$t.select.features.speedTitle}</strong>
          <p>{$t.select.features.speedText}</p>
        </div>
        <div class="feature">
          <span class="f-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="21" height="21" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
              <rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" />
              <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
              <rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" />
            </svg>
          </span>
          <strong>{$t.select.features.batchTitle}</strong>
          <p>{$t.select.features.batchText}</p>
        </div>
      </div>
    </div>
  {/if}
</section>

<style>
  .dropzone {
    border: 2px dashed var(--border-strong);
    border-radius: var(--radius);
    background: var(--surface);
    box-shadow: var(--shadow-sm);
    padding: clamp(34px, 6vw, 56px) 20px;
    text-align: center;
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s,
      box-shadow 0.15s;
  }
  .dropzone:hover,
  .dropzone:focus-visible {
    border-color: var(--primary);
    box-shadow: var(--shadow);
    outline: none;
  }
  .dropzone.dragging {
    border-color: var(--primary);
    background: var(--primary-soft);
  }
  .dropzone.compact {
    padding: 20px;
  }
  .dropzone.compact .dz-icon {
    width: 42px;
    height: 42px;
  }
  .dropzone.compact .dz-title {
    font-size: 1rem;
  }
  .dz-icon {
    width: 62px;
    height: 62px;
    margin: 0 auto 12px;
    border-radius: 999px;
    background: var(--primary-soft);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .dz-title {
    margin: 0;
    font-size: clamp(1.05rem, 1rem + 0.6vw, 1.25rem);
    font-weight: 700;
  }
  .dz-sub {
    margin: 5px 0 0;
    color: var(--text-2);
    font-size: 0.94rem;
  }
  .dz-link {
    color: var(--primary);
    font-weight: 600;
    text-decoration: underline;
    text-underline-offset: 2px;
  }
  .notice {
    margin: 0;
    padding: 11px 14px;
    border-radius: var(--radius-sm);
    background: var(--warning-soft);
    border: 1px solid color-mix(in srgb, var(--warning) 30%, transparent);
    color: var(--warning);
    font-size: 0.9rem;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(168px, 46vw), 1fr));
    gap: 14px;
  }
  .card {
    margin: 0;
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow-sm);
    transition: box-shadow 0.15s;
  }
  .card:hover {
    box-shadow: var(--shadow);
  }
  .card img {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    background: var(--surface-2);
  }
  .card figcaption {
    padding: 9px 11px 10px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .name {
    font-size: 0.86rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .facts {
    font-size: 0.79rem;
    color: var(--text-2);
    font-variant-numeric: tabular-nums;
  }
  .remove {
    position: absolute;
    top: 7px;
    right: 7px;
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 999px;
    background: rgb(15 23 42 / 0.72);
    color: #fff;
    font-size: 1.05rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .remove:hover {
    background: var(--danger);
  }
  .add-card {
    min-height: 132px;
    border: 2px dashed var(--border-strong);
    border-radius: var(--radius);
    background: transparent;
    color: var(--text-2);
    font-weight: 600;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    transition:
      border-color 0.15s,
      color 0.15s;
  }
  .add-card:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
  .add-plus {
    font-size: 1.7rem;
    font-weight: 400;
    line-height: 1;
  }

  .features h3 {
    margin: 0 0 12px;
    font-size: 1.02rem;
    font-weight: 700;
  }
  .feature-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 14px;
  }
  .feature {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    padding: 18px;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .f-icon {
    width: 40px;
    height: 40px;
    border-radius: 11px;
    background: var(--primary-soft);
    color: var(--primary);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 5px;
  }
  .feature strong {
    font-size: 0.97rem;
  }
  .feature p {
    margin: 0;
    color: var(--text-2);
    font-size: 0.89rem;
  }

  @media (max-width: 639px) {
    .feature-grid {
      grid-template-columns: 1fr;
    }
    .feature {
      flex-direction: row;
      flex-wrap: wrap;
      align-items: center;
      column-gap: 12px;
    }
    .f-icon {
      margin-bottom: 0;
    }
    .feature p {
      flex-basis: 100%;
    }
  }
</style>
