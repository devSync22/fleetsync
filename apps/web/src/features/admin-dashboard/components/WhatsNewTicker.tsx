import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const ROTATE_EVERY_MS = 5000

/**
 * "What's new" pill under the dashboard greeting: shows one product update at a time and
 * rotates through them; the dots show (and pick) which one is visible.
 */
export function WhatsNewTicker({ messages }: { messages: string[] }) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (messages.length < 2) return
    const timer = setInterval(() => setIndex((i) => (i + 1) % messages.length), ROTATE_EVERY_MS)
    return () => clearInterval(timer)
  }, [messages.length])

  if (messages.length === 0) return null

  return (
    <div className="flex w-fit max-w-full items-center gap-2.5 rounded-full border bg-card py-1.5 pr-3.5 pl-1.5">
      <span className="flex shrink-0 items-center gap-1 rounded-full bg-brand px-2 py-[3px] text-xs leading-4 font-semibold text-white">
        <Sparkles className="size-3" aria-hidden />
        What’s new
      </span>
      {/* aria-live so screen readers hear the new message when it rotates. */}
      <p aria-live="polite" className="min-w-0 truncate text-[13px] leading-5 font-medium text-foreground sm:w-[330px]">
        {messages[index]}
      </p>
      <div className="flex shrink-0 items-center gap-1">
        {messages.map((message, i) => (
          <button
            key={message}
            type="button"
            aria-label={`Show update ${i + 1} of ${messages.length}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn('h-1.5 rounded-[3px] transition-all', i === index ? 'w-3.5 bg-brand' : 'w-1.5 bg-line')}
          />
        ))}
      </div>
    </div>
  )
}
