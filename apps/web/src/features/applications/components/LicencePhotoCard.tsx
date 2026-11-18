import { useState } from 'react'
import { IdCard, RotateCw, ZoomIn } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { LicencePhoto } from '../types'

/** The photo itself, or a placeholder while there is no document storage (mock data has no URLs). */
function PhotoImage({ photo, rotation, large = false }: { photo: LicencePhoto; rotation: number; large?: boolean }) {
  const style = { transform: `rotate(${rotation}deg)` }
  if (photo.url) {
    return <img src={photo.url} alt={`Licence ${photo.side.toLowerCase()}`} style={style} className="max-h-full max-w-full object-contain transition-transform" />
  }
  return (
    <div style={style} className="flex flex-col items-center gap-2 text-faint transition-transform">
      <IdCard className={large ? 'size-24' : 'size-14'} aria-hidden />
      <span className="text-xs">Licence {photo.side.toLowerCase()} · preview not available</span>
    </div>
  )
}

/** One uploaded licence photo with rotate and zoom buttons (Applications / Review → Driving licence). */
export function LicencePhotoCard({ photo }: { photo: LicencePhoto }) {
  const [rotation, setRotation] = useState(0)
  const [zoomed, setZoomed] = useState(false)

  return (
    <figure className="overflow-hidden rounded-[10px] border">
      <div className="flex h-44 items-center justify-center overflow-hidden bg-secondary">
        <PhotoImage photo={photo} rotation={rotation} />
      </div>
      <figcaption className="flex items-center gap-2 border-t px-3 py-2.5">
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="text-[13px] font-semibold">{photo.side}</span>
          <span className="truncate text-xs text-muted-foreground">
            {photo.fileName} · {photo.size}
          </span>
        </div>
        <button
          type="button"
          aria-label={`Rotate ${photo.side.toLowerCase()} photo`}
          onClick={() => setRotation((r) => (r + 90) % 360)}
          className="flex size-8 items-center justify-center rounded-md border border-line hover:bg-secondary"
        >
          <RotateCw className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Zoom into ${photo.side.toLowerCase()} photo`}
          onClick={() => setZoomed(true)}
          className="flex size-8 items-center justify-center rounded-md border border-line hover:bg-secondary"
        >
          <ZoomIn className="size-4" aria-hidden />
        </button>
      </figcaption>

      <Dialog open={zoomed} onOpenChange={setZoomed}>
        <DialogContent className="max-w-[860px]" aria-describedby={undefined}>
          <DialogTitle className="border-b px-6 py-4">Licence · {photo.side}</DialogTitle>
          <div className="flex h-[520px] items-center justify-center bg-secondary p-6">
            <PhotoImage photo={photo} rotation={rotation} large />
          </div>
        </DialogContent>
      </Dialog>
    </figure>
  )
}
