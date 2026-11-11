import { useId, useState, type ChangeEvent, type DragEvent } from 'react'
import fileIcon from '@/assets/icons/file.svg'
import uploadIcon from '@/assets/icons/upload.svg'
import xIcon from '@/assets/icons/x.svg'
import xCircleSmallIcon from '@/assets/icons/x-circle-sm.svg'
import styles from './FileUpload.module.css'

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
 * Drop zone + selected file list (Figma "Upload" in the staff application).
 * Files can be dropped onto the zone or picked with the "browse" link.
 * Files with the wrong type or over the size limit are rejected with a message;
 * the same file can't be added twice.
 */
export function FileUpload({
  files,
  onChange,
  accept,
  maxFileSize,
  hint,
  label,
  error,
}: FileUploadProps) {
  const inputId = useId()
  // Highlights the drop zone while files are dragged over it.
  const [isDragging, setIsDragging] = useState(false)
  // Messages for files rejected in the last add, e.g. "photo.png isn't a PDF or JPG".
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

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index))
  }

  // Parent errors and rejection messages share the same red helper line style.
  const messages = [...(error ? [error] : []), ...rejections]

  return (
    <div className={styles.wrapper}>
      <div
        className={[styles.dropZone, isDragging && styles.dragging].filter(Boolean).join(' ')}
        // preventDefault on dragover is required for the browser to allow dropping.
        onDragOver={(event) => {
          event.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <img src={uploadIcon} width={20} height={20} alt="" />
        <p className={styles.prompt}>
          Drop files here or{' '}
          {/* The visible "browse" is a label for the hidden input, so it's keyboard-accessible via the input. */}
          <label htmlFor={inputId} className={styles.browse}>
            browse
          </label>
        </p>
        <p className={styles.hint}>{hint}</p>
        <input
          id={inputId}
          type="file"
          multiple
          accept={accept.join(',')}
          aria-label={label}
          className={styles.input}
          onChange={handleInputChange}
        />
      </div>

      {messages.map((message) => (
        <p key={message} className={styles.error} role="alert">
          <img src={xCircleSmallIcon} width={14} height={14} alt="" />
          {message}
        </p>
      ))}

      {/* One row per selected file: icon, name, size and a remove button. */}
      {files.length > 0 && (
        <ul className={styles.list}>
          {files.map((file, index) => (
            <li key={`${file.name}-${file.size}`} className={styles.item}>
              <img src={fileIcon} width={16} height={16} alt="" />
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
              <button
                type="button"
                className={styles.remove}
                aria-label={`Remove ${file.name}`}
                onClick={() => removeFile(index)}
              >
                <img src={xIcon} width={14} height={14} alt="" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
