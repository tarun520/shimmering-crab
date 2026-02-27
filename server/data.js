const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI environment variable is not set!');
    process.exit(1);
}

const client = new MongoClient(MONGODB_URI);
let db;
let usersCol, carsCol, bookingsCol;

// Shared mutable objects — index.js holds references to these exact objects.
// We MUST mutate them in-place (never reassign) so index.js references stay valid.
const users = [];
const cars = {};
const bookings = {};

// ─── Seed Data ────────────────────────────────────────────────
function createSeedData() {
    const demoUserId = 'demo-user-001';
    const demoPasswordHash = bcrypt.hashSync('demo1234', 10);
    const seedUsers = [{
        id: demoUserId, username: 'demo', displayName: 'Demo Manager',
        passwordHash: demoPasswordHash, createdAt: '2026-01-01T00:00:00Z',
    }];
    const carIds = Array.from({ length: 10 }, () => uuidv4());
    const seedCars = {
        [demoUserId]: [
            { id: carIds[0], make: 'Toyota', model: 'Innova Crysta', year: 2024, plate: 'KA-01-AB-1001', status: 'available', dailyRate: 3500, category: 'SUV', fuel: 'Diesel', seats: 7, image: '' },
            { id: carIds[1], make: 'Hyundai', model: 'Creta', year: 2024, plate: 'KA-01-CD-2002', status: 'booked', dailyRate: 2800, category: 'SUV', fuel: 'Petrol', seats: 5, image: '' },
            { id: carIds[2], make: 'Maruti', model: 'Swift Dzire', year: 2023, plate: 'KA-01-EF-3003', status: 'available', dailyRate: 1800, category: 'Sedan', fuel: 'Petrol', seats: 5, image: '' },
            { id: carIds[3], make: 'Mahindra', model: 'XUV700', year: 2024, plate: 'KA-01-GH-4004', status: 'maintenance', dailyRate: 4000, category: 'SUV', fuel: 'Diesel', seats: 7, image: '' },
            { id: carIds[4], make: 'Honda', model: 'City', year: 2023, plate: 'KA-01-IJ-5005', status: 'available', dailyRate: 2200, category: 'Sedan', fuel: 'Petrol', seats: 5, image: '' },
            { id: carIds[5], make: 'Kia', model: 'Seltos', year: 2024, plate: 'KA-01-KL-6006', status: 'booked', dailyRate: 2600, category: 'SUV', fuel: 'Petrol', seats: 5, image: '' },
            { id: carIds[6], make: 'Tata', model: 'Nexon EV', year: 2024, plate: 'KA-01-MN-7007', status: 'available', dailyRate: 3000, category: 'SUV', fuel: 'Electric', seats: 5, image: '' },
            { id: carIds[7], make: 'Toyota', model: 'Fortuner', year: 2023, plate: 'KA-01-OP-8008', status: 'booked', dailyRate: 5500, category: 'SUV', fuel: 'Diesel', seats: 7, image: '' },
            { id: carIds[8], make: 'Maruti', model: 'Ertiga', year: 2023, plate: 'KA-01-QR-9009', status: 'available', dailyRate: 2400, category: 'MPV', fuel: 'Petrol', seats: 7, image: '' },
            { id: carIds[9], make: 'Hyundai', model: 'Verna', year: 2024, plate: 'KA-01-ST-1010', status: 'available', dailyRate: 2500, category: 'Sedan', fuel: 'Petrol', seats: 5, image: '' },
        ]
    };
    const seedBookings = {
        [demoUserId]: [
            { id: uuidv4(), carId: carIds[1], customerName: 'Rajesh Kumar', customerPhone: '+91 98765 43210', startDate: '2026-02-20', endDate: '2026-02-27', totalAmount: 19600, discount: 0, discountAmount: 0, status: 'active', createdAt: '2026-02-20T09:00:00Z' },
            { id: uuidv4(), carId: carIds[5], customerName: 'Priya Sharma', customerPhone: '+91 87654 32109', startDate: '2026-02-22', endDate: '2026-02-25', totalAmount: 7800, discount: 0, discountAmount: 0, status: 'active', createdAt: '2026-02-22T11:30:00Z' },
            { id: uuidv4(), carId: carIds[7], customerName: 'Amit Patel', customerPhone: '+91 76543 21098', startDate: '2026-02-18', endDate: '2026-02-28', totalAmount: 55000, discount: 0, discountAmount: 0, status: 'active', createdAt: '2026-02-18T14:00:00Z' },
        ]
    };
    return { users: seedUsers, cars: seedCars, bookings: seedBookings };
}

// ─── In-place population helpers ─────────────────────────────
function populateUsers(data) {
    users.length = 0;
    users.push(...data);
}

function populateCars(data) {
    Object.keys(cars).forEach(k => delete cars[k]);
    Object.assign(cars, data);
}

function populateBookings(data) {
    Object.keys(bookings).forEach(k => delete bookings[k]);
    Object.assign(bookings, data);
}

// ─── Save to MongoDB ──────────────────────────────────────────
async function saveData() {
    if (!db) return;
    try {
        await usersCol.replaceOne({ _id: 'state' }, { _id: 'state', data: users }, { upsert: true });
        await carsCol.replaceOne({ _id: 'state' }, { _id: 'state', data: cars }, { upsert: true });
        await bookingsCol.replaceOne({ _id: 'state' }, { _id: 'state', data: bookings }, { upsert: true });
    } catch (err) {
        console.error('⚠️  Failed to save to MongoDB:', err.message);
    }
}

// ─── Connect & Init ───────────────────────────────────────────
async function initDB() {
    await client.connect();
    db = client.db('zion-fleet');
    usersCol = db.collection('users');
    carsCol = db.collection('cars');
    bookingsCol = db.collection('bookings');
    console.log('✅ Connected to MongoDB');

    const usersDoc = await usersCol.findOne({ _id: 'state' });
    const carsDoc = await carsCol.findOne({ _id: 'state' });
    const bookingsDoc = await bookingsCol.findOne({ _id: 'state' });

    if (usersDoc && carsDoc && bookingsDoc) {
        populateUsers(usersDoc.data || []);
        populateCars(carsDoc.data || {});
        populateBookings(bookingsDoc.data || {});
        console.log('📂 Loaded data from MongoDB');
    } else {
        console.log('🌱 No data found in MongoDB, seeding...');
        const seed = createSeedData();
        populateUsers(seed.users);
        populateCars(seed.cars);
        populateBookings(seed.bookings);
        await saveData();
        console.log('✅ Seed data saved to MongoDB');
    }

    setInterval(saveData, 30000);
    process.on('SIGINT', async () => { await saveData(); console.log('\n💾 Data saved. Bye!'); process.exit(0); });
    process.on('SIGTERM', async () => { await saveData(); process.exit(0); });
}

function ensureUser(userId) {
    if (!cars[userId]) cars[userId] = [];
    if (!bookings[userId]) bookings[userId] = [];
}

module.exports = { users, cars, bookings, ensureUser, saveData, initDB };
