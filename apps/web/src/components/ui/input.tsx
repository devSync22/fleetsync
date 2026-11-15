import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function Input({ className, type = "text", ...props }: ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-[42px] w-full min-w-0 rounded-lg border bg-card px-3 text-sm outline-none placeholder:text-faint focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand-soft disabled:opacity-50 aria-invalid:border-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
