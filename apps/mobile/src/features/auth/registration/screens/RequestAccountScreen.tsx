import { useRouter } from 'expo-router'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Screen } from '@/components/ui/Screen'
import { SectionLabel } from '@/components/ui/SectionLabel'
import { SelectField } from '@/components/ui/SelectField'
import { TextField } from '@/components/ui/TextField'
import { Colors, Fonts } from '@/constants/theme'
import { DocumentList } from '@/features/auth/registration/components/DocumentList'
import { RoleCard } from '@/features/auth/registration/components/RoleCard'
import { licenceClassOptions } from '@/features/auth/registration/constants'
import type {
  AccountRequest,
  LicenceClass,
  PickedDocument,
} from '@/features/auth/registration/types'
import {
  getFirstName,
  isValidMobile,
  isValidNic,
} from '@/features/auth/registration/utils/validation'
import { AppBar } from '@/features/auth/shared/components/AppBar'
import type { MobileRole } from '@/features/auth/shared/types'
import { isValidEmail } from '@/features/auth/shared/utils/validation'

/** Text fields of the form, kept together so one setter can update any of them. */
type TextValues = {
  fullName: string
  nic: string
  email: string
  mobile: string
  licenceNumber: string
}

type FieldErrors = Partial<Record<keyof TextValues | 'licenceClass' | 'documents' | 'confirmed', string>>

/** Returns an error message per invalid field (empty object = valid). */
function validate(
  role: MobileRole,
  values: TextValues,
  licenceClass: LicenceClass | undefined,
  documents: PickedDocument[],
  confirmed: boolean,
): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.fullName.trim()) errors.fullName = 'Enter your full name'
  if (!isValidNic(values.nic)) errors.nic = 'Enter 12 digits, or 9 digits followed by V or X'
  if (!isValidEmail(values.email)) errors.email = 'Enter a valid email address'
  if (!isValidMobile(values.mobile)) errors.mobile = 'Enter a mobile number like 077 123 4567'
  // Licence details only apply to drivers.
  if (role === 'driver') {
    if (!values.licenceNumber.trim()) errors.licenceNumber = 'Enter your licence number'
    if (!licenceClass) errors.licenceClass = 'Choose a class'
  }
  if (documents.length === 0) errors.documents = 'Add your NIC copy (and driving licence for drivers)'
  if (!confirmed) errors.confirmed = 'Please confirm your details are correct'
  return errors
}

/**
 * "Mobile — Request account (Driver & Mechanic)" — Figma node 195:6788.
 * New drivers/mechanics send their details and documents; a Fleet
 * Administrator reviews the request before an account is created.
 */
