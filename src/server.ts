import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { BookingService } from './BookingService.js';
import { BookingStore } from './BookingStore.js';
import { cancelReservation, getCancellationDeadline, Reservation } from './ReservationService.js';
import { calculatePrice, RoomType, Season } from './PricingService.js';
import { BookingStatus } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

const bookingStore = new BookingStore();
const bookingService = new BookingService(bookingStore);

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.post('/cancel', (req, res) => {
  const { reservationDate } = req.body as { reservationDate?: string };

  if (!reservationDate) {
    return res.json({ allowed: false, reason: 'reservationDate is required' });
  }

  const reservation: Reservation = {
    id: 'ui-res',
    startTime: reservationDate,
  };

  const result = cancelReservation(reservation);

  if (result.ok) {
    res.json({
      allowed: true,
      reason: 'Cancellation allowed',
      deadline: getCancellationDeadline(reservationDate),
    });
  } else {
    res.json({
      allowed: false,
      reason: result.error,
      deadline: getCancellationDeadline(reservationDate),
    });
  }
});

app.post('/price', (req, res) => {
  const { type, season, discount } = req.body as {
    type?: string;
    season?: string;
    discount?: number;
  };

  if (!type || !season || typeof discount !== 'number') {
    return res.status(400).json({ error: 'type, season, and discount are required' });
  }

  const price = calculatePrice(type as RoomType, season as Season, discount);
  res.json({ price });
});

app.post('/api/bookings', (req, res) => {
  const { guest, roomType, checkIn, checkOut, season, discount } = req.body;

  if (!guest?.name || !guest?.email || !roomType || !checkIn || !checkOut || !season) {
    return res.status(400).json({
      error: 'guest (name, email), roomType, checkIn, checkOut, and season are required',
    });
  }

  const result = bookingService.createBooking({
    guest,
    roomType,
    checkIn,
    checkOut,
    season,
    discount,
  });

  if (result.ok) {
    res.status(201).json(result.value);
  } else {
    res.status(400).json({ error: result.error });
  }
});

app.get('/api/bookings', (req, res) => {
  const filters: { status?: BookingStatus; roomType?: RoomType; guestEmail?: string } = {};

  if (req.query.status) filters.status = req.query.status as BookingStatus;
  if (req.query.roomType) filters.roomType = req.query.roomType as RoomType;
  if (req.query.guestEmail) filters.guestEmail = req.query.guestEmail as string;

  res.json(bookingService.listBookings(filters));
});

app.get('/api/bookings/:id', (req, res) => {
  const result = bookingService.getBooking(req.params.id);

  if (result.ok) {
    res.json(result.value);
  } else {
    res.status(404).json({ error: result.error });
  }
});

app.delete('/api/bookings/:id', (req, res) => {
  const result = bookingService.cancelBooking(req.params.id);

  if (result.ok) {
    res.json(result.value);
  } else {
    res.status(400).json({ error: result.error });
  }
});

app.post('/api/availability', (req, res) => {
  const { roomType, checkIn, checkOut } = req.body;

  if (!roomType || !checkIn || !checkOut) {
    return res.status(400).json({ error: 'roomType, checkIn, and checkOut are required' });
  }

  res.json(bookingService.checkAvailability({ roomType, checkIn, checkOut }));
});

app.post('/api/quote', (req, res) => {
  const { roomType, checkIn, checkOut, season, discount } = req.body;

  if (!roomType || !checkIn || !checkOut || !season) {
    return res.status(400).json({
      error: 'roomType, checkIn, checkOut, and season are required',
    });
  }

  res.json(
    bookingService.getQuote({ roomType, checkIn, checkOut, season, discount }),
  );
});

app.get('/api/inventory', (_req, res) => {
  res.json(bookingService.getInventory());
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
