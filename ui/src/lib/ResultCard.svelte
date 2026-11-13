<script lang="ts">
  import { formatBytes, savingsPercent } from './format'
  import { interpolate, t, type Dictionary } from './i18n'
  import type { PhotoResult } from './models'

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

<article class="card">
  <header>
    <h3 title={result.name}>{result.name}</h3>
    <span
      class="badge"
      title={result.engine === 'wasm'
        ? $t.resultCard.rustEngineTitle
        : $t.resultCard.browserEngineTitle}
    >
      {result.engine === 'wasm' ? $t.resultCard.rustEngine : $t.resultCard.browserEngine}
    </span>
  </header>

  <div class="preview">
    <img
      src={view === 'after' ? result.url : result.originalUrl}
      alt={interpolate(
        view === 'after' ? $t.resultCard.compressedAlt : $t.resultCard.originalAlt,
        { name: result.name },
      )}
    />
    <div class="switch" role="group" aria-label={$t.resultCard.previewVersion}>
      <button type="button" class:active={view === 'before'} onclick={() => (view = 'before')}>
        {$t.resultCard.before}
      </button>
      <button type="button" class:active={view === 'after'} onclick={() => (view = 'after')}>
        {$t.resultCard.after}
      </button>
    </div>
  </div>

  <p class="headline">
    {formatBytes(result.originalBytes)} <span aria-hidden="true">→</span>
    <strong>{formatBytes(meta.outputBytes)}</strong>
    <span class="saving">{savingsLabel(result.originalBytes, meta.outputBytes, $t.results)}</span>
  </p>

  {#if !meta.targetMet}
    <p class="warn">{$t.resultCard.targetNotMet}</p>
  {/if}

  <dl class="facts">
    <div>
      <dt>{$t.resultCard.format}</dt>
      <dd>{meta.format.toUpperCase()}</dd>
    </div>
    <div>
      <dt>{$t.resultCard.dimensions}</dt>
      <dd>
        {meta.outWidth}×{meta.outHeight}{#if resized}
          <span class="was">{interpolate($t.resultCard.was, { dimensions: originalDims })}</span
          >{/if}
      </dd>
    </div>
    <div>
      <dt>{$t.resultCard.qualityUsed}</dt>
      <dd>{meta.format === 'png' ? $t.resultCard.lossless : meta.qualityUsed}</dd>
    </div>
  </dl>

  <a class="btn primary" href={result.url} download={result.downloadName}>
    {$t.resultCard.download}
  </a>
</article>

<style>
  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  h3 {
    margin: 0;
    font-size: 1rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .badge {
    flex: none;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    color: var(--primary);
    background: var(--primary-soft);
    border-radius: 999px;
    padding: 3px 9px;
  }
  .preview {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background: var(--surface-2);
  }
  .preview img {
    width: 100%;
    height: 190px;
    object-fit: contain;
  }
  .switch {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    background: rgb(15 23 42 / 0.72);
    border-radius: 999px;
    padding: 3px;
    gap: 2px;
  }
  .switch button {
    border: none;
    background: transparent;
    color: #cbd5e1;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 4px 12px;
    border-radius: 999px;
  }
  .switch button.active {
    background: #fff;
    color: #0f172a;
  }
  .headline {
    margin: 0;
    font-size: 1.02rem;
  }
  .headline .saving {
    color: var(--success);
    font-weight: 700;
    margin-left: 6px;
  }
  .warn {
    margin: 0;
    padding: 9px 12px;
    border-radius: 9px;
    background: var(--warning-soft);
    color: var(--warning);
    font-size: 0.85rem;
  }
  .facts {
    margin: 0;
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  .facts div {
    background: var(--surface-2);
    border-radius: 9px;
    padding: 7px 10px;
  }
  .facts dt {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-3);
    font-weight: 700;
  }
  .facts dd {
    margin: 1px 0 0;
    font-size: 0.88rem;
    font-weight: 600;
  }
  .facts .was {
    display: block;
    font-size: 0.75rem;
    color: var(--text-2);
    font-weight: 500;
  }
  .btn {
    border-radius: 10px;
    padding: 10px 18px;
    font-weight: 600;
    text-align: center;
    text-decoration: none;
    margin-top: auto;
  }
  .btn.primary {
    background: var(--primary);
    color: #fff;
  }
  .btn.primary:hover {
    background: var(--primary-dark);
  }
</style>
