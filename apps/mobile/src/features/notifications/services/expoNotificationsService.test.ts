import * as Notifications from 'expo-notifications';

import { expoNotificationsService } from './expoNotificationsService';

const getPermissions = jest.mocked(Notifications.getPermissionsAsync);
const requestPermissions = jest.mocked(Notifications.requestPermissionsAsync);

type Permission = Awaited<ReturnType<typeof Notifications.getPermissionsAsync>>;
const permission = (status: 'granted' | 'denied' | 'undetermined', canAskAgain = true) =>
  ({ granted: status === 'granted', status, canAskAgain, expires: 'never' }) as Permission;

describe('notification permission rules', () => {
  it('returns "granted" without asking again when already allowed', async () => {
    getPermissions.mockResolvedValueOnce(permission('granted'));
    await expect(expoNotificationsService.requestPermission()).resolves.toBe('granted');
    expect(requestPermissions).not.toHaveBeenCalled();
  });

  it('does not prompt when the user denied and the phone won’t ask again', async () => {
    getPermissions.mockResolvedValueOnce(permission('denied', false));
    await expect(expoNotificationsService.requestPermission()).resolves.toBe('denied');
    expect(requestPermissions).not.toHaveBeenCalled();
  });

  it('prompts when not decided yet and returns the answer', async () => {
    getPermissions.mockResolvedValueOnce(permission('undetermined'));
    requestPermissions.mockResolvedValueOnce(permission('granted'));
    await expect(expoNotificationsService.requestPermission()).resolves.toBe('granted');
    expect(requestPermissions).toHaveBeenCalledTimes(1);
  });

  it('keeps "undetermined" when the prompt is dismissed', async () => {
    getPermissions.mockResolvedValueOnce(permission('undetermined'));
    requestPermissions.mockResolvedValueOnce(permission('undetermined'));
    await expect(expoNotificationsService.requestPermission()).resolves.toBe('undetermined');
  });

  it('treats an error from the phone as "denied"', async () => {
    getPermissions.mockRejectedValueOnce(new Error('native module missing'));
    await expect(expoNotificationsService.requestPermission()).resolves.toBe('denied');
    getPermissions.mockRejectedValueOnce(new Error('native module missing'));
    await expect(expoNotificationsService.getPermissionStatus()).resolves.toBe('denied');
  });
});

describe('notification taps', () => {
  type Response = Parameters<Parameters<typeof Notifications.addNotificationResponseReceivedListener>[0]>[0];
  const response = (data: Record<string, unknown> | null, actionIdentifier = Notifications.DEFAULT_ACTION_IDENTIFIER) =>
    ({ actionIdentifier, notification: { request: { identifier: 'ntf-1', content: { data } } } }) as unknown as Response;

  function tapWith(data: Record<string, unknown> | null, actionIdentifier?: string) {
    const listener = jest.fn();
    jest.mocked(Notifications.getLastNotificationResponse).mockReturnValueOnce(response(data, actionIdentifier));
    expoNotificationsService.onNotificationTapped(listener)();
    return listener;
  }

  it('passes a valid tap with its known fields only', () => {
    const listener = tapWith({ type: 'trip_assigned', userId: 'usr-drv-014', tripId: 'TRP-2208', extra: 'x', orderId: 7 });
    expect(listener).toHaveBeenCalledWith({
      id: 'ntf-1',
      type: 'trip_assigned',
      userId: 'usr-drv-014',
      data: { tripId: 'TRP-2208' },
    });
  });

  it('ignores a tap with an unknown type or no user', () => {
    expect(tapWith({ type: 'promo', userId: 'usr-drv-014' })).not.toHaveBeenCalled();
    expect(tapWith({ type: 'trip_assigned' })).not.toHaveBeenCalled();
    expect(tapWith(null)).not.toHaveBeenCalled();
  });

  it('ignores actions other than opening the notification', () => {
    expect(tapWith({ type: 'trip_assigned', userId: 'usr-drv-014' }, 'dismiss')).not.toHaveBeenCalled();
  });
});
