<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  interface Props extends HTMLAttributes<HTMLDivElement> { class?: string; children?: Snippet }
  let { class: className, children, ...restProps }: Props = $props()
</script>

<div data-slot="card-header" class={cn('grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6', className)} {...restProps}>
  {@render children?.()}
</div>
