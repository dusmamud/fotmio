<script lang="ts">
  import { Switch as SwitchPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'

  interface Props {
    class?: string
    checked?: boolean
    disabled?: boolean
    id?: string
    onCheckedChange?: (checked: boolean) => void
  }
  let { class: className, checked = $bindable(false), disabled, id, onCheckedChange }: Props = $props()
</script>

<SwitchPrimitive.Root
  {id}
  bind:checked
  {disabled}
  {onCheckedChange}
  data-slot="switch"
  class={cn(
    'peer data-[state=checked]:bg-primary data-[state=unchecked]:bg-input focus-visible:border-ring focus-visible:ring-ring/50 dark:data-[state=unchecked]:bg-input/80 inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50',
    className,
  )}
>
  <SwitchPrimitive.Thumb
    data-slot="switch-thumb"
    class="bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none block size-5 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-[22px] data-[state=unchecked]:translate-x-0"
  />
</SwitchPrimitive.Root>
