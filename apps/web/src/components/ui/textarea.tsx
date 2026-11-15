import type { ComponentProps } from "react"
import { cn } from "@/lib/utils"

function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "min-h-[84px] w-full resize-y rounded-lg border border-line bg-card px-3 py-2.5 text-[13px] leading-5 outline-none placeholder:text-faint focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-ring/15 disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
