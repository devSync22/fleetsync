import { ResetPasswordScreen } from '@/features/auth/screens/ResetPasswordScreen';

/** Opened by the reset email: fleetsync://reset-password?token=…&email=… */
export default function ResetPasswordRoute() {
  return <ResetPasswordScreen />;
}
