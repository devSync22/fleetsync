/**
 * Public entry for the vehicle-issues feature. Other features (driver-home, later the mechanic module)
 * import from `@/features/vehicle-issues` only.
 */
export { getIssuesForDriver, reportIssue } from './services/issuesService';
export type { IssueReport, IssueSeverity, IssueStatus, IssueType, VehicleIssue } from './types';
