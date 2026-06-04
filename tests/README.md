# Test Cases for Workshop

Participants should write tests using `node:test` for the following scenarios.

## ReservationService

Test `cancelReservation(reservation)`:

- Allow cancellation when reservation start is ≥ 24 hours away
- Deny cancellation when reservation start is < 24 hours away
- Handle UTC timezone edge case (exactly 24 hours)

## PricingService

Test `calculatePrice(type, season, discount)`:

- Returns correct base price for each room type + season combination
- Applies discount correctly (percentage off)
- Handles invalid input gracefully (e.g. unknown type or season)

Write the tests yourself as part of the workshop exercises.
