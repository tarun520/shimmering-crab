import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/fleet.models';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private apiUrl = 'http://localhost:3005/api';
    constructor(private http: HttpClient) { }
    getDashboard(): Observable<DashboardStats> { return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`); }
}
