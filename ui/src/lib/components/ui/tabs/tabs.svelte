<script lang="ts">
  import { Tabs as TabsPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    value?: string
    onValueChange?: (value: string) => void
    children?: Snippet
  }
  let { class: className, value = $bindable(''), onValueChange, children }: Props = $props()
</script>

<TabsPrimitive.Root bind:value {onValueChange} data-slot="tabs" class={cn('flex flex-col gap-2', className)}>
  {@render children?.()}
</TabsPrimitive.Root>
