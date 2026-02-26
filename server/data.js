const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'db.json');

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
            { id: uuidv4(), carId: carIds[1], customerName: 'Rajesh Kumar', customerPhone: '+91 98765 43210', startDate: '2026-02-20', endDate: '2026-02-27', totalAmount: 19600, status: 'active', createdAt: '2026-02-20T09:00:00Z' },
            { id: uuidv4(), carId: carIds[5], customerName: 'Priya Sharma', customerPhone: '+91 87654 32109', startDate: '2026-02-22', endDate: '2026-02-25', totalAmount: 7800, status: 'active', createdAt: '2026-02-22T11:30:00Z' },
            { id: uuidv4(), carId: carIds[7], customerName: 'Amit Patel', customerPhone: '+91 76543 21098', startDate: '2026-02-18', endDate: '2026-02-28', totalAmount: 55000, status: 'active', createdAt: '2026-02-18T14:00:00Z' },
        ]
    };
    return { users: seedUsers, cars: seedCars, bookings: seedBookings };
}

let users, cars, bookings;

if (fs.existsSync(DATA_FILE)) {
    try {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const saved = JSON.parse(raw);
        users = saved.users || [];
        cars = saved.cars || {};
        bookings = saved.bookings || {};
        console.log('📂 Loaded data from db.json');
    } catch (err) {
        console.error('⚠️  Failed to read db.json, using seed data:', err.message);
        const seed = createSeedData();
        users = seed.users; cars = seed.cars; bookings = seed.bookings;
    }
} else {
    console.log('🌱 No db.json found, creating with seed data');
    const seed = createSeedData();
    users = seed.users; cars = seed.cars; bookings = seed.bookings;
    saveData();
}

function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ users, cars, bookings }, null, 2), 'utf-8');
    } catch (err) {
        console.error('⚠️  Failed to save db.json:', err.message);
    }
}

setInterval(saveData, 30000);
process.on('SIGINT', () => { saveData(); console.log('\n💾 Data saved. Bye!'); process.exit(0); });
process.on('SIGTERM', () => { saveData(); process.exit(0); });

function ensureUser(userId) {
    if (!cars[userId]) cars[userId] = [];
    if (!bookings[userId]) bookings[userId] = [];
}

module.exports = { users, cars, bookings, ensureUser, saveData };
