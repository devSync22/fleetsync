import { Linking } from 'react-native';

/** Opens the phone dialer; ignored if the device can't place calls (e.g. a simulator). */
export function callContact(phone: string) {
  Linking.openURL(`tel:${phone}`).catch(() => undefined);
}
