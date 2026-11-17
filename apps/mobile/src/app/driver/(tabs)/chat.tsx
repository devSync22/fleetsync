import { MessageCircle } from 'lucide-react-native';

import { PlaceholderScreen } from '@/components/PlaceholderScreen';

export default function DriverChatRoute() {
  return (
    <PlaceholderScreen
      title="Chat"
      subtitle="One room per order"
      icon={MessageCircle}
      emptyTitle="No conversations"
      emptyDescription="You join an order's chat room when a trip is assigned to you."
    />
  );
}
