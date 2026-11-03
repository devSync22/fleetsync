import { router } from 'expo-router';
import { useState } from 'react';

import { requestAccount } from '../services/authApi';
import type { AccountRequestForm } from '../types';
import { hasErrors, validateAccountRequest } from '../validation';
import { useDocumentPicker } from './useDocumentPicker';

const INITIAL_VALUES: AccountRequestForm = {
  role: null,
  fullName: '',
  nic: '',
  email: '',
  mobile: '',
  licenceNumber: '',
  licenceClass: null,
  documents: [],
  confirmed: false,
};

/** "Request an account" form state, validation, document picking and submit. */
export function useRequestAccountForm() {
  const [values, setValues] = useState<AccountRequestForm>(INITIAL_VALUES);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** Files refused by the picker (wrong type or too big). */
  const [rejectedFiles, setRejectedFiles] = useState<string[]>([]);

  const errors = submitted ? validateAccountRequest(values) : {};
  const showErrorSummary = submitted && hasErrors(errors);

  function setField<K extends keyof AccountRequestForm>(field: K, value: AccountRequestForm[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setSubmitError(null);
  }

  const { addDocument } = useDocumentPicker(({ accepted, rejected }) => {
    setRejectedFiles(rejected);
    if (accepted.length) {
      setValues((current) => ({ ...current, documents: [...current.documents, ...accepted] }));
    }
  });

  function removeDocument(id: string) {
    setValues((current) => ({ ...current, documents: current.documents.filter((doc) => doc.id !== id) }));
    setRejectedFiles([]);
  }

  async function submit() {
    setSubmitted(true);
    if (submitting || hasErrors(validateAccountRequest(values))) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const request = await requestAccount(values);
      router.replace({
        pathname: '/request-sent',
        params: {
          requestId: request.requestId,
          role: request.role,
          fullName: request.fullName,
          sentAt: request.sentAt,
        },
      });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  }

  return {
    values,
    setField,
    errors,
    showErrorSummary,
    rejectedFiles,
    addDocument,
    removeDocument,
    submitting,
    submitError,
    submit,
  };
}
