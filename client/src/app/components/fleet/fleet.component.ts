import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CarService } from '../../services/car.service';
import { Car } from '../../models/fleet.models';

@Component({
  selector: 'app-fleet',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="font-family:'Inter',sans-serif">
      <div style="margin-bottom:24px;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <h1 style="color:white;font-size:1.8rem;font-weight:700">Fleet Management</h1>
          <p style="color:#64748b;margin-top:4px">Manage your vehicles • {{ cars.length }} total</p>
        </div>
        <button (click)="showModal=true" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;border-radius:10px;color:white;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif">
          <span class="material-icons-round">add</span> Add Vehicle
        </button>
      </div>

      <!-- Filter chips -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
        <div *ngFor="let f of ['all','available','booked','maintenance']"
          (click)="filter=f"
          style="padding:8px 16px;border-radius:20px;cursor:pointer;font-size:0.85rem;font-weight:500;transition:all 0.2s"
          [style.background]="filter===f?'linear-gradient(135deg,#3b82f6,#1d4ed8)':'rgba(255,255,255,0.05)'"
          [style.color]="filter===f?'white':'#94a3b8'"
          [style.border]="filter===f?'none':'1px solid rgba(255,255,255,0.1)'">
          {{ filterCount(f) }} {{ f | titlecase }}
        </div>
      </div>

      <!-- Search -->
      <div style="position:relative;margin-bottom:20px">
        <span class="material-icons-round" style="position:absolute;left:14px;top:50%;transform:translateY(-50%);color:#64748b;font-size:20px">search</span>
        <input [(ngModel)]="search" placeholder="Search by make, model, or plate..."
          style="width:100%;padding:12px 16px 12px 44px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:12px;color:white;font-size:0.9rem;font-family:'Inter',sans-serif;outline:none">
      </div>

      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px">
        <div *ngFor="let car of filtered" class="car-card">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
            <div style="width:48px;height:48px;border-radius:12px;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center">
              <span class="material-icons-round" style="color:#3b82f6;font-size:24px">directions_car</span>
            </div>
            <span style="padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;text-transform:uppercase"
              [style.background]="statusBg(car.status)" [style.color]="statusColor(car.status)">{{ car.status }}</span>
          </div>
          <h3 style="color:white;font-weight:600;margin-bottom:4px">{{ car.make }} {{ car.model }}</h3>
          <p style="color:#64748b;font-size:0.85rem;margin-bottom:12px">{{ car.plate }}</p>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px">
            <div style="color:#94a3b8;font-size:0.8rem"><span style="color:#64748b">📅</span> {{ car.year }}</div>
            <div style="color:#94a3b8;font-size:0.8rem"><span style="color:#64748b">⛽</span> {{ car.fuel }}</div>
            <div style="color:#94a3b8;font-size:0.8rem"><span style="color:#64748b">💺</span> {{ car.seats }} seats</div>
            <div style="color:#94a3b8;font-size:0.8rem"><span style="color:#64748b">🏷️</span> {{ car.category }}</div>
          </div>
          <div style="font-size:1.4rem;font-weight:700;color:#22c55e;margin-bottom:12px">₹{{ car.dailyRate | number }} <span style="font-size:0.75rem;color:#64748b;font-weight:400">/ day</span></div>
          <div style="display:flex;gap:8px;border-top:1px solid rgba(255,255,255,0.07);padding-top:12px">
            <button (click)="startEdit(car)" style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:#94a3b8;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.85rem">
              <span class="material-icons-round" style="font-size:16px">edit</span> Edit
            </button>
            <button (click)="deleteCar(car.id)" style="margin-left:auto;background:rgba(239,68,68,0.1);border:none;border-radius:8px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:#ef4444">
              <span class="material-icons-round" style="font-size:18px">delete</span>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="filtered.length===0&&!loading" style="text-align:center;color:#64748b;padding:60px">
        <span class="material-icons-round" style="font-size:48px;display:block;margin-bottom:12px">directions_car</span>
        No vehicles found.
      </div>
    </div>

    <!-- Modal -->
    <div *ngIf="showModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px" (click)="cancelModal()">
      <div style="background:#0d1424;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px;width:480px;max-width:100%;max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
        <h2 style="color:white;margin-bottom:20px">{{ editId ? 'Edit Vehicle' : 'Add Vehicle' }}</h2>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
          <div *ngFor="let f of formFields">
            <label style="display:block;color:#94a3b8;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">{{ f.label }}</label>
            <select *ngIf="f.options" [(ngModel)]="form[f.key]" style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:white;font-family:'Inter',sans-serif;outline:none">
              <option *ngFor="let o of f.options" [value]="o" style="background:#0d1424">{{ o }}</option>
            </select>
            <input *ngIf="!f.options" [(ngModel)]="form[f.key]" [type]="f.type||'text'" [placeholder]="f.placeholder||''"
              style="width:100%;padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:white;font-family:'Inter',sans-serif;outline:none">
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:20px">
          <button (click)="cancelModal()" style="flex:1;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#94a3b8;cursor:pointer;font-family:'Inter',sans-serif">Cancel</button>
          <button (click)="savecar()" style="flex:2;padding:12px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;border-radius:10px;color:white;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif">
            {{ editId ? 'Save Changes' : 'Add Vehicle' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
    .car-card { background:#0d1424;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;transition:border-color 0.2s; }
    .car-card:hover { border-color:rgba(59,130,246,0.3); }
    input::placeholder { color:#4b5563; }
  `]
})
export class FleetComponent implements OnInit {
  cars: Car[] = [];
  loading = true;
  filter = 'all';
  search = '';
  showModal = false;
  editId: string | null = null;
  form: any = this.emptyForm();

  formFields = [
    { key: 'make', label: 'Make', placeholder: 'e.g. Toyota' },
    { key: 'model', label: 'Model', placeholder: 'e.g. Innova' },
    { key: 'year', label: 'Year', type: 'number', placeholder: '2024' },
    { key: 'plate', label: 'Plate', placeholder: 'KA-01-AB-1001' },
    { key: 'dailyRate', label: 'Daily Rate (₹)', type: 'number', placeholder: '2000' },
    { key: 'seats', label: 'Seats', type: 'number', placeholder: '5' },
    { key: 'status', label: 'Status', options: ['available', 'booked', 'maintenance'] },
    { key: 'category', label: 'Category', options: ['Sedan', 'SUV', 'MPV', 'Hatchback', 'Luxury'] },
    { key: 'fuel', label: 'Fuel', options: ['Petrol', 'Diesel', 'Electric', 'Hybrid'] },
  ];

  constructor(private carService: CarService) { }
  ngOnInit() { this.loadCars(); }
  loadCars() { this.loading = true; this.carService.getCars().subscribe({ next: d => { this.cars = d; this.loading = false; }, error: () => this.loading = false }); }

  get filtered() {
    return this.cars.filter(c =>
      (this.filter === 'all' || c.status === this.filter) &&
      (!this.search || `${c.make} ${c.model} ${c.plate}`.toLowerCase().includes(this.search.toLowerCase()))
    );
  }

  emptyForm() { return { make: '', model: '', year: 2024, plate: '', status: 'available', dailyRate: 2000, category: 'Sedan', fuel: 'Petrol', seats: 5 }; }

  startEdit(car: Car) {
    this.editId = car.id;
    this.form = { make: car.make, model: car.model, year: car.year, plate: car.plate, status: car.status, dailyRate: car.dailyRate, category: car.category, fuel: car.fuel, seats: car.seats };
    this.showModal = true;
  }

  savecar() {
    const obs = this.editId ? this.carService.updateCar(this.editId, this.form) : this.carService.createCar(this.form);
    obs.subscribe({ next: () => { this.showModal = false; this.editId = null; this.form = this.emptyForm(); this.loadCars(); } });
  }

  deleteCar(id: string) { this.carService.deleteCar(id).subscribe({ next: () => this.loadCars() }); }
  cancelModal() { this.showModal = false; this.editId = null; }
  filterCount(f: string) { return f === 'all' ? this.cars.length : this.cars.filter(c => c.status === f).length; }

  statusBg(s: string) { return s === 'available' ? 'rgba(34,197,94,0.15)' : s === 'booked' ? 'rgba(239,68,68,0.15)' : 'rgba(234,179,8,0.15)'; }
  statusColor(s: string) { return s === 'available' ? '#22c55e' : s === 'booked' ? '#ef4444' : '#eab308'; }
}
