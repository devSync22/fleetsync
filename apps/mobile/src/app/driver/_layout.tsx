import { Stack } from 'expo-router';

/** Driver area: the bottom tabs. Trip screens live inside the Home tab's stack — see (tabs)/(home)/_layout.tsx. */
export default function DriverLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
