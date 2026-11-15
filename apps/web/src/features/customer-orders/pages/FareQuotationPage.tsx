import { useParams } from 'react-router'
import { PageHeader } from '@/components/shared/PageHeader'

export function FareQuotationPage() {
  const { orderId } = useParams()

  return <PageHeader title={`Fare quotation for ${orderId}`} description="Coming soon" />
}
