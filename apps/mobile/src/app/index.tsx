import { Redirect } from 'expo-router';

/** Until sign-in is built (branch mobile-auth), the app opens on the driver tabs. */
export default function Index() {
  return <Redirect href="/driver/home" />;
}
