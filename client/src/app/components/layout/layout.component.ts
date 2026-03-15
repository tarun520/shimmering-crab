import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'app-layout',
    standalone: true,
    imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
    template: `
    <div class="app-shell">
      <!-- Backdrop -->
      <div class="sidebar-backdrop" [class.visible]="sidebarOpen" (click)="sidebarOpen=false"></div>

      <!-- Sidebar -->
      <nav class="sidebar" [class.open]="sidebarOpen">
        <div class="sidebar-header">
          <div class="logo-wrap">
            <img src="assets/logo.png" alt="ZION CAR RENTALS" class="logo-img">
            <div><div class="logo-name">ZION</div><div class="logo-sub">CAR RENTALS</div></div>
          </div>
          <button class="btn-icon close-btn" (click)="sidebarOpen=false"><span class="material-icons-round">close</span></button>
        </div>
        <div class="sidebar-nav">
          <a class="nav-item" routerLink="/dashboard" routerLinkActive="active">
            <span class="material-icons-round">dashboard</span> Dashboard
          </a>
          <a class="nav-item" routerLink="/fleet" routerLinkActive="active">
            <span class="material-icons-round">directions_car</span> Fleet
          </a>
          <a class="nav-item" routerLink="/bookings" routerLinkActive="active">
            <span class="material-icons-round">event</span> Bookings
          </a>
        </div>
        <div class="sidebar-footer">
          <div class="user-info"><span class="material-icons-round">account_circle</span> {{ displayName }}</div>
          <button class="nav-item logout" (click)="logout()"><span class="material-icons-round">logout</span> Logout</button>
        </div>
      </nav>

      <!-- Main -->
      <div class="main-area">
        <header class="topbar">
          <button class="btn-icon hamburger" (click)="sidebarOpen=!sidebarOpen"><span class="material-icons-round">menu</span></button>
          <div class="topbar-clock">
            <span class="material-icons-round" style="font-size:16px">schedule</span> {{ now }}
          </div>
          <div class="user-avatar">{{ displayName.charAt(0).toUpperCase() }}</div>
        </header>
        <div class="page-content">
          <router-outlet></router-outlet>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
    :host { display: block; height: 100vh; }
    * { box-sizing: border-box; }
    .app-shell { display: flex; height: 100vh; background: #0a0f1e; color: white; font-family: 'Inter',sans-serif; overflow: hidden; }
    .sidebar { width: 260px; background: #0d1424; border-right: 1px solid rgba(255,255,255,0.07); display: flex; flex-direction: column;
      flex-shrink: 0; position: fixed; top: 0; left: 0; height: 100vh; z-index: 200; transition: transform 0.3s; }
    .sidebar-backdrop { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 150; opacity: 0; pointer-events: none; transition: opacity 0.3s; }
    .sidebar-header { padding: 20px 16px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.07); }
    .logo-wrap { display: flex; align-items: center; gap: 12px; }
    .logo-img { height: 40px; width: auto; object-fit: contain; }
    .logo-name { font-weight: 700; font-size: 1rem; letter-spacing: 3px; color: white; }
    .logo-sub { font-size: 0.65rem; color: #64748b; letter-spacing: 1px; }
    .close-btn { display: none; }
    .sidebar-nav { flex: 1; padding: 16px 12px; display: flex; flex-direction: column; gap: 4px; overflow-y: auto; }
    .nav-item { display: flex; align-items: center; gap: 12px; padding: 12px 14px; border-radius: 12px; color: #64748b;
      text-decoration: none; font-size: 0.9rem; font-weight: 500; cursor: pointer; background: none; border: none;
      width: 100%; font-family: 'Inter',sans-serif; transition: all 0.2s; }
    .nav-item:hover, .nav-item.active { background: rgba(59,130,246,0.12); color: #3b82f6; }
    .nav-item.active { font-weight: 600; }
    .sidebar-footer { padding: 16px 12px; border-top: 1px solid rgba(255,255,255,0.07); display: flex; flex-direction: column; gap: 4px; }
    .user-info { display: flex; align-items: center; gap: 8px; padding: 8px 14px; color: #94a3b8; font-size: 0.85rem; }
    .logout { color: #ef4444 !important; }
    .logout:hover { background: rgba(239,68,68,0.1) !important; }
    .main-area { flex: 1; display: flex; flex-direction: column; margin-left: 260px; min-width: 0; overflow: hidden; }
    .topbar { height: 60px; background: #0d1424; border-bottom: 1px solid rgba(255,255,255,0.07);
      display: flex; align-items: center; padding: 0 24px; gap: 12px; flex-shrink: 0; }
    .hamburger { display: none !important; }
    .topbar-clock { display: flex; align-items: center; gap: 6px; background: rgba(255,255,255,0.05); border-radius: 20px;
      padding: 6px 14px; color: #94a3b8; font-size: 0.8rem; margin-left: auto; }
    .user-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg,#3b82f6,#1d4ed8);
      display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; }
    .page-content { flex: 1; overflow-y: auto; padding: 32px; }
    .btn-icon { background: rgba(255,255,255,0.05); border: none; border-radius: 8px; width: 36px; height: 36px;
      display: flex; align-items: center; justify-content: center; cursor: pointer; color: #94a3b8; }
    @media (max-width: 768px) {
      .sidebar { transform: translateX(-100%); }
      .sidebar.open { transform: translateX(0); }
      .sidebar-backdrop.visible { display: block; opacity: 1; pointer-events: all; }
      .close-btn { display: flex !important; }
      .main-area { margin-left: 0; }
      .hamburger { display: flex !important; }
      .page-content { padding: 16px; }
    }
  `]
})
export class LayoutComponent implements OnInit, OnDestroy {
    sidebarOpen = false;
    displayName = '';
    now = '';
    private subs = new Subscription();
    private timer: any;

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit() {
        this.subs.add(this.authService.currentUser$.subscribe(u => { this.displayName = u?.displayName || 'User'; }));
        this.subs.add(this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => { this.sidebarOpen = false; }));
        this.updateClock();
        this.timer = setInterval(() => this.updateClock(), 60000);
    }

    ngOnDestroy() { this.subs.unsubscribe(); clearInterval(this.timer); }

    updateClock() {
        this.now = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
    }

    logout() { this.authService.logout(); this.router.navigate(['/login']); }
}
