import dayjs from 'dayjs';
import { Result } from './result.js';

export interface Reservation {
  id: string;
  startTime: string; // ISO string
}

export function cancelReservation(reservation: Reservation): Result<Reservation> {
  // TODO: implement 24h cancellation rule using dayjs
  // Currently always allows cancellation (for workshop demo)
  return { ok: true, value: reservation };
}
