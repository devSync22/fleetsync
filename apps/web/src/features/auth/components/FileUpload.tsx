import { CircleX, FileText, Upload, X } from 'lucide-react'
import { useId, useState, type ChangeEvent, type DragEvent } from 'react'
import { cn } from '@/lib/utils'

type FileUploadProps = {
  /** Currently selected files (controlled by the parent). */
  files: File[]
  /** Called with the new list whenever files are added or removed. */
  onChange: (files: File[]) => void
  /** Allowed file extensions, lowercase with the dot, e.g. ['.pdf', '.jpg']. */
  accept: string[]
  /** Maximum size of each file in bytes. */
  maxFileSize: number
  /** Hint under "Drop files here or browse", e.g. "PDF or JPG · up to 5 MB each". */
  hint: string
  /** Accessible name for the hidden file input, e.g. "Upload documents". */
  label: string
  /** Error from the parent's own validation (e.g. "Add at least one document"). */
  error?: string
}

/** "1.1 MB" / "640 KB" — sizes as shown in the Figma file list. */
function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`
}

/** True when the file name ends with one of the allowed extensions. */
function hasAllowedExtension(file: File, accept: string[]) {
  const name = file.name.toLowerCase()
  return accept.some((extension) => name.endsWith(extension))
}

/**
 * Drop zone + selected file list (Figma "Upload" in the staff application,
 * nodes 118:3774 and 118:3783). Files can be dropped onto the zone or picked
 * with the "browse" link. Wrong types and oversized files are rejected with a
 * message; the same file can't be added twice.
 */
export function FileUpload({ files, onChange, accept, maxFileSize, hint, label, error }: FileUploadProps) {
  const inputId = useId()
  // Highlights the drop zone while files are dragged over it.
  const [isDragging, setIsDragging] = useState(false)
  // Messages for files rejected in the last add, e.g. "photo.png: this file type isn't allowed".
  const [rejections, setRejections] = useState<string[]>([])

  /** Validates new files, then appends the valid ones to the current list. */
  function addFiles(incoming: FileList | null) {
    if (!incoming) return

    const accepted: File[] = []
    const rejected: string[] = []

    for (const file of Array.from(incoming)) {
      if (!hasAllowedExtension(file, accept)) {
        rejected.push(`${file.name}: this file type isn’t allowed`)
      } else if (file.size > maxFileSize) {
        rejected.push(`${file.name}: larger than ${formatFileSize(maxFileSize)}`)
      } else if (!files.some((f) => f.name === file.name && f.size === file.size)) {
        // Skip exact duplicates (same name and size) silently.
        accepted.push(file)
      }
    }

    setRejections(rejected)
    if (accepted.length > 0) {
      onChange([...files, ...accepted])
    }
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.target.files)
    // Reset so choosing the same file again (after removing it) still fires onChange.
    event.target.value = ''
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    addFiles(event.dataTransfer.files)
  }

  // Parent errors and rejection messages share the same red helper line style.
  const messages = [...(error ? [error] : []), ...rejections]

  return (
    <div className="flex w-full flex-col gap-4">
      <div
        className={cn(
          'relative flex flex-col items-center gap-1.5 rounded-[10px] border border-dashed border-line bg-background px-4 py-[18px] text-center',
          // Keyboard focus on the hidden input shows on the whole zone.
          'has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-brand',
          isDragging && 'border-brand bg-brand-soft',
        )}
        // preventDefault on dragover is required for the browser to allow dropping.
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <Upload aria-hidden="true" className="size-5 text-muted-foreground" />
        <p className="text-[13px] text-foreground">
          Drop files here or{' '}
          {/* The visible "browse" is a label for the hidden input, so it's keyboard-accessible via the input. */}
          <label htmlFor={inputId} className="cursor-pointer font-semibold text-brand hover:underline">
            browse
          </label>
        </p>
        <p className="text-xs text-muted-foreground">{hint}</p>
        <input
          id={inputId}
          type="file"
          multiple
          accept={accept.join(',')}
          aria-label={label}
          // Visually hidden but still focusable, so keyboard users can open the file picker.
          className="pointer-events-none absolute size-px opacity-0"
          onChange={handleInputChange}
        />
      </div>

      {messages.map((message) => (
        <p key={message} role="alert" className="-mt-2 flex items-center gap-1.5 text-xs leading-4 text-danger">
          <CircleX aria-hidden="true" className="size-3.5 shrink-0" />
          {message}
        </p>
      ))}

      {/* One row per selected file: icon, name, size and a remove button. */}
      {files.length > 0 && (
        <ul className="flex flex-col gap-4">
          {files.map((file, index) => (
            <li
              key={`${file.name}-${file.size}`}
              className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2"
            >
              <FileText aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
              {/* Long names are cut with "…" instead of pushing the size off the row. */}
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{file.name}</span>
              <span className="text-xs whitespace-nowrap text-muted-foreground">{formatFileSize(file.size)}</span>
              <button
                type="button"
                aria-label={`Remove ${file.name}`}
                className="flex cursor-pointer rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
                onClick={() => onChange(files.filter((_, i) => i !== index))}
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
