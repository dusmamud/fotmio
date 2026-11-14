<script lang="ts">
  import { Slider as SliderPrimitive } from 'bits-ui'
  import { cn } from '$lib/utils'

  interface Props {
    class?: string
    value?: number
    min?: number
    max?: number
    step?: number
    disabled?: boolean
    id?: string
    onValueChange?: (value: number) => void
  }
  let { class: className, value = $bindable(0), min = 0, max = 100, step = 1, disabled, id, onValueChange }: Props = $props()
</script>

<SliderPrimitive.Root
  {id}
  bind:value
  type="single"
  {min}
  {max}
  {step}
  {disabled}
  {onValueChange}
  data-slot="slider"
  class={cn('relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50', className)}
>
  {#snippet children({ thumbs })}
    <span
      data-orientation="horizontal"
      class="bg-muted relative grow overflow-hidden rounded-full data-[orientation=horizontal]:h-1.5 data-[orientation=horizontal]:w-full"
    >
      <SliderPrimitive.Range class="bg-primary absolute data-[orientation=horizontal]:h-full" />
    </span>
    {#each thumbs as thumb (thumb)}
      <SliderPrimitive.Thumb
        index={thumb}
        data-slot="slider-thumb"
        class="border-primary bg-background ring-ring/50 block size-5 shrink-0 rounded-full border shadow-sm transition-[color,box-shadow] hover:ring-4 focus-visible:ring-4 focus-visible:outline-hidden disabled:pointer-events-none disabled:opacity-50"
      />
    {/each}
  {/snippet}
</SliderPrimitive.Root>
