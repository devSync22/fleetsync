import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/PageHeader'

export function PaymentPage() {
  const { orderId } = useParams()

  return <PageHeader title={`Pay for ${orderId}`} description="Coming soon" />
}
