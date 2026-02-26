import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Car } from '../models/fleet.models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CarService {
    private apiUrl = environment.apiUrl;
    constructor(private http: HttpClient) { }
    getCars(): Observable<Car[]> { return this.http.get<Car[]>(`${this.apiUrl}/cars`); }
    createCar(car: Partial<Car>): Observable<Car> { return this.http.post<Car>(`${this.apiUrl}/cars`, car); }
    updateCar(id: string, car: Partial<Car>): Observable<Car> { return this.http.put<Car>(`${this.apiUrl}/cars/${id}`, car); }
    deleteCar(id: string): Observable<Car> { return this.http.delete<Car>(`${this.apiUrl}/cars/${id}`); }
}
