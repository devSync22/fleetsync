import { Redirect } from 'expo-router';

import { useAuth } from '@/contexts/AuthContext';

/** Entry point: sends each user to their own area. The root layout's guards keep them there. */
export default function Index() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/sign-in" />;
  }
  return <Redirect href={user.role === 'driver' ? '/driver/home' : '/mechanic/queue'} />;
}
