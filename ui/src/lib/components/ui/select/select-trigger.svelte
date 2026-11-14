<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import ChevronDown from 'lucide-svelte/icons/chevron-down'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    id?: string
    children?: Snippet
  }
  let { class: className, id, children }: Props = $props()
</script>

<SelectPrimitive.Trigger
  {id}
  data-slot="select-trigger"
  class={cn(
    "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-10 w-full items-center justify-between gap-2 rounded-md border bg-background px-3 py-2 text-sm whitespace-nowrap shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    className,
  )}
>
  {@render children?.()}
  <ChevronDown class="size-4 opacity-50" />
</SelectPrimitive.Trigger>
