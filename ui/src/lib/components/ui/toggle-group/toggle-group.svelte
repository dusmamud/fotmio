<script lang="ts">
  import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    value?: string
    onValueChange?: (value: string) => void
    'aria-label'?: string
    children?: Snippet
  }
  let { class: className, value = $bindable(''), onValueChange, 'aria-label': ariaLabel, children }: Props = $props()
</script>

<ToggleGroupPrimitive.Root
  bind:value
  type="single"
  {onValueChange}
  aria-label={ariaLabel}
  data-slot="toggle-group"
  class={cn('flex flex-wrap items-center gap-2', className)}
>
  {@render children?.()}
</ToggleGroupPrimitive.Root>
