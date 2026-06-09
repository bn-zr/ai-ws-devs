import dayjs from 'dayjs';
import { NightlyPrice } from './types.js';

export type RoomType = 'standard' | 'premium' | 'suite';
export type Season = 'low' | 'high';

const BASE_PRICES: Record<RoomType, Record<Season, number>> = {
  standard: { low: 100, high: 150 },
  premium: { low: 200, high: 280 },
  suite: { low: 350, high: 500 },
};

export function calculatePrice(type: RoomType, season: Season, discount: number): number {
  const basePrice = BASE_PRICES[type][season];
  const discounted = basePrice * (1 - discount);
  return Math.round(discounted);
}

export function calculateStayPrice(
  type: RoomType,
  season: Season,
  checkIn: string,
  checkOut: string,
  discount: number,
): { nightlyBreakdown: NightlyPrice[]; subtotal: number; totalPrice: number } {
  const nightlyBreakdown: NightlyPrice[] = [];
  let current = dayjs(checkIn).startOf('day');
  const end = dayjs(checkOut).startOf('day');

  while (current.isBefore(end)) {
    const nightlyPrice = calculatePrice(type, season, 0);
    nightlyBreakdown.push({
      date: current.format('YYYY-MM-DD'),
      price: nightlyPrice,
    });
    current = current.add(1, 'day');
  }

  const subtotal = nightlyBreakdown.reduce((sum, night) => sum + night.price, 0);
  const totalPrice = Math.round(subtotal * (1 - discount));

  return { nightlyBreakdown, subtotal, totalPrice };
}
