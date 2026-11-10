import { useState } from 'react'
import { Package, Search, X } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { InfoNote } from '@/components/shared/InfoNote'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import type { ReadyOrder } from '../types'

type ChooseOrderDialogProps = {
  orders: ReadyOrder[]
  open: boolean
  onClose: () => void
  onContinue: (orderId: string) => void
}

/** "Create a trip" (518:11998): pick the paid order the new trip will deliver. */
export function ChooseOrderDialog({ orders, open, onClose, onContinue }: ChooseOrderDialogProps) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const needle = query.trim().toLowerCase()
  const visible = orders.filter(
    (order) => !needle || order.orderId.toLowerCase().includes(needle) || order.customerName.toLowerCase().includes(needle),
  )

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      {/* Focus the search box on open instead of the close button. */}
      <DialogContent className="max-w-[600px]" onOpenAutoFocus={(event) => event.preventDefault()}>
        <div className="flex flex-col gap-4 overflow-y-auto px-6 pt-6 pb-5">
          <div className="flex items-start gap-3">
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <DialogTitle className="text-xl leading-7">Create a trip</DialogTitle>
              <DialogDescription>Trips are created from paid orders. Choose the order this trip will deliver.</DialogDescription>
            </div>
            <DialogClose className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground" aria-label="Close">
              <X className="size-5" />
            </DialogClose>
          </div>

          <label className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5">
            <Search className="size-4 shrink-0 text-faint" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search order ID or customer"
              aria-label="Search paid orders"
              autoFocus
              className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-faint"
            />
          </label>

          {orders.length === 0 ? (
            <EmptyState
              bare
              icon={Package}
              title="No paid orders waiting"
              description="Orders appear here once the customer has paid the quotation."
              action={
                <Button asChild variant="outline">
                  <Link to="/coordinator/orders">Go to Submitted orders</Link>
                </Button>
              }
            />
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-[11px] font-semibold tracking-[0.04em] text-muted-foreground">
                <span>READY FOR A TRIP · {orders.length}</span>
                <span className="font-normal tracking-normal text-faint">Paid and accepted</span>
              </div>
              <div role="radiogroup" aria-label="Paid orders" className="flex flex-col gap-2">
                {visible.length === 0 && (
                  <p className="py-3 text-center text-[13px] text-muted-foreground">No paid orders match “{query.trim()}”.</p>
                )}
                {visible.map((order) => {
                  const checked = order.orderId === selected
                  return (
                    <label
                      key={order.orderId}
                      className={cn(
                        'flex cursor-pointer items-center gap-4 rounded-[10px] border px-4 py-3 transition-colors',
                        checked ? 'border-[1.5px] border-brand bg-brand-soft' : 'hover:bg-secondary/60',
                      )}
                    >
                      <input
                        type="radio"
                        name="ready-order"
                        value={order.orderId}
                        checked={checked}
                        onChange={() => setSelected(order.orderId)}
                        className="size-[18px] shrink-0 accent-brand"
                      />
                      <span className="w-[76px] shrink-0 font-mono text-[13px] font-medium">{order.orderId}</span>
                      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <span className="text-sm font-semibold">{order.customerName}</span>
                        <span className="text-xs text-muted-foreground">
                          {order.route} · pickup {order.pickupLabel}
                        </span>
                        <span className="text-xs text-muted-foreground">{order.cargoLabel}</span>
                      </span>
                      <StatusBadge status="paid" />
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          <InfoNote>Orders waiting for a quotation or payment are not shown. Find them in Submitted orders.</InfoNote>
        </div>
        <DialogFooter className="bg-card">
          <Button type="button" variant="ghost" className="text-brand hover:text-brand" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" disabled={!selected} onClick={() => selected && onContinue(selected)}>
            {selected ? `Continue with ${selected}` : 'Continue'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
