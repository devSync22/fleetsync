import { Search } from 'lucide-react'
import { Link } from 'react-router'
import { EmptyState } from '@/components/shared/EmptyState'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex justify-center py-16">
      <EmptyState
        className="w-74"
        icon={Search}
        tone="accent"
        title="Page not found"
        description="The link may be broken or the record may have been removed."
        action={
          <Button asChild variant="outline">
            <Link to="/">Back to dashboard</Link>
          </Button>
        }
      />
    </div>
  )
}
