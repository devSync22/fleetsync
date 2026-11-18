import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'

type SideSheetProps = {
  open: boolean
  onClose: () => void
  /** Small muted heading in the sheet's top bar, e.g. "User profile". */
  heading: string
  children: ReactNode
  /** Sticky footer buttons. */
  footer?: ReactNode
}

/**
 * Panel that slides in from the right over a dimmed page (Admin → User accounts / View profile).
 * Built on the Radix dialog, so focus is trapped and Escape / clicking outside closes it.
 */
export function SideSheet({ open, onClose, heading, children, footer }: SideSheetProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/45 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[520px] flex-col bg-card shadow-xl outline-none data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:animate-in data-[state=open]:slide-in-from-right"
        >
          <div className="flex items-center justify-between border-b px-6 py-3.5">
            <DialogPrimitive.Title className="text-[13px] font-semibold text-muted-foreground">{heading}</DialogPrimitive.Title>
            <DialogPrimitive.Close aria-label="Close" className="rounded-md p-1 text-muted-foreground hover:bg-secondary">
              <X className="size-5" aria-hidden />
            </DialogPrimitive.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
          {footer && <div className="flex justify-end gap-2 border-t bg-background px-6 py-4">{footer}</div>}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
