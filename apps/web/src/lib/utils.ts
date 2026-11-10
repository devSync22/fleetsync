import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const lkrFormatter = new Intl.NumberFormat('en-LK', { maximumFractionDigits: 0 })

/** 24600 → "LKR 24,600" */
export function formatLKR(amount: number) {
  return `LKR ${lkrFormatter.format(amount)}`
}
