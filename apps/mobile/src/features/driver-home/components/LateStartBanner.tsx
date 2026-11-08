import { Clock } from 'lucide-react-native';

import { InfoBanner } from '@/components/ui';
import { formatTime } from '@/lib/format';

/** Shown while today's trip is still Assigned after its start time. */
export function LateStartBanner({ scheduledStart }: { scheduledStart: string }) {
  return (
    <InfoBanner
      tone="pending"
      size="sm"
      icon={Clock}
      title={`Your trip was due to start at ${formatTime(scheduledStart)}`}
      message="Tap Start trip when you leave the pickup."
    />
  );
}
