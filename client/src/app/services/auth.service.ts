import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthUser { id: string; username: string; displayName: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        if (token && user) {
            try { this.currentUserSubject.next(JSON.parse(user)); } catch { }
        }
    }

    login(username: string, password: string) {
        return this.http.post<{ token: string; user: AuthUser }>(`${this.apiUrl}/login`, { username, password }).pipe(
            tap(res => {
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                this.currentUserSubject.next(res.user);
            })
        );
    }

    register(username: string, password: string, displayName: string) {
        return this.http.post<{ token: string; user: AuthUser }>(`${this.apiUrl}/register`, { username, password, displayName }).pipe(
            tap(res => {
                localStorage.setItem('token', res.token);
                localStorage.setItem('user', JSON.stringify(res.user));
                this.currentUserSubject.next(res.user);
            })
        );
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
    }

    isLoggedIn(): boolean { return !!localStorage.getItem('token'); }
    getToken(): string | null { return localStorage.getItem('token'); }
    getCurrentUser(): AuthUser | null { return this.currentUserSubject.value; }
}
