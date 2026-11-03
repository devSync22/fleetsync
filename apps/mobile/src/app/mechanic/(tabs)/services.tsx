import { Calendar } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function MechanicServicesRoute() {
  return (
    <PlaceholderScreen
      title="Services"
      subtitle="Preventive service schedule"
      icon={Calendar}
      emptyTitle="No services scheduled"
      emptyDescription="Upcoming and overdue vehicle services will appear here."
    />
  );
}
