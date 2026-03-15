import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-auth',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="auth-bg">
      <div class="auth-card">
        <div class="auth-logo">
          <img src="assets/logo.png" alt="ZION CAR RENTALS" class="auth-logo-img">
        </div>
        <h1>ZION</h1>
        <p class="sub">Car Rentals Fleet Management</p>

        <div class="tabs">
          <button [class.active]="mode==='login'" (click)="mode='login'">Sign In</button>
          <button [class.active]="mode==='register'" (click)="mode='register'">Register</button>
        </div>

        <form (ngSubmit)="submit()">
          <div class="form-group" *ngIf="mode==='register'">
            <label>Display Name</label>
            <input [(ngModel)]="displayName" name="displayName" placeholder="Your name">
          </div>
          <div class="form-group">
            <label>Username</label>
            <input [(ngModel)]="username" name="username" placeholder="username" required>
          </div>
          <div class="form-group">
            <label>Password</label>
            <input [(ngModel)]="password" name="password" type="password" placeholder="••••••••" required>
          </div>
          <p class="error" *ngIf="error">{{ error }}</p>
          <button type="submit" class="btn-submit" [disabled]="loading">
            {{ loading ? 'Please wait...' : (mode==='login' ? 'Sign In' : 'Create Account') }}
          </button>
        </form>
        <p class="hint" *ngIf="mode==='login'">Demo: <b>demo</b> / <b>demo1234</b></p>
      </div>
    </div>
  `,
    styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    .auth-bg { min-height: 100vh; display: flex; align-items: center; justify-content: center;
      background: radial-gradient(ellipse at 60% 40%, #1a2a6c 0%, #0a0f1e 70%); font-family: 'Inter', sans-serif; }
    .auth-card { background: rgba(15,20,40,0.95); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px;
      padding: 40px; width: 420px; max-width: 95vw; text-align: center; box-shadow: 0 24px 60px rgba(0,0,0,0.6); }
    .auth-logo { width: 180px; height: 64px; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
    .auth-logo-img { max-width: 100%; max-height: 100%; object-fit: contain; }
    h1 { color: white; font-size: 2rem; font-weight: 700; letter-spacing: 4px; }
    .sub { color: #64748b; font-size: 0.85rem; margin-top: 4px; margin-bottom: 24px; }
    .tabs { display: flex; gap: 8px; background: rgba(255,255,255,0.05); border-radius: 10px; padding: 4px; margin-bottom: 24px; }
    .tabs button { flex: 1; padding: 8px; border: none; border-radius: 8px; color: #64748b; background: transparent;
      font-size: 0.9rem; font-family: 'Inter',sans-serif; cursor: pointer; transition: all 0.2s; }
    .tabs button.active { background: #3b82f6; color: white; font-weight: 600; }
    .form-group { text-align: left; margin-bottom: 16px; }
    label { display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
    input { width: 100%; padding: 12px 16px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px; color: white; font-size: 0.95rem; font-family: 'Inter',sans-serif; outline: none; }
    input:focus { border-color: #3b82f6; }
    .btn-submit { width: 100%; padding: 14px; background: linear-gradient(135deg,#3b82f6,#1d4ed8); border: none;
      border-radius: 12px; color: white; font-size: 1rem; font-weight: 600; cursor: pointer; margin-top: 8px;
      font-family: 'Inter',sans-serif; transition: opacity 0.2s; }
    .btn-submit:disabled { opacity: 0.6; }
    .error { color: #ef4444; font-size: 0.85rem; margin-bottom: 8px; }
    .hint { color: #64748b; font-size: 0.82rem; margin-top: 16px; }
    .hint b { color: #94a3b8; }
  `]
})
export class AuthComponent {
    mode = 'login';
    username = '';
    password = '';
    displayName = '';
    error = '';
    loading = false;

    constructor(private authService: AuthService, private router: Router) { }

    submit() {
        this.error = '';
        this.loading = true;
        const obs = this.mode === 'login'
            ? this.authService.login(this.username, this.password)
            : this.authService.register(this.username, this.password, this.displayName);
        obs.subscribe({
            next: () => this.router.navigate(['/']),
            error: (e) => { this.error = e.error?.error || 'Something went wrong'; this.loading = false; }
        });
    }
}
