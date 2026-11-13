import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/PageHeader'

export function CustomerOrderDetailsPage() {
  const { orderId } = useParams()

  return <PageHeader title={`Order ${orderId}`} description="Coming soon" />
}
