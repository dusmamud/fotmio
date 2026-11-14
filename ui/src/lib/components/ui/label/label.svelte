<script lang="ts">
  import { Label as LabelPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'

  interface Props {
    class?: string
    for?: string
    children?: Snippet
  }
  let { class: className, for: forId, children }: Props = $props()
</script>

<LabelPrimitive.Root
  for={forId}
  data-slot="label"
  class={cn('flex items-center gap-2 text-sm leading-none font-medium select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50', className)}
>
  {@render children?.()}
</LabelPrimitive.Root>
