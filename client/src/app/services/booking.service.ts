import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Booking } from '../models/fleet.models';

@Injectable({ providedIn: 'root' })
export class BookingService {
    private apiUrl = 'http://localhost:3005/api';
    constructor(private http: HttpClient) { }
    getBookings(): Observable<Booking[]> { return this.http.get<Booking[]>(`${this.apiUrl}/bookings`); }
    createBooking(data: any): Observable<Booking> { return this.http.post<Booking>(`${this.apiUrl}/bookings`, data); }
    completeBooking(id: string): Observable<Booking> { return this.http.put<Booking>(`${this.apiUrl}/bookings/${id}/complete`, {}); }
}
