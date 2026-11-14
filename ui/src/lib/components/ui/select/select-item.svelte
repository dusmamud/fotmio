<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import Check from 'lucide-svelte/icons/check'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    value: string
    label?: string
    disabled?: boolean
    children?: Snippet
  }
  let { class: className, value, label, disabled, children: itemChildren }: Props = $props()
</script>

<SelectPrimitive.Item
  {value}
  {label}
  {disabled}
  data-slot="select-item"
  class={cn(
    "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-2 pr-8 pl-2 text-sm outline-hidden select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
    className,
  )}
>
  {#snippet children({ selected })}
    <span class="absolute right-2 flex size-3.5 items-center justify-center">
      {#if selected}
        <Check class="size-4" />
      {/if}
    </span>
    {#if itemChildren}
      {@render itemChildren()}
    {:else}
      {label}
    {/if}
  {/snippet}
</SelectPrimitive.Item>
