<script lang="ts">
  import { Select as SelectPrimitive } from 'bits-ui'
  import type { Snippet } from 'svelte'

  interface Props {
    value?: string
    onValueChange?: (value: string) => void
    disabled?: boolean
    name?: string
    children?: Snippet
  }
  let { value = $bindable(''), onValueChange, disabled, name, children }: Props = $props()
</script>

<SelectPrimitive.Root type="single" bind:value {onValueChange} {disabled} {name}>
  {@render children?.()}
</SelectPrimitive.Root>
