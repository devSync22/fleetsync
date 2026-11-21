import { cn } from '@/lib/utils'
import type { Report } from '../types'

type DailyBarChartProps = {
  chart: Report['chart']
  /** Prefix for the tooltip label, e.g. "Oct" → "14 Oct". Empty for non-date bars. */
  labelSuffix: string
}

const PLOT_HEIGHT = 140

/**
 * Single-series bar chart from the frame: soft accent bars, the peak in solid accent, 4px rounded tops.
 * Hovering a bar shows its value; a hidden table carries the same numbers for screen readers.
 */
export function DailyBarChart({ chart, labelSuffix }: DailyBarChartProps) {
  const max = Math.max(1, ...chart.bars.map((b) => b.value))
  const peak = chart.bars.find((b) => b.value === max)
  const label = (bar: { label: string }) => (labelSuffix ? `${bar.label} ${labelSuffix}` : bar.label)

  return (
    <figure className="flex flex-col gap-2.5">
      <figcaption className="flex items-baseline">
        <span className="flex-1 text-[13px] font-semibold">{chart.title}</span>
        {peak && (
          <span className="text-xs text-muted-foreground">
            Peak {peak.value} on {label(peak)}
          </span>
        )}
      </figcaption>
      <div className="flex h-[158px] items-end gap-2" aria-hidden>
        {chart.bars.map((bar) => (
          <div key={bar.label} className="group relative flex min-w-0 flex-1 flex-col items-center gap-1">
            <span className="pointer-events-none absolute bottom-full z-10 mb-1 rounded-md bg-foreground px-2 py-1 text-[11px] whitespace-nowrap text-primary-foreground opacity-0 transition-opacity group-hover:opacity-100">
              {bar.value} {chart.unit} · {label(bar)}
            </span>
            <span
              className={cn('w-full rounded-t-[4px] transition-colors', bar === peak ? 'bg-brand' : 'bg-brand-soft group-hover:bg-brand/40')}
              style={{ height: `${(bar.value / max) * PLOT_HEIGHT}px` }}
            />
            <span className="font-mono text-[10px] text-faint">{bar.label}</span>
          </div>
        ))}
      </div>
      <table className="sr-only">
        <caption>{chart.title}</caption>
        <tbody>
          {chart.bars.map((bar) => (
            <tr key={bar.label}>
              <th scope="row">{label(bar)}</th>
              <td>
                {bar.value} {chart.unit}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}
