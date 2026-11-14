<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    'aria-label'?: string
    children?: Snippet
  }
  let { class: className, 'aria-label': ariaLabel, children }: Props = $props()
</script>

<TabsPrimitive.List
  aria-label={ariaLabel}
  data-slot="tabs-list"
  class={cn('bg-muted text-muted-foreground inline-flex h-10 w-full items-center justify-center rounded-lg p-[3px]', className)}
>
  {@render children?.()}
</TabsPrimitive.List>
