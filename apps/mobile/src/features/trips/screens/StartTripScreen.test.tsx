import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { router, useLocalSearchParams } from 'expo-router';

import { resetTripMocks } from '../mocks/tripMocks';
import { StartTripScreen } from './StartTripScreen';

// TRP-2208 is Assigned for 09:30 today on WP LB-7702, last reading 84,210 km.
async function renderStartTrip() {
  jest.mocked(useLocalSearchParams).mockReturnValue({ tripId: 'TRP-2208' });
  await render(<StartTripScreen />);
  return screen.findByRole('button', { name: 'Confirm and start trip' });
}

async function typeReading(digits: string) {
  for (const digit of digits) await fireEvent.press(screen.getByRole('button', { name: digit }));
}

beforeEach(() => {
  resetTripMocks();
  jest.useFakeTimers({ now: new Date(2026, 10, 16, 8, 0) });
});

afterEach(() => jest.useRealTimers());

describe('Start trip', () => {
  it('keeps "Confirm and start trip" disabled until a reading is entered', async () => {
    const confirm = await renderStartTrip();
    expect(confirm).toBeDisabled();
  });

  it('blocks a reading below the vehicle’s last reading', async () => {
    const confirm = await renderStartTrip();
    await typeReading('84209');
    expect(screen.getByText(/Must be at least .* the vehicle’s last recorded reading\./)).toBeOnTheScreen();
    expect(confirm).toBeDisabled();
  });

  it('starts the trip with a valid reading and opens Active trip', async () => {
    const confirm = await renderStartTrip();
    await typeReading('84250');
    expect(screen.getByText(/more than the last reading/)).toBeOnTheScreen();
    expect(confirm).toBeEnabled();

    await fireEvent.press(confirm);
    await waitFor(() =>
      expect(router.replace).toHaveBeenCalledWith({ pathname: '/driver/trip/[tripId]/active', params: { tripId: 'TRP-2208' } }),
    );
  });
});
