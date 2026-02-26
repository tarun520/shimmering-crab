import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStats } from '../models/fleet.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DashboardService {
    private apiUrl = environment.apiUrl;
    constructor(private http: HttpClient) { }
    getDashboard(): Observable<DashboardStats> { return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard`); }
}
