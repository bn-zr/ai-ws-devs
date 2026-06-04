export type RoomType = 'standard' | 'premium' | 'suite';
export type Season = 'low' | 'high';

export function calculatePrice(type: RoomType, season: Season, discount: number): number {
  let basePrice: number;

  if (type === 'standard' && season === 'low') {
    basePrice = 100;
  } else if (type === 'standard' && season === 'high') {
    basePrice = 150;
  } else if (type === 'premium' && season === 'low') {
    basePrice = 200;
  } else if (type === 'premium' && season === 'high') {
    basePrice = 280;
  } else if (type === 'suite' && season === 'low') {
    basePrice = 350;
  } else if (type === 'suite' && season === 'high') {
    basePrice = 500;
  } else {
    basePrice = 100;
  }

  const discounted = basePrice * (1 - discount);
  return Math.round(discounted);
}
