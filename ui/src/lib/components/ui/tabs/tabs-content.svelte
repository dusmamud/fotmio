<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    value: string
    children?: Snippet
  }
  let { class: className, value, children }: Props = $props()
</script>

<TabsPrimitive.Content {value} data-slot="tabs-content" class={cn('flex-1 outline-none', className)}>
  {@render children?.()}
</TabsPrimitive.Content>
