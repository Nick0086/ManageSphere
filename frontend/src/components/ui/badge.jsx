import * as React from "react"
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-gray-100 text-secondary-foreground hover:bg-gray-100/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-white",
        none: ''
      },
      color: {
        indigo: "bg-indigo-500 text-white hover:bg-indigo-600",
        green: "bg-green-500 text-white hover:bg-green-600",
        red: "bg-red-500 text-white hover:bg-red-600",
        yellow: "bg-yellow-500 text-white hover:bg-yellow-600",
        orange: "bg-orange-500 text-white hover:bg-orange-600",
        pink: "bg-pink-500 text-white hover:bg-pink-600",
        purple: "bg-purple-500 text-white hover:bg-purple-600",
        teal: "bg-teal-500 text-white hover:bg-teal-600",
        blue: "bg-blue-500 text-white hover:bg-blue-600",
      },
      radius: {
        rounded: "rounded",
        pill: "rounded-full",
        square: "rounded-none",
        md: "rounded-md",
      },
      border: {
        default: "border-transparent",
        bordered: "border",
      },
      borderColors: {
        indigo: "border-indigo-500 bg-indigo-100 text-indigo-800",
        green: "border-green-500 bg-green-100 text-green-800",
        red: "border-red-500 bg-red-100 text-red-800",
        yellow: "border-yellow-500 bg-yellow-100 text-yellow-800",
        orange: "border-orange-500 bg-orange-100 text-orange-800",
        pink: "border-pink-500 bg-pink-100 text-pink-800",
        purple: "border-purple-500 bg-purple-100 text-purple-800",
        teal: "border-teal-500 bg-teal-100 text-teal-800",
        blue: "border-blue-500 bg-blue-100 text-blue-800",
        gray: "border-gray-500 bg-gray-100 text-gray-800",
      },
    },
    defaultVariants: {
      variant: "default",
      radius: "rounded",
      border: "default",
    },
  }
)

function Badge({
  className,
  variant,
  color,
  radius,
  border,
  borderColors,
  count,
  countClassName,
  ...props
}) {
  return (
    <div className={cn(className, badgeVariants({ variant, color, radius, border, borderColors }), 'gap-1')} {...props}>
      {props.children}
      {count && (
        <span className={cn("inline-block align-middle text-center text-xs font-semibold leading-none rounded-full select-none whitespace-nowrap px-1 py-1 bg-white/30", countClassName)}>
          {count}
        </span>
      )}
    </div>
  );
}

export { Badge, badgeVariants }
