import { fireEvent, render, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { resetTripMocks, saveMockTripUpdate } from '@/features/trips/mocks/tripMocks';

import { clearPodDraft } from '../podDraftStore';
import { ProofOfDeliveryScreen } from './ProofOfDeliveryScreen';

const TRIP_ID = 'TRP-2208';

async function renderProofOfDelivery() {
  jest.mocked(useLocalSearchParams).mockReturnValue({ tripId: TRIP_ID });
  await render(<ProofOfDeliveryScreen />);
  return screen.findByRole('button', { name: 'Continue' });
}

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 10, 16, 10, 30) });
  resetTripMocks();
  clearPodDraft(TRIP_ID);
  // Cargo picked up: proof of delivery is the next step.
  saveMockTripUpdate(TRIP_ID, { status: 'Picked up', startOdometerKm: 84_215 });
});

afterEach(() => jest.useRealTimers());

describe('Proof of delivery', () => {
  it('disables Continue while "Received by" is empty', async () => {
    const continueButton = await renderProofOfDelivery();
    await fireEvent.changeText(screen.getByLabelText('Received by'), '');

    expect(continueButton).toBeDisabled();
    expect(screen.getByText('Enter who received the cargo to continue.')).toBeOnTheScreen();
  });

  it('shows the name error after leaving the field empty', async () => {
    await renderProofOfDelivery();
    const name = screen.getByLabelText('Received by');
    await fireEvent.changeText(name, ' ');
    await fireEvent(name, 'blur');

    expect(screen.getByText('Enter the name of the person who received the cargo.')).toBeOnTheScreen();
  });

  it('enables Continue once the receiver’s name is filled in (photos and signature are optional)', async () => {
    const continueButton = await renderProofOfDelivery();
    await fireEvent.changeText(screen.getByLabelText('Received by'), '');
    expect(continueButton).toBeDisabled();

    await fireEvent.changeText(screen.getByLabelText('Received by'), 'Pradeep Kumara · Store keeper');
    expect(continueButton).toBeEnabled();
  });
});
