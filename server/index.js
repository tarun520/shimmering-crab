require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { users, cars, bookings, ensureUser, saveData, initDB } = require('./data');

const app = express();
const PORT = 3005;
const JWT_SECRET = 'zion-fleet-secret-key-2026';

app.use(cors());
app.use(express.json());

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return res.status(401).json({ error: 'No token provided' });
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        req.username = decoded.username;
        ensureUser(req.userId);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}

// ─── Auth ────────────────────────────────────────────────────
app.post('/api/auth/register', async (req, res) => {
    const { username, password, displayName } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
    if (username.length < 3) return res.status(400).json({ error: 'Username must be at least 3 characters' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) return res.status(400).json({ error: 'Username already taken' });
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = { id: uuidv4(), username: username.toLowerCase(), displayName: displayName || username, passwordHash, createdAt: new Date().toISOString() };
    users.push(newUser);
    ensureUser(newUser.id);
    saveData();
    const token = jwt.sign({ userId: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: newUser.id, username: newUser.username, displayName: newUser.displayName } });
});

app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username and password are required' });
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, displayName: user.displayName } });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
    const user = users.find(u => u.id === req.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, username: user.username, displayName: user.displayName });
});

// ─── Dashboard ───────────────────────────────────────────────
app.get('/api/dashboard', authMiddleware, (req, res) => {
    const userCars = cars[req.userId] || [];
    const userBookings = bookings[req.userId] || [];
    const total = userCars.length;
    const available = userCars.filter(c => c.status === 'available').length;
    const booked = userCars.filter(c => c.status === 'booked').length;
    const maintenance = userCars.filter(c => c.status === 'maintenance').length;
    const activeBookings = userBookings.filter(b => b.status === 'active').length;
    const totalRevenue = userBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const categories = {};
    userCars.forEach(c => { categories[c.category] = (categories[c.category] || 0) + 1; });
    const statusBreakdown = { available, booked, maintenance };
    const recentBookings = [...userBookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map(b => {
        const car = userCars.find(c => c.id === b.carId);
        return { ...b, carName: car ? `${car.make} ${car.model}` : 'Unknown', carPlate: car ? car.plate : 'N/A' };
    });
    res.json({ total, available, booked, maintenance, activeBookings, totalRevenue, categories, statusBreakdown, recentBookings });
});

// ─── Cars ────────────────────────────────────────────────────
app.get('/api/cars', authMiddleware, (req, res) => res.json(cars[req.userId] || []));
app.get('/api/cars/:id', authMiddleware, (req, res) => {
    const car = (cars[req.userId] || []).find(c => c.id === req.params.id);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    res.json(car);
});
app.post('/api/cars', authMiddleware, (req, res) => {
    const { make, model, year, plate, status, dailyRate, category, fuel, seats } = req.body;
    if (!make || !model || !plate) return res.status(400).json({ error: 'make, model, and plate are required' });
    const newCar = { id: uuidv4(), make, model, year: year || 2024, plate, status: status || 'available', dailyRate: dailyRate || 2000, category: category || 'Sedan', fuel: fuel || 'Petrol', seats: seats || 5, image: '' };
    cars[req.userId].push(newCar);
    saveData();
    res.status(201).json(newCar);
});
app.put('/api/cars/:id', authMiddleware, (req, res) => {
    const userCars = cars[req.userId];
    const idx = userCars.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Car not found' });
    userCars[idx] = { ...userCars[idx], ...req.body, id: userCars[idx].id };
    saveData();
    res.json(userCars[idx]);
});
app.delete('/api/cars/:id', authMiddleware, (req, res) => {
    const userCars = cars[req.userId];
    const idx = userCars.findIndex(c => c.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Car not found' });
    const deleted = userCars.splice(idx, 1);
    saveData();
    res.json(deleted[0]);
});

// ─── Bookings ────────────────────────────────────────────────
app.get('/api/bookings', authMiddleware, (req, res) => {
    const userCars = cars[req.userId] || [];
    const enriched = (bookings[req.userId] || []).map(b => {
        const car = userCars.find(c => c.id === b.carId);
        return { ...b, carName: car ? `${car.make} ${car.model}` : 'Unknown', carPlate: car ? car.plate : 'N/A' };
    });
    res.json(enriched);
});
app.post('/api/bookings', authMiddleware, (req, res) => {
    const { carId, customerName, customerPhone, startDate, endDate, discount } = req.body;
    if (!carId || !customerName || !startDate || !endDate) return res.status(400).json({ error: 'carId, customerName, startDate, endDate are required' });
    const userCars = cars[req.userId];
    const car = userCars.find(c => c.id === carId);
    if (!car) return res.status(404).json({ error: 'Car not found' });
    if (car.status !== 'available') return res.status(400).json({ error: 'Car is not available for booking' });
    const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
    const subtotal = days * car.dailyRate;
    const discountPct = Math.min(100, Math.max(0, Number(discount) || 0));
    const discountAmount = Math.round(subtotal * discountPct / 100);
    const totalAmount = subtotal - discountAmount;
    const newBooking = { id: uuidv4(), carId, customerName, customerPhone: customerPhone || '', startDate, endDate, totalAmount, discount: discountPct, discountAmount, status: 'active', createdAt: new Date().toISOString() };
    bookings[req.userId].push(newBooking);
    car.status = 'booked';
    saveData();
    res.status(201).json({ ...newBooking, carName: `${car.make} ${car.model}`, carPlate: car.plate });
});
app.put('/api/bookings/:id/complete', authMiddleware, (req, res) => {
    const userBookings = bookings[req.userId];
    const userCars = cars[req.userId];
    const booking = userBookings.find(b => b.id === req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    booking.status = 'completed';
    const car = userCars.find(c => c.id === booking.carId);
    if (car) car.status = 'available';
    saveData();
    res.json({ ...booking, carName: car ? `${car.make} ${car.model}` : 'Unknown', carPlate: car ? car.plate : 'N/A' });
});


initDB().then(() => {
    app.listen(PORT, () => console.log(`🚗 Zion Fleet API running at http://localhost:${PORT}`));
}).catch(err => {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
});
