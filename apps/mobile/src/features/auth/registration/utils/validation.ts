/** Sri Lankan NIC: old format (9 digits + V or X) or new format (12 digits). */
export function isValidNic(nic: string) {
  return /^([0-9]{9}[VvXx]|[0-9]{12})$/.test(nic.trim())
}

/** Sri Lankan mobile: 10 digits starting with 07 (spaces allowed), or +94 7X… */
export function isValidMobile(mobile: string) {
  const digits = mobile.replace(/[\s-]/g, '')
  return /^(07[0-9]{8}|\+947[0-9]{8})$/.test(digits)
}

/** "Tharindu Wijesinghe" → "Tharindu", for "Thanks, <first name>." */
export function getFirstName(fullName: string) {
  return fullName.trim().split(/\s+/)[0] ?? ''
}
