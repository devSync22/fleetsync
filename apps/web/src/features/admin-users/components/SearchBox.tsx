import { SearchInput } from '@/components/shared/SearchInput'

/** The grey search field at the start of each list card's filter row. */
export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <SearchInput
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      label={placeholder}
      className="w-[280px] border-0 bg-secondary py-[9px]"
    />
  )
}
