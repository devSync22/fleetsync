import { Stack } from 'expo-router';

/** Sign-in flow: sign-in, request-account, request-sent, account-approved (branch mobile-auth). */
export default function AuthLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
