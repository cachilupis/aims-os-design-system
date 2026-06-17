import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Button — AIMS OS Design System
 *
 * Variants match DS "Buttons-NEW" component set (Figma: v6rmYKA2zmyXWOahlxLOeI)
 *   primary   → Type=Primary   — filled blue, main action
 *   secondary → Type=Secondary — outlined blue, secondary action
 *   ghost     → Type=Tertiary  — no border/bg, inline action
 *   main      → Type=Main Action — gradient blue, hero CTA
 *   danger    → destructive error action
 *
 * Sizes: sm (S=28px), default (M=36px), lg (L=44px), icon (square icon-only)
 */
const buttonVariants = cva(
  // Base — shared across all variants
  [
    "inline-flex shrink-0 items-center justify-center gap-2x",
    "rounded-sm font-semibold whitespace-nowrap select-none",
    "transition-colors duration-150",
    "outline-none focus-visible:ring-2 focus-visible:ring-[#2b7fff] focus-visible:ring-offset-1 focus-visible:ring-offset-canvas",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        // Primary — bg surface/primary/emphasis, white text
        primary: [
          "bg-[#2b7fff] text-white border border-transparent",
          "hover:bg-[#155dfc]",
          "active:bg-[#1032a0]",
        ],

        // Secondary — outlined blue
        secondary: [
          "bg-transparent text-[#2b7fff] border border-[#2b7fff]",
          "hover:bg-[#2b7fff14]",
          "active:bg-[#155dfc26]",
        ],

        // Ghost / Tertiary — no border, text only
        ghost: [
          "bg-transparent text-[#2b7fff] border border-transparent",
          "hover:bg-[#2b7fff14]",
          "active:bg-[#155dfc26]",
        ],

        // Main Action — gradient CTA
        main: [
          "bg-[#155dfc] text-white border border-transparent",
          "[background:linear-gradient(135deg,#2b7fff,#1032a0)]",
          "hover:opacity-90",
          "active:opacity-80",
        ],

        // Danger / Destructive — error action
        danger: [
          "bg-transparent text-[#ff6467] border border-[#e05252]",
          "hover:bg-[#fb2c361a]",
          "active:bg-[#2d1515]",
        ],
      },

      size: {
        sm:      "h-[28px] px-3x text-type-sm",
        default: "h-[36px] px-4x text-type-base",
        lg:      "h-[44px] px-5x text-type-md",
        icon:    "h-[36px] w-[36px] p-0",
        "icon-sm": "h-[28px] w-[28px] p-0",
        "icon-lg": "h-[44px] w-[44px] p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
