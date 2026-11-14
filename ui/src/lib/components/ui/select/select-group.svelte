<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import type { Snippet } from 'svelte'

  interface Props {
    children?: Snippet
  }
  let { children }: Props = $props()
</script>

<SelectPrimitive.Group data-slot="select-group">
  {@render children?.()}
</SelectPrimitive.Group>
