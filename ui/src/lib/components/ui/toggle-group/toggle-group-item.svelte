<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    value: string
    children?: Snippet
  }
  let { class: className, value, children }: Props = $props()
</script>

<ToggleGroupPrimitive.Item
  {value}
  data-slot="toggle-group-item"
  class={cn(
    'border-input bg-background hover:bg-accent hover:text-accent-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:border-primary inline-flex h-10 shrink-0 items-center justify-center rounded-full border px-4 text-sm font-medium whitespace-nowrap shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50',
    className,
  )}
>
  {@render children?.()}
</ToggleGroupPrimitive.Item>
