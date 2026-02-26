import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStats } from '../../models/fleet.models';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div style="font-family:'Inter',sans-serif">
      <div style="margin-bottom:24px;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <h1 style="color:white;font-size:1.8rem;font-weight:700">Dashboard</h1>
          <p style="color:#64748b;margin-top:4px">Fleet overview & real-time statistics</p>
        </div>
        <button (click)="load()" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;border-radius:10px;color:white;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif">
          <span class="material-icons-round">refresh</span> Refresh
        </button>
      </div>

      <div *ngIf="stats" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:16px;margin-bottom:24px">
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(59,130,246,0.15)"><span class="material-icons-round" style="color:#3b82f6">directions_car</span></div>
          <div class="stat-label">TOTAL FLEET</div>
          <div class="stat-val">{{ stats.total }}</div>
          <div class="stat-sub">vehicles registered</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(34,197,94,0.15)"><span class="material-icons-round" style="color:#22c55e">check_circle</span></div>
          <div class="stat-label">AVAILABLE</div>
          <div class="stat-val">{{ stats.available }}</div>
          <div class="stat-sub">{{ stats.total > 0 ? (stats.available/stats.total*100|number:'1.0-0') : 0 }}% of fleet</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(239,68,68,0.15)"><span class="material-icons-round" style="color:#ef4444">event_busy</span></div>
          <div class="stat-label">BOOKED</div>
          <div class="stat-val">{{ stats.booked }}</div>
          <div class="stat-sub">{{ stats.total > 0 ? (stats.booked/stats.total*100|number:'1.0-0') : 0 }}% utilization</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(234,179,8,0.15)"><span class="material-icons-round" style="color:#eab308">build</span></div>
          <div class="stat-label">MAINTENANCE</div>
          <div class="stat-val">{{ stats.maintenance }}</div>
          <div class="stat-sub">under service</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon" style="background:rgba(168,85,247,0.15)"><span class="material-icons-round" style="color:#a855f7">payments</span></div>
          <div class="stat-label">TOTAL REVENUE</div>
          <div class="stat-val" style="font-size:1.4rem">₹{{ stats.totalRevenue | number }}</div>
          <div class="stat-sub">all time</div>
        </div>
      </div>

      <div *ngIf="stats?.recentBookings?.length" style="background:#0d1424;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px">
        <h2 style="color:white;font-size:1rem;font-weight:600;margin-bottom:16px">Recent Bookings</h2>
        <div *ngFor="let b of stats!.recentBookings" style="display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid rgba(255,255,255,0.05)">
          <div>
            <div style="color:white;font-weight:500">{{ b.customerName }}</div>
            <div style="color:#64748b;font-size:0.8rem">{{ b.carName }} · {{ b.carPlate }}</div>
          </div>
          <div style="text-align:right">
            <div style="color:#22c55e;font-weight:600">₹{{ b.totalAmount | number }}</div>
            <span style="font-size:0.75rem;padding:2px 8px;border-radius:20px;font-weight:600"
              [style.background]="b.status==='active'?'rgba(59,130,246,0.15)':'rgba(34,197,94,0.15)'"
              [style.color]="b.status==='active'?'#3b82f6':'#22c55e'">{{ b.status }}</span>
          </div>
        </div>
      </div>

      <div *ngIf="loading" style="text-align:center;color:#64748b;padding:60px">Loading...</div>
    </div>
  `,
    styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
    .stat-card { background:#0d1424;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px; }
    .stat-icon { width:48px;height:48px;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:12px; }
    .stat-icon .material-icons-round { font-size:24px; }
    .stat-label { color:#64748b;font-size:0.7rem;font-weight:600;letter-spacing:1px;text-transform:uppercase;margin-bottom:4px; }
    .stat-val { color:white;font-size:2rem;font-weight:700;line-height:1; }
    .stat-sub { color:#64748b;font-size:0.8rem;margin-top:4px; }
  `]
})
export class DashboardComponent implements OnInit {
    stats: DashboardStats | null = null;
    loading = true;
    constructor(private dashboardService: DashboardService) { }
    ngOnInit() { this.load(); }
    load() {
        this.loading = true;
        this.dashboardService.getDashboard().subscribe({ next: d => { this.stats = d; this.loading = false; }, error: () => { this.loading = false; } });
    }
}
