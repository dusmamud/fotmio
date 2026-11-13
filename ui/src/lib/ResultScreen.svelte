<script lang="ts">
  import { formatBytes, savingsPercent } from './format'
  import { interpolate, t, type Dictionary } from './i18n'
  import type { FailedPhoto, PhotoResult } from './models'
  import ResultCard from './ResultCard.svelte'

  interface Props {
    results: PhotoResult[]
    failures: FailedPhoto[]
    onAgain: () => void
    onBackToSettings: () => void
  }

  let { results, failures, onAgain, onBackToSettings }: Props = $props()

  const totalOriginal = $derived(results.reduce((s, r) => s + r.originalBytes, 0))
  const totalOutput = $derived(results.reduce((s, r) => s + r.meta.outputBytes, 0))

  function summaryText(dict: Dictionary): string {
    const pct = savingsPercent(totalOriginal, totalOutput)
    const percent = `${Math.abs(pct).toFixed(1)}%`
    const savings =
      pct > 0
        ? interpolate(dict.results.smaller, { percent })
        : pct < 0
          ? interpolate(dict.results.larger, { percent })
          : dict.results.sameSize
    return interpolate(results.length === 1 ? dict.results.summaryOne : dict.results.summaryMany, {
      count: results.length,
      original: formatBytes(totalOriginal),
      output: formatBytes(totalOutput),
      savings,
    })
  }
</script>

<section class="screen">
  <div class="head">
    <h2>{$t.results.heading}</h2>
    {#if results.length > 0}
      <p class="summary">{summaryText($t)}</p>
    {:else}
      <p>{$t.results.noneCompressed}</p>
    {/if}
  </div>

  {#if failures.length > 0}
    <div class="failures" role="alert">
      <h3>
        {interpolate(
          failures.length === 1 ? $t.results.failedHeadingOne : $t.results.failedHeadingMany,
          { count: failures.length },
        )}
      </h3>
      <ul>
        {#each failures as f (f.name)}
          <li><strong>{f.name}</strong> — {f.message}</li>
        {/each}
      </ul>
    </div>
  {/if}

  {#if results.length > 0}
    <div class="grid">
      {#each results as result (result.id)}
        <ResultCard {result} />
      {/each}
    </div>
  {/if}

  <div class="bar">
    <button type="button" class="btn ghost" onclick={onBackToSettings}>
      {$t.results.backToSettings}
    </button>
    <button type="button" class="btn primary" onclick={onAgain}>
      {$t.results.compressMore}
    </button>
  </div>
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
  }
  .summary {
    font-size: 1.05rem;
    color: var(--text) !important;
  }
  .failures {
    background: var(--danger-soft);
    border: 1px solid var(--danger);
    border-radius: var(--radius);
    padding: 14px 18px;
    color: var(--danger);
  }
  .failures h3 {
    margin: 0 0 6px;
    font-size: 1rem;
  }
  .failures ul {
    margin: 0;
    padding-left: 18px;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
  .bar {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
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
  .btn.primary:hover {
    background: var(--primary-dark);
  }
  .btn.ghost {
    background: var(--surface);
    border-color: var(--border);
    color: var(--text);
  }
</style>
