import { MapPin } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cities, fieldAria, fieldId } from '../newOrderOptions'
import type { NewOrderDestination, NewOrderErrors, NewOrderPickup } from '../types'
import { FormCard } from './FormCard'
import { FormField } from './FormField'
import { SelectInput } from './SelectInput'
import { TextField } from './TextField'

const cityOptions = cities.map((city) => ({ id: city, label: city }))

/** Today as YYYY-MM-DD in local time, for the date pickers' `min`. */
function todayIso() {
  const now = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

type RouteStepProps = {
  pickup: NewOrderPickup
  destination: NewOrderDestination
  errors: NewOrderErrors
  onPickupChange: <K extends keyof NewOrderPickup>(key: K, value: NewOrderPickup[K]) => void
  onDestinationChange: <K extends keyof NewOrderDestination>(key: K, value: NewOrderDestination[K]) => void
}

/** Step 1 (152:5434): the Pickup and Destination cards. */
export function RouteStep({ pickup, destination, errors, onPickupChange, onDestinationChange }: RouteStepProps) {
  const today = todayIso()
  const pickupCityId = fieldId('pickup.city')
  const destinationCityId = fieldId('destination.city')
  const deliverId = fieldId('destination.deliverByDate')
  const deliverHelper = 'Optional. Leave empty if any time that day is fine.'
  const deliverError = errors['destination.deliverByDate']

  return (
    <>
      <FormCard icon={MapPin} tone="info" title="Pickup" subtitle="Where the driver collects the cargo">
        <div className="flex flex-col gap-4 px-6 py-5">
          <TextField
            field="pickup.address"
            label="Pickup address"
            value={pickup.address}
            onChange={(v) => onPickupChange('address', v)}
            error={errors['pickup.address']}
            placeholder="No. 82, Aluthmawatha Road, Colombo 15"
            autoComplete="street-address"
          />
          <FormField id={pickupCityId} label="City" error={errors['pickup.city']}>
            <SelectInput
              id={pickupCityId}
              value={pickup.city}
              onChange={(v) => onPickupChange('city', v)}
              options={cityOptions}
              placeholder="Choose a city"
              {...fieldAria(pickupCityId, { error: errors['pickup.city'] })}
            />
          </FormField>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              field="pickup.date"
              label="Pickup date"
              type="date"
              min={today}
              value={pickup.date}
              onChange={(v) => onPickupChange('date', v)}
              error={errors['pickup.date']}
            />
            <TextField
              field="pickup.time"
              label="Pickup time"
              type="time"
              value={pickup.time}
              onChange={(v) => onPickupChange('time', v)}
              error={errors['pickup.time']}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              field="pickup.contactName"
              label="Contact person at pickup"
              value={pickup.contactName}
              onChange={(v) => onPickupChange('contactName', v)}
              error={errors['pickup.contactName']}
              placeholder="Dilini Perera"
              autoComplete="name"
            />
            <TextField
              field="pickup.contactPhone"
              label="Contact phone"
              type="tel"
              inputMode="tel"
              value={pickup.contactPhone}
              onChange={(v) => onPickupChange('contactPhone', v)}
              error={errors['pickup.contactPhone']}
              placeholder="077 214 5590"
              autoComplete="tel"
            />
          </div>
        </div>
      </FormCard>

      <FormCard icon={MapPin} tone="accent" title="Destination" subtitle="Where the cargo is delivered">
        <div className="flex flex-col gap-4 px-6 py-5">
          <TextField
            field="destination.address"
            label="Destination address"
            value={destination.address}
            onChange={(v) => onDestinationChange('address', v)}
            error={errors['destination.address']}
            placeholder="No. 34, Anagarika Dharmapala Mawatha, Matara"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField id={destinationCityId} label="City" error={errors['destination.city']}>
              <SelectInput
                id={destinationCityId}
                value={destination.city}
                onChange={(v) => onDestinationChange('city', v)}
                options={cityOptions}
                placeholder="Choose a city"
                {...fieldAria(destinationCityId, { error: errors['destination.city'] })}
              />
            </FormField>
            <FormField id={deliverId} label="Deliver by" helper={deliverHelper} error={deliverError}>
              <div className="grid grid-cols-[minmax(0,1fr)_112px] gap-2">
                <Input
                  id={deliverId}
                  type="date"
                  min={pickup.date || today}
                  value={destination.deliverByDate}
                  onChange={(event) => onDestinationChange('deliverByDate', event.target.value)}
                  {...fieldAria(deliverId, { error: deliverError, helper: deliverHelper })}
                />
                <Input
                  type="time"
                  aria-label="Deliver by time"
                  value={destination.deliverByTime}
                  onChange={(event) => onDestinationChange('deliverByTime', event.target.value)}
                  aria-invalid={deliverError ? true : undefined}
                />
              </div>
            </FormField>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              field="destination.receiverName"
              label="Receiver name"
              value={destination.receiverName}
              onChange={(v) => onDestinationChange('receiverName', v)}
              error={errors['destination.receiverName']}
              placeholder="Kasun Rajapaksha"
            />
            <TextField
              field="destination.receiverPhone"
              label="Receiver phone"
              type="tel"
              inputMode="tel"
              value={destination.receiverPhone}
              onChange={(v) => onDestinationChange('receiverPhone', v)}
              error={errors['destination.receiverPhone']}
              placeholder="041 222 5718"
            />
          </div>
        </div>
      </FormCard>
    </>
  )
}
