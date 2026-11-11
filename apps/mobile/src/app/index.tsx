import { Redirect } from 'expo-router'

/**
 * App entry. Only auth screens exist so far, so everyone starts at sign-in.
 * TODO: once sign-in works, send signed-in drivers/mechanics to their home screen instead.
 */
export default function Index() {
  return <Redirect href="/sign-in" />
}
