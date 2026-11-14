<script lang="ts">
  import { cn } from '$lib/utils'
  import type { HTMLInputAttributes } from 'svelte/elements'

  interface Props extends HTMLInputAttributes {
    class?: string
    value?: string | number | null
  }
  let { class: className, value = $bindable(), ...restProps }: Props = $props()
</script>

<input
  bind:value
  data-slot="input"
  class={cn(
    'border-input bg-background selection:bg-primary selection:text-primary-foreground flex h-10 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
    'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
    className,
  )}
  {...restProps}
/>
