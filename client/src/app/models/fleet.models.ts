export interface Car {
    id: string;
    make: string;
    model: string;
    year: number;
    plate: string;
    status: 'available' | 'booked' | 'maintenance';
    dailyRate: number;
    category: string;
    fuel: string;
    seats: number;
    image: string;
}

export interface Booking {
    id: string;
    carId: string;
    customerName: string;
    customerPhone: string;
    startDate: string;
    endDate: string;
    totalAmount: number;
    discount?: number;
    discountAmount?: number;
    status: 'active' | 'completed';
    createdAt: string;
    carName?: string;
    carPlate?: string;
}

export interface DashboardStats {
    total: number;
    available: number;
    booked: number;
    maintenance: number;
    activeBookings: number;
    totalRevenue: number;
    categories: { [key: string]: number };
    statusBreakdown: { available: number; booked: number; maintenance: number };
    recentBookings: Booking[];
}
