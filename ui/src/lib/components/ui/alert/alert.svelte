<script lang="ts" module>
  import { tv, type VariantProps } from 'tailwind-variants'
  export const alertVariants = tv({
    base: 'relative w-full rounded-lg border px-4 py-3 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
    variants: {
      variant: {
        default: 'bg-card text-card-foreground',
        destructive: 'text-destructive bg-card [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/80',
      },
    },
    defaultVariants: { variant: 'default' },
  })
  export type AlertVariant = VariantProps<typeof alertVariants>['variant']
</script>

<script lang="ts">
  import { cn } from '$lib/utils'
  import type { Snippet } from 'svelte'
  import type { HTMLAttributes } from 'svelte/elements'
  interface Props extends HTMLAttributes<HTMLDivElement> { class?: string; variant?: AlertVariant; children?: Snippet }
  let { class: className, variant = 'default', children, ...restProps }: Props = $props()
</script>

<div data-slot="alert" role="alert" class={cn(alertVariants({ variant }), className)} {...restProps}>
  {@render children?.()}
</div>
