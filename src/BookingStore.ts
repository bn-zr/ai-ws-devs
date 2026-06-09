import { RoomType } from './PricingService.js';
import { Booking } from './types.js';

export const ROOM_INVENTORY: Record<RoomType, number> = {
  standard: 10,
  premium: 6,
  suite: 3,
};

export class BookingStore {
  private bookings = new Map<string, Booking>();

  save(booking: Booking): void {
    this.bookings.set(booking.id, booking);
  }

  get(id: string): Booking | undefined {
    return this.bookings.get(id);
  }

  getAll(): Booking[] {
    return Array.from(this.bookings.values());
  }

  update(id: string, booking: Booking): void {
    this.bookings.set(id, booking);
  }

  countOverlapping(roomType: RoomType, checkIn: string, checkOut: string, excludeId?: string): number {
    const checkInTime = new Date(checkIn).getTime();
    const checkOutTime = new Date(checkOut).getTime();

    return this.getAll().filter((booking) => {
      if (booking.status !== 'confirmed') return false;
      if (booking.roomType !== roomType) return false;
      if (excludeId && booking.id === excludeId) return false;

      const bookingCheckIn = new Date(booking.checkIn).getTime();
      const bookingCheckOut = new Date(booking.checkOut).getTime();

      return checkInTime < bookingCheckOut && checkOutTime > bookingCheckIn;
    }).length;
  }
}
