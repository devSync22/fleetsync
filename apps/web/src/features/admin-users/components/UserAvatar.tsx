import { InitialsAvatar } from '@/components/shared/InitialsAvatar'
import { initialsOf } from '@/lib/utils'

/** People get an accent avatar; customer companies a neutral grey one (as in the All users frame). */
export function UserAvatar({ name, isCompany = false }: { name: string; isCompany?: boolean }) {
  return <InitialsAvatar initials={initialsOf(name)} tone={isCompany ? 'neutral' : 'accent'} />
}
