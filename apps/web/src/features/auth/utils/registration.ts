/** "Sachini Fernando" → "Sachini", for the "Thanks, <first name>." line. */
export function getFirstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? ''
}
