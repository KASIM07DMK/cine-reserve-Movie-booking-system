import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import app from '../src/app.js';
import { User } from '../src/models/User.js';
import { City } from '../src/models/City.js';
import { Movie } from '../src/models/Movie.js';
import { Show } from '../src/models/Show.js';
import { ShowSeat } from '../src/models/ShowSeat.js';
import { Booking } from '../src/models/Booking.js';
import { config } from '../src/config/env.js';

let serverInstance;
let baseUrl;
let authToken;
let testUserEmail;
let testShowId;
let availableSeats = [];
let activeHoldId;
let createdBookingId;
let providerOrderId;
let generatedSignature;

describe('🎬 CineReserve Full Suite Backend Tests', () => {
  before(async () => {
    await mongoose.connect(config.mongoUri);
    const testPort = 5005;
    await new Promise((resolve) => {
      serverInstance = app.listen(testPort, () => {
        baseUrl = `http://127.0.0.1:${testPort}/api/v1`;
        resolve();
      });
    });
  });

  after(async () => {
    // Cleanup any test user
    if (testUserEmail) {
      await User.deleteOne({ email: testUserEmail });
    }
    if (createdBookingId) {
      await Booking.deleteOne({ _id: createdBookingId });
    }
    await mongoose.disconnect();
    if (serverInstance) {
      serverInstance.close();
    }
  });

  // Health check
  test('Health Check: GET /health returns 200 and UP status', async () => {
    const res = await fetch(`${baseUrl}/health`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.status, 'UP');
  });

  // Authentication
  test('Auth: Register new user', async () => {
    testUserEmail = `test_${Date.now()}@cinereserve.com`;
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test User',
        email: testUserEmail,
        password: 'Password@123',
        phone: '9876543210'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(json.success, true);
    assert.ok(json.data.token);
    assert.strictEqual(json.data.user.email, testUserEmail);
  });

  test('Auth: Duplicate email registration rejection', async () => {
    const res = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Another User',
        email: testUserEmail,
        password: 'Password@123'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 409);
    assert.strictEqual(json.success, false);
  });

  test('Auth: Login with valid credentials', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'Password@123'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.data.token);
    authToken = json.data.token;
  });

  test('Auth: Login with incorrect password rejection', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testUserEmail,
        password: 'WrongPassword999'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 401);
    assert.strictEqual(json.success, false);
  });

  test('Auth: GET /auth/me returns authenticated profile', async () => {
    const res = await fetch(`${baseUrl}/auth/me`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.data.email, testUserEmail);
  });

  // Movie & City Discovery
  test('Discovery: GET /cities returns seeded cities', async () => {
    const res = await fetch(`${baseUrl}/cities`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length >= 5);
  });

  test('Discovery: GET /movies returns movies with pagination', async () => {
    const res = await fetch(`${baseUrl}/movies`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(json.data));
    assert.ok(json.data.length > 0);
    assert.ok(json.pagination);
  });

  test('Shows: Find bookable show and retrieve interactive seats', async () => {
    const show = await Show.findOne({ status: 'scheduled', startTime: { $gte: new Date() } });
    assert.ok(show, 'A scheduled show must exist');
    testShowId = show._id.toString();

    const res = await fetch(`${baseUrl}/shows/${testShowId}/seats`);
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(json.data.seats));
    assert.ok(json.data.seats.length > 0);

    availableSeats = json.data.seats.filter((s) => s.status === 'available');
    assert.ok(availableSeats.length >= 2, 'Show should have at least 2 available seats');
  });

  // Seat Holds & Concurrency Protection
  test('Seat Engine: Atomically hold 2 available seats', async () => {
    const seatsToHold = [availableSeats[0].seatCode, availableSeats[1].seatCode];

    const res = await fetch(`${baseUrl}/shows/${testShowId}/holds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ seatCodes: seatsToHold })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.data.holdId);
    assert.strictEqual(json.data.seats.length, 2);
    activeHoldId = json.data.holdId;
  });

  test('Seat Concurrency: Prevent another user from holding already-held seats', async () => {
    const seatsToHold = [availableSeats[0].seatCode];

    const res = await fetch(`${baseUrl}/shows/${testShowId}/holds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ seatCodes: seatsToHold })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 409);
    assert.strictEqual(json.success, false);
  });

  // Booking Preview & Creation
  test('Booking: Preview calculation with coupon code', async () => {
    const res = await fetch(`${baseUrl}/bookings/preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        showId: testShowId,
        holdId: activeHoldId,
        couponCode: 'CINERESERVE50'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.data.pricing.finalAmount > 0);
    assert.ok(json.data.pricing.discount > 0);
  });

  test('Booking: Create pending booking with active hold', async () => {
    const res = await fetch(`${baseUrl}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        showId: testShowId,
        holdId: activeHoldId,
        seatCodes: [availableSeats[0].seatCode, availableSeats[1].seatCode],
        couponCode: 'CINERESERVE50'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 201);
    assert.strictEqual(json.success, true);
    assert.ok(json.data.bookingReference);
    assert.strictEqual(json.data.bookingStatus, 'pending');
    createdBookingId = json.data._id;
  });

  // Payment System
  test('Payment: Create order for booking', async () => {
    const res = await fetch(`${baseUrl}/payments/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({ bookingId: createdBookingId })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.ok(json.data.providerOrderId);
    providerOrderId = json.data.providerOrderId;
    generatedSignature = json.data.signature;
  });

  test('Payment: Verify test payment and confirm booking', async () => {
    const testPaymentId = `pay_test_${Date.now()}`;
    const res = await fetch(`${baseUrl}/payments/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`
      },
      body: JSON.stringify({
        bookingId: createdBookingId,
        providerOrderId,
        providerPaymentId: testPaymentId,
        signature: generatedSignature,
        paymentMethod: 'Test Card Payment'
      })
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.booking.bookingStatus, 'confirmed');
    assert.strictEqual(json.data.booking.paymentStatus, 'paid');
    assert.ok(json.data.booking.qrValidationToken);
    assert.ok(json.data.booking.qrCodeDataUrl);
  });

  test('Tickets: User can view digital ticket with QR code', async () => {
    const res = await fetch(`${baseUrl}/tickets/${createdBookingId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(json.data.bookingStatus, 'confirmed');
    assert.ok(json.data.qrCodeDataUrl.startsWith('data:image/png;base64,'));
  });

  test('Bookings: User can view in /bookings/my', async () => {
    const res = await fetch(`${baseUrl}/bookings/my`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    const json = await res.json();
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(json.data));
    const found = json.data.find((b) => b._id === createdBookingId);
    assert.ok(found, 'Created booking must appear in user history');
  });
});
