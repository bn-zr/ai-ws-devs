import dayjs from 'dayjs';
import { Result } from './result.js';

export interface Reservation {
  id: string;
  startTime: string; // ISO string
}

const CANCELLATION_WINDOW_HOURS = 24;

export function cancelReservation(reservation: Reservation): Result<Reservation> {
  const startTime = dayjs(reservation.startTime);

  if (!startTime.isValid()) {
    return { ok: false, error: 'Invalid reservation start time' };
  }

  const hoursUntilStart = startTime.diff(dayjs(), 'hour', true);

  if (hoursUntilStart <= CANCELLATION_WINDOW_HOURS) {
    return {
      ok: false,
      error: `Cancellation must be at least ${CANCELLATION_WINDOW_HOURS} hours before check-in`,
    };
  }

  return { ok: true, value: reservation };
}
