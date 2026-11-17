import type { AccountRequestForm, SignInCredentials } from './types';

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Old NIC: 9 digits + V/X. New NIC: 12 digits. */
const NIC_PATTERN = /^(\d{9}[VX]|\d{12})$/i;
/** Sri Lankan mobile: 07X XXX XXXX, or +94 / 94 instead of the leading 0. */
const MOBILE_PATTERN = /^(?:0|\+94|94)7\d{8}$/;
/** Letters, spaces, dots, apostrophes and hyphens. */
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]*$/;
/** e.g. "B3344556". */
const LICENCE_PATTERN = /^[A-Z]{1,2}\d{6,8}$/i;

export function validateEmail(value: string): string | undefined {
  const email = value.trim();
  if (!email) return 'Enter your email address';
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address, e.g. name@example.com';
  return undefined;
}

export function validateSignIn(values: SignInCredentials): FieldErrors<SignInCredentials> {
  return {
    email: validateEmail(values.email),
    password: values.password ? undefined : 'Enter your password',
  };
}

export function validateAccountRequest(values: AccountRequestForm): FieldErrors<AccountRequestForm> {
  const isDriver = values.role === 'driver';
  const name = values.fullName.trim();
  const mobile = values.mobile.replace(/[\s-]/g, '');
  const nic = values.nic.trim();
  const licence = values.licenceNumber.trim();

  const errors: FieldErrors<AccountRequestForm> = {
    role: values.role ? undefined : 'Choose Driver or Mechanic',
    fullName: !name
      ? 'Enter your full name'
      : name.length < 3
        ? 'Enter your full name as on your NIC'
        : !NAME_PATTERN.test(name)
          ? 'Use letters only'
          : undefined,
    nic: !nic
      ? 'Enter your NIC number'
      : !NIC_PATTERN.test(nic)
        ? 'Enter 12 digits, or 9 digits followed by V or X'
        : undefined,
    email: validateEmail(values.email),
    mobile: !mobile
      ? 'Enter your mobile number'
      : !MOBILE_PATTERN.test(mobile)
        ? 'Enter a Sri Lankan mobile number, e.g. 077 456 1290'
        : undefined,
    confirmed: values.confirmed ? undefined : 'Confirm that your details are correct',
  };

  if (isDriver) {
    errors.licenceNumber = !licence
      ? 'Enter your licence number'
      : !LICENCE_PATTERN.test(licence)
        ? 'Enter a valid licence number, e.g. B3344556'
        : undefined;
    errors.licenceClass = values.licenceClass ? undefined : 'Choose a class';
  }

  if (isDriver && values.documents.length < 2) {
    errors.documents = 'Add your NIC copy and driving licence';
  } else if (values.documents.length < 1) {
    errors.documents = 'Add a copy of your NIC';
  }

  return errors;
}

export function hasErrors<T>(errors: FieldErrors<T>): boolean {
  return Object.values(errors).some(Boolean);
}
