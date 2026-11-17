import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { AuthProvider } from '@/contexts/AuthContext';
import { DRIVER_EMAIL, saveSessionFor } from '@/testing/session';

import { ChatProvider } from '../ChatProvider';
import { MOCK_FAIL_TAG, mockRooms } from '../mocks/chatMocks';
import type { Participant } from '../types';
import { ChatRoomScreen } from './ChatRoomScreen';

// Kasun (driver) in the ORD-1053 room, on his thread with Ishara (mechanic).
async function renderChatRoom() {
  await saveSessionFor(DRIVER_EMAIL);
  jest.mocked(useLocalSearchParams).mockReturnValue({ roomId: 'ORD-1053', with: 'usr-mec-012' });
  await render(
    <AuthProvider>
      <ChatProvider>
        <ChatRoomScreen />
      </ChatProvider>
    </AuthProvider>,
  );
  const field = await screen.findByLabelText('Message Ishara…');
  // Sending is only possible once the thread has loaded.
  await waitFor(() => expect(screen.queryByLabelText('Loading messages')).not.toBeOnTheScreen());
  return field;
}

async function send(text: string) {
  const field = await renderChatRoom();
  await fireEvent.changeText(field, text);
  await fireEvent.press(screen.getByRole('button', { name: 'Send' }));
}

beforeEach(() => jest.useFakeTimers({ now: new Date(2026, 10, 16, 10, 30) }));
afterEach(() => jest.useRealTimers());

describe('Chat room', () => {
  it('shows "Sending…" and then the sent time', async () => {
    await send('Leaving the depot now');

    expect(screen.getByText('Leaving the depot now')).toBeOnTheScreen();
    expect(screen.getByText('Sending…')).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText('Sending…')).not.toBeOnTheScreen());
    expect(screen.getByText('Leaving the depot now')).toBeOnTheScreen();
    expect(screen.queryByText('Not sent · Tap to retry')).not.toBeOnTheScreen();
  });

  it('shows "Tap to retry" when sending fails, and sends on tap', async () => {
    const text = `Tyre pressure check ${MOCK_FAIL_TAG}`;
    await send(text);

    const failed = await screen.findByText('Not sent · Tap to retry');
    await fireEvent.press(failed);
    expect(screen.getByText('Sending…')).toBeOnTheScreen();
    await waitFor(() => expect(screen.queryByText('Sending…')).not.toBeOnTheScreen());
    expect(screen.queryByText('Not sent · Tap to retry')).not.toBeOnTheScreen();
    expect(screen.getByText(text)).toBeOnTheScreen();
  });

  it('lists only the coordinator and mechanic, never the customer', async () => {
    const room = mockRooms.find((candidate) => candidate.id === 'ORD-1053')!;
    const customer: Participant = { id: 'usr-cus-001', name: 'Ruwani Fernando', role: 'customer', subtitle: 'Customer' };
    const members = room.members;
    // The customer is in the order's room (web), so the mobile filter is what hides them.
    room.members = [...members, customer];
    try {
      await renderChatRoom();
      expect(screen.getByLabelText(/^Nimal Perera, Coordinator/)).toBeOnTheScreen();
      expect(screen.getByLabelText(/^Ishara Bandara, Mechanic/)).toBeOnTheScreen();
      expect(screen.queryByText(/Ruwani Fernando/)).not.toBeOnTheScreen();
      expect(screen.queryByLabelText(/Ruwani Fernando/)).not.toBeOnTheScreen();
    } finally {
      room.members = members;
    }
  });
});
