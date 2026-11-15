import { SectionCard } from '@/components/shared/SectionCard'

/** "Message from the coordinator": the note sent with the quotation, and who sent it when. */
export function CoordinatorMessageCard({ message, meta }: { message: string; meta: string }) {
  return (
    <SectionCard title="Message from the coordinator">
      <div className="flex flex-col gap-2 px-5 py-[18px]">
        <p className="text-sm leading-5 whitespace-pre-line">{message}</p>
        <p className="text-xs text-muted-foreground">{meta}</p>
      </div>
    </SectionCard>
  )
}