export default function RequestAccountScreen() {
  const router = useRouter()
  const [role, setRole] = useState<MobileRole>('driver')
  const [values, setValues] = useState<TextValues>({
    fullName: '',
    nic: '',
    email: '',
    mobile: '',
    licenceNumber: '',
  })
  const [licenceClass, setLicenceClass] = useState<LicenceClass>()
  const [documents, setDocuments] = useState<PickedDocument[]>([])
  const [confirmed, setConfirmed] = useState(false)
  // Errors appear after the first submit, then update live as the user fixes them.
  const [submitted, setSubmitted] = useState(false)

  const errors = submitted ? validate(role, values, licenceClass, documents, confirmed) : {}

  /** Returns an onChangeText handler for one text field. */
  function setField(field: keyof TextValues) {
    return (text: string) => setValues((current) => ({ ...current, [field]: text }))
  }

  function goBack() {
    // Opened from sign-in normally; fall back to it if there's no history (e.g. a deep link).
    if (router.canGoBack()) router.back()
    else router.replace('/sign-in')
  }

  function handleSubmit() {
    setSubmitted(true)
    if (Object.keys(validate(role, values, licenceClass, documents, confirmed)).length > 0) return

    const request: AccountRequest = {
      role,
      fullName: values.fullName.trim(),
      // NIC letters stored upper-case so the same NIC always matches.
      nic: values.nic.trim().toUpperCase(),
      email: values.email.trim(),
      mobile: values.mobile.trim(),
      ...(role === 'driver'
        ? { licenceNumber: values.licenceNumber.trim(), licenceClass }
        : {}),
      documents,
    }

    // TODO: send `request` to the staff application API as multipart/form-data
    // (documents are files) once the backend exists; show a loading state on the
    // button and an error message on failure. Only continue below on success,
    // and pass the server's request ID (e.g. "APP-2026-0118") as `requestId`.
    // `replace` so the back gesture on the next screen doesn't reopen this form.
    router.replace({
      pathname: '/request-sent',
      params: {
        firstName: getFirstName(request.fullName),
        role: request.role,
        sentAt: new Date().toISOString(),
      },
    })
  }

  return (
    <Screen
      header={
        <AppBar
          title="Request an account"
          subtitle="Reviewed by a Fleet Administrator"
          onBack={goBack}
        />
      }
      contentStyle={styles.content}
    >
      <SectionLabel>I am a</SectionLabel>
      <View style={styles.roles} accessibilityRole="radiogroup">
        <RoleCard
          title="Driver"
          description="Drive trips"
          icon={require('@/assets/icons/truck.svg')}
          selected={role === 'driver'}
          onPress={() => setRole('driver')}
        />
        <RoleCard
          title="Mechanic"
          description="Maintain vehicles"
          icon={require('@/assets/icons/wrench.svg')}
          selected={role === 'mechanic'}
          onPress={() => setRole('mechanic')}
        />
      </View>

      <SectionLabel>Your details</SectionLabel>
      <TextField
        label="Full name"
        value={values.fullName}
        onChangeText={setField('fullName')}
        placeholder="First and last name"
        autoComplete="name"
        textContentType="name"
        invalid={Boolean(errors.fullName)}
        helperText={errors.fullName}
      />
      <TextField
        label="NIC number"
        value={values.nic}
        onChangeText={setField('nic')}
        placeholder="200012345678"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={12}
        invalid={Boolean(errors.nic)}
        helperText={errors.nic}
      />
      <TextField
        label="Email"
        value={values.email}
        onChangeText={setField('email')}
        placeholder="name@example.com"
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        textContentType="emailAddress"
        invalid={Boolean(errors.email)}
        helperText={errors.email}
      />
      <TextField
        label="Mobile"
        value={values.mobile}
        onChangeText={setField('mobile')}
        placeholder="07X XXX XXXX"
        keyboardType="phone-pad"
        autoComplete="tel"
        textContentType="telephoneNumber"
        invalid={Boolean(errors.mobile)}
        helperText={errors.mobile}
      />

      {/* Licence details are only needed when applying as a driver. */}
      {role === 'driver' && (
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <TextField
              label="Driving licence no."
              value={values.licenceNumber}
              onChangeText={setField('licenceNumber')}
              placeholder="B1234567"
              autoCapitalize="characters"
              autoCorrect={false}
              invalid={Boolean(errors.licenceNumber)}
              helperText={errors.licenceNumber}
            />
          </View>
          <View style={styles.rowItem}>
            <SelectField
              label="Licence class"
              options={licenceClassOptions}
              value={licenceClass}
              onChange={setLicenceClass}
              placeholder="Select"
              invalid={Boolean(errors.licenceClass)}
              helperText={errors.licenceClass}
            />
          </View>
        </View>
      )}

      <SectionLabel>Documents</SectionLabel>
      <DocumentList documents={documents} onChange={setDocuments} error={errors.documents} />
      <Text style={styles.hint}>
        {role === 'driver' ? 'NIC copy and driving licence' : 'NIC copy'} · PDF or JPG · up to 5
        MB each
      </Text>

      <View style={styles.confirm}>
        <Checkbox
          label="The details I’ve given are correct"
          checked={confirmed}
          onChange={setConfirmed}
          size="md"
          invalid={Boolean(errors.confirmed)}
        />
        {errors.confirmed && <Text style={styles.error}>{errors.confirmed}</Text>}
      </View>

      <Button label="Send request" onPress={handleSubmit} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Pressable accessibilityRole="link" onPress={goBack} hitSlop={8}>
          <Text style={styles.link}>Sign in</Text>
        </Pressable>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  content: {
    gap: 16,
    paddingTop: 20,
  },
  roles: {
    flexDirection: 'row',
    gap: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  hint: {
    fontFamily: Fonts.regular,
    fontSize: 11,
    color: Colors.textMuted,
  },
  confirm: {
    gap: 6,
  },
  error: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.danger,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  link: {
    fontFamily: Fonts.semibold,
    fontSize: 13,
    color: Colors.accent,
  },
})
