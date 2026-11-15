import { useCallback } from 'react'
import { useAsyncData } from '@/hooks/useAsyncData'
import { getDaySchedule } from '../services/availabilityApi'

export function useDaySchedule(date: string) {
  const load = useCallback(() => getDaySchedule(date), [date])
  return useAsyncData(load)
}
