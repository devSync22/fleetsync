import { Bell } from 'lucide-react-native';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ActionBar,
  Chip,
  FormSection,
  InfoBanner,
  KeyboardAwareScroll,
  PhotoField,
  ScreenHeader,
  TextField,
} from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { useTripAction, type Trip } from '@/features/trips';
import type { PickedPhoto } from '@/hooks/usePhotoPicker';
import { formatDistance, formatTime } from '@/lib/format';
import { colors, spacing, typography } from '@/theme';

import { DESCRIPTION_MAX_LENGTH, ISSUE_TYPES, MAX_ISSUE_PHOTOS } from '../constants';
import { issueHeaderSubtitle, notifiedPeople } from '../notifiedPeople';
import { reportIssue } from '../services/issuesService';
import type { IssueSeverity, IssueType, VehicleIssue } from '../types';
import { validateDescription, validateIssueType, validateSeverity } from '../validation';
import { KeepDrivingOption } from './KeepDrivingOption';

type ReportIssueFormProps = {
  trip: Trip;
  onSent: (issue: VehicleIssue) => void;
  /** Reload the trip (the coordinator cancelled it meanwhile). */
  onCancelled: () => void;
};

function FieldError({ message }: { message: string | undefined }) {
  return message ? <Text style={[typography.caption, styles.error]}>{message}</Text> : null;
}

/** Driver — Report vehicle issue (Figma 173:6520). The vehicle is the one on this trip. */
export function ReportIssueForm({ trip, onSent, onCancelled }: ReportIssueFormProps) {
  const { user } = useAuth();
  const [type, setType] = useState<IssueType | null>(null);
  const [severity, setSeverity] = useState<IssueSeverity | null>(null);
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<PickedPhoto[]>([]);
  // Errors show after the first Send report, then update as the driver fixes them.
  const [showErrors, setShowErrors] = useState(false);

  const errors = {
    type: validateIssueType(type),
    severity: validateSeverity(severity),
    description: validateDescription(description),
  };
  const isValid = !errors.type && !errors.severity && !errors.description;

  const { state, run } = useTripAction(
    () => {
      if (!user) throw new Error('Sign in again to report an issue.');
      return reportIssue(
        trip,
        { tripId: trip.id, type: type as IssueType, severity: severity as IssueSeverity, description, photos },
        { id: user.id, name: user.name },
      );
    },
    onSent,
    onCancelled,
  );

  function handleSend() {
    setShowErrors(true);
    if (isValid) run();
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Report vehicle issue" subtitle={issueHeaderSubtitle(trip)} />
      <KeyboardAwareScroll contentContainerStyle={styles.body}>
        <FormSection title="What is the problem?">
          <View style={styles.chips} accessibilityRole="radiogroup" accessibilityLabel="What is the problem?">
            {ISSUE_TYPES.map((option) => (
              <Chip key={option} variant="choice" label={option} selected={option === type} onPress={() => setType(option)} />
            ))}
          </View>
          <FieldError message={showErrors ? errors.type : undefined} />
        </FormSection>

        <FormSection title="Can you keep driving?">
          <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Can you keep driving?">
            <KeepDrivingOption
              title="Yes, carefully"
              description="I can finish the trip"
              tone="pending"
              selected={severity === 'Can continue'}
              invalid={showErrors && !!errors.severity}
              onPress={() => setSeverity('Can continue')}
            />
            <KeepDrivingOption
              title="No, I have stopped"
              description="The vehicle needs help now"
              tone="danger"
              selected={severity === 'Stopped'}
              invalid={showErrors && !!errors.severity}
              onPress={() => setSeverity('Stopped')}
            />
          </View>
          <FieldError message={showErrors ? errors.severity : undefined} />
        </FormSection>

        <FormSection title="Describe it">
          <TextField
            label="Describe it"
            hideLabel
            multiline
            value={description}
            onChangeText={setDescription}
            placeholder="What happened, and where? e.g. Rear left tyre looks low."
            maxLength={DESCRIPTION_MAX_LENGTH}
            error={showErrors ? errors.description : undefined}
          />
          {trip.startOdometerKm !== undefined ? (
            <View style={styles.odometer}>
              <Text style={typography.meta}>Odometer at start</Text>
              <Text style={typography.mono}>{formatDistance(trip.startOdometerKm)}</Text>
            </View>
          ) : null}
        </FormSection>

        <PhotoField
          title="Photos (optional)"
          meta={`${photos.length} of ${MAX_ISSUE_PHOTOS} added`}
          photos={photos}
          onChange={setPhotos}
          max={MAX_ISSUE_PHOTOS}
          photoLabel={(photo, position) => `Photo ${position} · ${formatTime(photo.capturedAt)}`}
          addLabel="Add photo"
          prompt={{ title: 'Add a photo of the problem', message: 'A clear photo helps the mechanic prepare.' }}
        />

        <InfoBanner tone="info" size="sm" icon={Bell} title={`${notifiedPeople(trip)} will be notified.`} />

        {state.kind === 'error' ? (
          <InfoBanner
            tone="danger"
            title="Couldn’t send the report"
            message={`${state.message} Nothing you entered was lost.`}
          />
        ) : null}
      </KeyboardAwareScroll>

      <ActionBar
        label={state.kind === 'error' ? 'Try again' : 'Send report'}
        onPress={handleSend}
        loading={state.kind === 'submitting'}
        hint="The report is added to the vehicle’s issue list for the mechanic."
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  body: {
    gap: spacing.xxl + spacing.xxs,
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxxl,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  options: {
    gap: spacing.md,
  },
  odometer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  error: {
    color: colors.danger,
  },
});
