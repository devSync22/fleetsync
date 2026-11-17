import type { IssueType } from './types';

export const ISSUE_TYPES: readonly IssueType[] = [
  'Tyres',
  'Brakes',
  'Engine',
  'Electrical',
  'Cooling unit',
  'Lights',
  'Body damage',
  'Other',
];

export const DESCRIPTION_MAX_LENGTH = 500;
export const MAX_ISSUE_PHOTOS = 3;
