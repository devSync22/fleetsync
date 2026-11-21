import { TriangleAlert } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function MechanicIssuesRoute() {
  return (
    <PlaceholderScreen
      title="Driver issues"
      subtitle="Reported by drivers"
      icon={TriangleAlert}
      emptyTitle="No open issues"
      emptyDescription="Vehicle issues reported by drivers will be listed here."
    />
  );
}
