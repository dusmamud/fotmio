<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import type { Snippet } from 'svelte'

  interface Props {
    placeholder?: string
    children?: Snippet
  }
  let { placeholder, children }: Props = $props()
</script>

<SelectPrimitive.Value data-slot="select-value" {placeholder}>
  {@render children?.()}
</SelectPrimitive.Value>
