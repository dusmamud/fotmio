<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  interface Props extends HTMLAttributes<HTMLParagraphElement> { class?: string; children?: Snippet }
  let { class: className, children, ...restProps }: Props = $props()
</script>

<p data-slot="card-description" class={cn('text-muted-foreground text-sm', className)} {...restProps}>
  {@render children?.()}
</p>
