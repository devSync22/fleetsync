import { Stack } from 'expo-router';

/** Driver area: the tabs, plus trip-flow screens (trip/[tripId]/…) added in later branches. */
export default function DriverLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
