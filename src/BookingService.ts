import dayjs from 'dayjs';
import { randomUUID } from 'crypto';
import { BookingStore, ROOM_INVENTORY } from './BookingStore.js';
import { calculateStayPrice } from './PricingService.js';
import { cancelReservation, Reservation } from './ReservationService.js';
import { Result } from './result.js';
import {
  AvailabilityRequest,
  AvailabilityResult,
  Booking,
  BookingFilters,
  CreateBookingInput,
  QuoteRequest,
  QuoteResult,
} from './types.js';

export class BookingService {
  constructor(private readonly store: BookingStore) {}

  createBooking(input: CreateBookingInput): Result<Booking> {
    const validation = this.validateDates(input.checkIn, input.checkOut);
    if (!validation.ok) return validation;

    const availability = this.checkAvailability({
      roomType: input.roomType,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
    });

    if (!availability.available) {
      return {
        ok: false,
        error: `No ${input.roomType} rooms available for the selected dates`,
      };
    }

    const discount = input.discount ?? 0;
    const quote = this.getQuote({
      roomType: input.roomType,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      season: input.season,
      discount,
    });

    const booking: Booking = {
      id: randomUUID(),
      guest: input.guest,
      roomType: input.roomType,
      checkIn: input.checkIn,
      checkOut: input.checkOut,
      status: 'confirmed',
      totalPrice: quote.totalPrice,
      discount,
      season: input.season,
      nights: quote.nights,
      createdAt: dayjs().toISOString(),
    };

    this.store.save(booking);
    return { ok: true, value: booking };
  }

  getBooking(id: string): Result<Booking> {
    const booking = this.store.get(id);
    if (!booking) {
      return { ok: false, error: `Booking not found: ${id}` };
    }
    return { ok: true, value: booking };
  }

  listBookings(filters: BookingFilters = {}): Booking[] {
    return this.store.getAll().filter((booking) => {
      if (filters.status && booking.status !== filters.status) return false;
      if (filters.roomType && booking.roomType !== filters.roomType) return false;
      if (filters.guestEmail && booking.guest.email !== filters.guestEmail) return false;
      return true;
    });
  }

  cancelBooking(id: string): Result<Booking> {
    const result = this.getBooking(id);
    if (!result.ok) return result;

    const booking = result.value;
    if (booking.status === 'cancelled') {
      return { ok: false, error: 'Booking is already cancelled' };
    }

    const reservation: Reservation = {
      id: booking.id,
      startTime: booking.checkIn,
    };

    const cancelResult = cancelReservation(reservation);
    if (!cancelResult.ok) {
      return { ok: false, error: cancelResult.error };
    }

    const cancelled: Booking = { ...booking, status: 'cancelled' };
    this.store.update(id, cancelled);
    return { ok: true, value: cancelled };
  }

  checkAvailability(request: AvailabilityRequest): AvailabilityResult {
    const totalRooms = ROOM_INVENTORY[request.roomType];
    const bookedRooms = this.store.countOverlapping(
      request.roomType,
      request.checkIn,
      request.checkOut,
    );
    const remainingRooms = Math.max(0, totalRooms - bookedRooms);

    return {
      available: remainingRooms > 0,
      roomType: request.roomType,
      totalRooms,
      bookedRooms,
      remainingRooms,
    };
  }

  getQuote(request: QuoteRequest): QuoteResult {
    const { nightlyBreakdown, subtotal, totalPrice } = calculateStayPrice(
      request.roomType,
      request.season,
      request.checkIn,
      request.checkOut,
      request.discount ?? 0,
    );

    return {
      roomType: request.roomType,
      nights: nightlyBreakdown.length,
      nightlyBreakdown,
      subtotal,
      discount: request.discount ?? 0,
      totalPrice,
    };
  }

  getInventory(): Record<string, { total: number; confirmed: number }> {
    const summary: Record<string, { total: number; confirmed: number }> = {};

    for (const [roomType, total] of Object.entries(ROOM_INVENTORY)) {
      const confirmed = this.store
        .getAll()
        .filter((b) => b.roomType === roomType && b.status === 'confirmed').length;
      summary[roomType] = { total, confirmed };
    }

    return summary;
  }

  private validateDates(checkIn: string, checkOut: string): Result<void> {
    const checkInDate = dayjs(checkIn);
    const checkOutDate = dayjs(checkOut);

    if (!checkInDate.isValid() || !checkOutDate.isValid()) {
      return { ok: false, error: 'Invalid check-in or check-out date' };
    }

    if (!checkOutDate.isAfter(checkInDate)) {
      return { ok: false, error: 'Check-out must be after check-in' };
    }

    if (checkInDate.isBefore(dayjs(), 'day')) {
      return { ok: false, error: 'Check-in cannot be in the past' };
    }

    return { ok: true, value: undefined };
  }
}
