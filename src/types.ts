import { RoomType, Season } from './PricingService.js';

export type BookingStatus = 'confirmed' | 'cancelled' | 'completed';

export interface Guest {
  name: string;
  email: string;
}

export interface Booking {
  id: string;
  guest: Guest;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  status: BookingStatus;
  totalPrice: number;
  discount: number;
  season: Season;
  nights: number;
  createdAt: string;
}

export interface CreateBookingInput {
  guest: Guest;
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  season: Season;
  discount?: number;
}

export interface AvailabilityRequest {
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
}

export interface AvailabilityResult {
  available: boolean;
  roomType: RoomType;
  totalRooms: number;
  bookedRooms: number;
  remainingRooms: number;
}

export interface QuoteRequest {
  roomType: RoomType;
  checkIn: string;
  checkOut: string;
  season: Season;
  discount?: number;
}

export interface NightlyPrice {
  date: string;
  price: number;
}

export interface QuoteResult {
  roomType: RoomType;
  nights: number;
  nightlyBreakdown: NightlyPrice[];
  subtotal: number;
  discount: number;
  totalPrice: number;
}

export interface BookingFilters {
  status?: BookingStatus;
  roomType?: RoomType;
  guestEmail?: string;
}
