import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { cancelReservation, Reservation } from './ReservationService.js';
import { calculatePrice, RoomType, Season } from './PricingService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

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
    res.json({ allowed: true, reason: 'Cancellation allowed' });
  } else {
    res.json({ allowed: false, reason: result.error });
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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
