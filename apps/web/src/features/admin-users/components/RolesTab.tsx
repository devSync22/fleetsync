import { Banner } from '@/components/shared/Banner'
import { TableSkeleton } from '@/components/shared/TableSkeleton'
import { Button } from '@/components/ui/button'
import { usePermissions } from '../hooks/usePermissions'
import { PermissionsMatrix } from './PermissionsMatrix'

/** "Roles & permissions" tab (57:791): explains that access follows the role, then the matrix. */
export function RolesTab() {
  const { state, retry } = usePermissions()

  return (
    <div className="flex flex-col gap-5">
      <Banner
        tone="info"
        title="Access follows the role"
        message="Each user has exactly one role, set by a Fleet Administrator. To change what someone can do, open their profile and change their role."
      />
      {state.status === 'loading' && <TableSkeleton rows={8} />}
      {state.status === 'error' && (
        <Banner
          tone="danger"
          title="Couldn’t load permissions"
          message={state.error.message}
          action={
            <Button type="button" variant="outline" size="sm" onClick={retry}>
              Try again
            </Button>
          }
        />
      )}
      {state.status === 'success' && <PermissionsMatrix modules={state.data} />}
    </div>
  )
}
