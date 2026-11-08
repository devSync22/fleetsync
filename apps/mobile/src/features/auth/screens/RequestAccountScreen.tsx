import { router } from 'expo-router';
import { CircleX, Truck, Wrench } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Checkbox, InfoBanner, KeyboardAwareScroll, ScreenHeader, Select, TextField } from '@/components/ui';
import { colors, sizes, spacing, typography } from '@/theme';

import { AddDocumentButton } from '../components/AddDocumentButton';
import { DocumentRow } from '../components/DocumentRow';
import { RoleOption } from '../components/RoleOption';
import { LICENCE_CLASS_OPTIONS } from '../constants';
import { useRequestAccountForm } from '../hooks/useRequestAccountForm';

function FieldMessage({ message }: { message: string }) {
  return (
    <View style={styles.message}>
      <CircleX size={sizes.iconXs} color={colors.danger} />
      <Text style={[typography.caption, styles.messageText]}>{message}</Text>
    </View>
  );
}

/** Figma "Mobile — Request account (Driver & Mechanic)". Only Driver or Mechanic can be requested. */
export function RequestAccountScreen() {
  const insets = useSafeAreaInsets();
  const form = useRequestAccountForm();
  const { values, errors, setField } = form;
  const isDriver = values.role === 'driver';

  function backToSignIn() {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/sign-in');
    }
  }

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Request an account"
        subtitle="Reviewed by a Fleet Administrator"
        showBack
        onBack={backToSignIn}
      />
      <KeyboardAwareScroll contentContainerStyle={[styles.body, { paddingBottom: spacing.huge + insets.bottom }]}>
        <Text style={typography.sectionLabel}>I am a</Text>
        <View style={styles.group}>
          <View style={styles.roles} accessibilityRole="radiogroup">
            <RoleOption
              title="Driver"
              description="Drive trips"
              icon={Truck}
              selected={values.role === 'driver'}
              invalid={Boolean(errors.role)}
              onPress={() => setField('role', 'driver')}
            />
            <RoleOption
              title="Mechanic"
              description="Maintain vehicles"
              icon={Wrench}
              selected={values.role === 'mechanic'}
              invalid={Boolean(errors.role)}
              onPress={() => setField('role', 'mechanic')}
            />
          </View>
          {errors.role ? <FieldMessage message={errors.role} /> : null}
        </View>

        <Text style={typography.sectionLabel}>Your details</Text>
        <TextField
          label="Full name"
          value={values.fullName}
          onChangeText={(text) => setField('fullName', text)}
          error={errors.fullName}
          placeholder="As on your NIC"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
        />
        <TextField
          label="NIC number"
          value={values.nic}
          onChangeText={(text) => setField('nic', text)}
          error={errors.nic}
          placeholder="e.g. 199512345678"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={12}
        />
        <TextField
          label="Email"
          value={values.email}
          onChangeText={(text) => setField('email', text)}
          error={errors.email}
          placeholder="name@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />
        <TextField
          label="Mobile"
          value={values.mobile}
          onChangeText={(text) => setField('mobile', text)}
          error={errors.mobile}
          placeholder="e.g. 077 456 1290"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
        />
        {isDriver ? (
          <View style={styles.licenceRow}>
            <View style={styles.licenceField}>
              <TextField
                label="Driving licence no."
                value={values.licenceNumber}
                onChangeText={(text) => setField('licenceNumber', text)}
                error={errors.licenceNumber}
                placeholder="e.g. B3344556"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>
            <View style={styles.licenceField}>
              <Select
                label="Licence class"
                value={values.licenceClass}
                options={LICENCE_CLASS_OPTIONS}
                onChange={(value) => setField('licenceClass', value)}
                error={errors.licenceClass}
              />
            </View>
          </View>
        ) : null}

        <Text style={typography.sectionLabel}>Documents</Text>
        <View style={styles.documents}>
          {values.documents.map((document) => (
            <DocumentRow key={document.id} document={document} onRemove={() => form.removeDocument(document.id)} />
          ))}
          <AddDocumentButton onPress={form.addDocument} invalid={Boolean(errors.documents)} />
          {form.rejectedFiles.map((reason) => (
            <FieldMessage key={reason} message={reason} />
          ))}
          {errors.documents ? <FieldMessage message={errors.documents} /> : null}
        </View>
        <Text style={typography.micro}>
          {isDriver ? 'NIC copy and driving licence' : 'NIC copy'} · PDF or JPG · up to 5 MB each
        </Text>

        <Checkbox
          label="The details I’ve given are correct"
          checked={values.confirmed}
          onChange={(checked) => setField('confirmed', checked)}
          error={errors.confirmed}
        />

        {form.showErrorSummary ? (
          <InfoBanner tone="danger" title="Check the highlighted fields" message="Fix them, then send your request again." />
        ) : null}
        {form.submitError ? (
          <InfoBanner tone="danger" title="Couldn’t send your request" message={form.submitError} />
        ) : null}

        <Button label="Send request" onPress={form.submit} loading={form.submitting} />

        <View style={styles.footer}>
          <Text style={[typography.bodySmall, styles.muted]}>Already have an account?</Text>
          <Pressable accessibilityRole="link" onPress={backToSignIn} hitSlop={spacing.lg}>
            <Text style={typography.link}>Sign in</Text>
          </Pressable>
        </View>
      </KeyboardAwareScroll>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  body: {
    paddingHorizontal: spacing.huge,
    paddingTop: spacing.xxxl,
    gap: spacing.xxl,
  },
  group: {
    gap: spacing.sm,
  },
  roles: {
    flexDirection: 'row',
    gap: spacing.ml,
  },
  licenceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.lg,
  },
  licenceField: {
    flex: 1,
  },
  documents: {
    gap: spacing.md,
  },
  message: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  messageText: {
    flexShrink: 1,
  },
  muted: {
    color: colors.muted,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
