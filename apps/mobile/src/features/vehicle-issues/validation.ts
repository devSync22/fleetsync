import { DESCRIPTION_MAX_LENGTH, ISSUE_TYPES } from './constants';
import type { IssueSeverity, IssueType } from './types';

export function validateIssueType(value: IssueType | null): string | undefined {
  return value && ISSUE_TYPES.includes(value) ? undefined : 'Choose what the problem is.';
}

export function validateSeverity(value: IssueSeverity | null): string | undefined {
  return value === 'Can continue' || value === 'Stopped' ? undefined : 'Tell us if you can keep driving.';
}

export function validateDescription(value: string): string | undefined {
  const text = value.trim();
  if (!text) return 'Describe the problem for the mechanic.';
  if (text.length > DESCRIPTION_MAX_LENGTH) return `Keep it under ${DESCRIPTION_MAX_LENGTH} characters.`;
  return undefined;
}
