import { useEffect, useRef, useState } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import type { Profile } from '../types'

/** Avatar, name, role and employee number, with Change photo. */
export function IdentityCard({ profile }: { profile: Profile }) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo)
  }, [photo])

  return (
    <section className="flex items-center gap-4 rounded-xl border bg-card px-6 py-5" aria-label="Your account">
      {photo ? (
        <img src={photo} alt="" className="size-16 shrink-0 rounded-full object-cover" />
      ) : (
        <div aria-hidden className="flex size-16 shrink-0 items-center justify-center rounded-full bg-brand-soft text-[22px] font-semibold text-brand">
          {profile.initials}
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <h2 className="text-xl leading-7 font-semibold">{profile.details.fullName}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="neutral">{profile.roleLabel}</StatusBadge>
          <span className="text-xs text-muted-foreground">
            {profile.employeeId} · member since {profile.memberSince}
          </span>
        </div>
      </div>
      {/* TODO: upload the photo once the profile endpoint accepts one; for now it only previews here */}
      <input
        ref={fileInput}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) setPhoto(URL.createObjectURL(file))
          event.target.value = ''
        }}
      />
      <Button type="button" variant="outline" size="sm" className="shrink-0" onClick={() => fileInput.current?.click()}>
        Change photo
      </Button>
    </section>
  )
}
