<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    children?: Snippet
    sideOffset?: number
  }
  let { class: className, children, sideOffset = 4 }: Props = $props()
</script>

<SelectPrimitive.Portal>
  <SelectPrimitive.Content
    {sideOffset}
    data-slot="select-content"
    class={cn(
      'bg-popover text-popover-foreground relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border shadow-md data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
      className,
    )}
  >
    <SelectPrimitive.Viewport class="p-1">
      {@render children?.()}
    </SelectPrimitive.Viewport>
  </SelectPrimitive.Content>
</SelectPrimitive.Portal>
