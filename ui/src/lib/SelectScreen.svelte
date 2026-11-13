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
  <div class="head">
    <h2>{$t.select.heading}</h2>
    <p>{$t.select.intro}</p>
  </div>

  <div
    class="dropzone"
    class:dragging
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
      <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-4.5-4.5a1.5 1.5 0 0 0-2 0L6 19" />
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
    </div>

    <div class="bar">
      <p class="count">
        {interpolate(images.length === 1 ? $t.select.selectedOne : $t.select.selectedMany, {
          count: images.length,
          total: formatBytes(totalBytes),
        })}
      </p>
      <div class="bar-actions">
        <button type="button" class="btn ghost" onclick={onClear}>{$t.select.clearAll}</button>
        <button type="button" class="btn primary" onclick={onNext}>{$t.select.continue}</button>
      </div>
    </div>
  {/if}
</section>

<style>
  .screen {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
  .head h2 {
    margin: 0 0 4px;
    font-size: 1.5rem;
  }
  .head p {
    margin: 0;
    color: var(--text-2);
    max-width: 60ch;
  }
  .dropzone {
    border: 2px dashed var(--border);
    border-radius: var(--radius);
    background: var(--surface);
    padding: 40px 20px;
    text-align: center;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
  }
  .dropzone:hover,
  .dropzone:focus-visible {
    border-color: var(--primary);
    outline: none;
  }
  .dropzone.dragging {
    border-color: var(--primary);
    background: var(--primary-soft);
  }
  .dz-icon {
    color: var(--primary);
    display: flex;
    justify-content: center;
    margin-bottom: 8px;
  }
  .dz-title {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
  }
  .dz-sub {
    margin: 4px 0 0;
    color: var(--text-2);
  }
  .dz-link {
    color: var(--primary);
    font-weight: 600;
    text-decoration: underline;
  }
  .notice {
    margin: 0;
    padding: 10px 14px;
    border-radius: 10px;
    background: var(--warning-soft);
    color: var(--warning);
    font-size: 0.9rem;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 14px;
  }
  .card {
    margin: 0;
    position: relative;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    box-shadow: var(--shadow);
  }
  .card img {
    width: 100%;
    height: 120px;
    object-fit: cover;
    background: var(--surface-2);
  }
  .card figcaption {
    padding: 8px 10px;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .name {
    font-size: 0.85rem;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .facts {
    font-size: 0.8rem;
    color: var(--text-2);
  }
  .remove {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 999px;
    background: rgb(15 23 42 / 0.72);
    color: #fff;
    font-size: 1rem;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .remove:hover {
    background: var(--danger);
  }
  .bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
  }
  .count {
    margin: 0;
    color: var(--text-2);
    font-weight: 600;
  }
  .bar-actions {
    display: flex;
    gap: 10px;
  }
  .btn {
    border-radius: 10px;
    padding: 10px 18px;
    font-weight: 600;
    border: 1px solid transparent;
  }
  .btn.primary {
    background: var(--primary);
    color: #fff;
  }
  .btn.primary:hover {
    background: var(--primary-dark);
  }
  .btn.ghost {
    background: var(--surface);
    border-color: var(--border);
    color: var(--text);
  }
  .btn.ghost:hover {
    border-color: var(--text-3);
  }
</style>
