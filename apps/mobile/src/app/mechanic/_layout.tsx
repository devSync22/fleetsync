import { Stack } from 'expo-router';

/** Mechanic area: the tabs, plus detail screens (resolve issue, record maintenance…) added in later branches. */
export default function MechanicLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
