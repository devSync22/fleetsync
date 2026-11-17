import { fireEvent, render, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';

import { AuthProvider } from '@/contexts/AuthContext';
import { resetTripMocks, saveMockTripUpdate } from '@/features/trips/mocks/tripMocks';
import { DRIVER_EMAIL, saveSessionFor } from '@/testing/session';

import { ReportIssueScreen } from './ReportIssueScreen';

const TRIP_ID = 'TRP-2208';

async function renderReportIssue() {
  await saveSessionFor(DRIVER_EMAIL);
  jest.mocked(useLocalSearchParams).mockReturnValue({ tripId: TRIP_ID });
  await render(
    <AuthProvider>
      <ReportIssueScreen />
    </AuthProvider>,
  );
  return screen.findByRole('button', { name: 'Send report' });
}

beforeEach(() => {
  jest.useFakeTimers({ now: new Date(2026, 10, 16, 10, 0) });
  resetTripMocks();
  // Reporting is only possible on an active trip.
  saveMockTripUpdate(TRIP_ID, { status: 'Started', startOdometerKm: 84_215 });
});

afterEach(() => jest.useRealTimers());

describe('Report vehicle issue', () => {
  it('shows an error for every required field when sent empty', async () => {
    const send = await renderReportIssue();
    await fireEvent.press(send);

    expect(screen.getByText('Choose what the problem is.')).toBeOnTheScreen();
    expect(screen.getByText('Tell us if you can keep driving.')).toBeOnTheScreen();
    expect(screen.getByText('Describe the problem for the mechanic.')).toBeOnTheScreen();
    expect(screen.queryByText('Report sent')).not.toBeOnTheScreen();
  });

  it('shows "Report sent" after a complete report', async () => {
    const send = await renderReportIssue();
    await fireEvent.press(screen.getByRole('radio', { name: 'Tyres' }));
    await fireEvent.press(screen.getByText('Yes, carefully'));
    await fireEvent.changeText(screen.getByLabelText('Describe it'), 'Rear left tyre looks low.');
    await fireEvent.press(send);

    expect(await screen.findByText('Report sent')).toBeOnTheScreen();
  });
});
