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
  <div class="screen-head">
    <h2>{$t.results.heading}</h2>
    {#if results.length > 0}
      <p class="summary-line">{summaryText($t)}</p>
    {:else}
      <p>{$t.results.noneCompressed}</p>
    {/if}
  </div>

  {#if results.length > 0}
    <div class="summary-card">
      <div class="stat">
        <span class="stat-label">{$t.resultCard.before}</span>
        <span class="stat-value">{formatBytes(totalOriginal)}</span>
      </div>
      <span class="arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-6-6 6 6-6 6" /></svg>
      </span>
      <div class="stat">
        <span class="stat-label">{$t.resultCard.after}</span>
        <span class="stat-value strong">{formatBytes(totalOutput)}</span>
      </div>
      <span class="saved-pill">
        {(() => {
          const pct = savingsPercent(totalOriginal, totalOutput)
          const percent = `${Math.abs(pct).toFixed(1)}%`
          return pct > 0
            ? interpolate($t.results.smaller, { percent })
            : pct < 0
              ? interpolate($t.results.larger, { percent })
              : $t.results.sameSize
        })()}
      </span>
    </div>
  {/if}

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

  <div class="actionbar">
    <div class="actions">
      <button type="button" class="btn ghost" onclick={onBackToSettings}>
        {$t.results.backToSettings}
      </button>
    </div>
    <div class="actions">
      <button type="button" class="btn primary" onclick={onAgain}>
        {$t.results.compressMore}
      </button>
    </div>
  </div>
</section>

<style>
  .summary-line {
    font-size: 1.02rem;
    color: var(--text-2);
  }
  .summary-card {
    display: flex;
    align-items: center;
    gap: clamp(12px, 3vw, 22px);
    flex-wrap: wrap;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow);
    padding: clamp(16px, 3vw, 22px);
  }
  .stat {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .stat-label {
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--text-3);
  }
  .stat-value {
    font-size: clamp(1.25rem, 1.1rem + 1vw, 1.6rem);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .stat-value.strong {
    color: var(--primary);
  }
  .arrow {
    color: var(--text-3);
    display: flex;
  }
  .saved-pill {
    margin-left: auto;
    background: var(--success-soft);
    color: var(--success);
    border: 1px solid color-mix(in srgb, var(--success) 25%, transparent);
    font-weight: 700;
    font-size: 0.95rem;
    border-radius: 999px;
    padding: 7px 15px;
  }
  .failures {
    background: var(--danger-soft);
    border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent);
    border-radius: var(--radius);
    padding: 15px 18px;
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
    grid-template-columns: repeat(auto-fill, minmax(min(330px, 100%), 1fr));
    gap: 16px;
  }
  @media (max-width: 520px) {
    .saved-pill {
      margin-left: 0;
    }
  }
</style>
