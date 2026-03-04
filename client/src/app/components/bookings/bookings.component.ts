import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../services/booking.service';
import { CarService } from '../../services/car.service';
import { Booking, Car } from '../../models/fleet.models';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div style="font-family:'Inter',sans-serif">
      <div style="margin-bottom:24px;display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
        <div>
          <h1 style="color:white;font-size:1.8rem;font-weight:700">Bookings</h1>
          <p style="color:#64748b;margin-top:4px">Manage rental bookings • {{ bookings.length }} total</p>
        </div>
        <button (click)="openModal()" style="display:flex;align-items:center;gap:8px;padding:10px 20px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;border-radius:10px;color:white;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif">
          <span class="material-icons-round">add</span> New Booking
        </button>
      </div>

      <!-- Filter -->
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:20px">
        <div *ngFor="let f of ['all','active','completed']" (click)="filter=f"
          style="padding:8px 16px;border-radius:20px;cursor:pointer;font-size:0.85rem;font-weight:500;transition:all 0.2s"
          [style.background]="filter===f?'linear-gradient(135deg,#3b82f6,#1d4ed8)':'rgba(255,255,255,0.05)'"
          [style.color]="filter===f?'white':'#94a3b8'"
          [style.border]="filter===f?'none':'1px solid rgba(255,255,255,0.1)'">
          {{ bookingCount(f) }} {{ f | titlecase }}
        </div>
      </div>

      <!-- List -->
      <div *ngFor="let b of filtered" style="background:#0d1424;border:1px solid rgba(255,255,255,0.07);border-radius:16px;padding:20px;margin-bottom:12px">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:44px;height:44px;border-radius:50%;background:rgba(59,130,246,0.15);display:flex;align-items:center;justify-content:center">
              <span class="material-icons-round" style="color:#3b82f6">person</span>
            </div>
            <div>
              <div style="color:white;font-weight:600">{{ b.customerName }}</div>
              <div style="color:#64748b;font-size:0.82rem" *ngIf="b.customerPhone">{{ b.customerPhone }}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="padding:4px 12px;border-radius:20px;font-size:0.75rem;font-weight:600;text-transform:uppercase"
              [style.background]="b.status==='active'?'rgba(59,130,246,0.15)':'rgba(34,197,94,0.15)'"
              [style.color]="b.status==='active'?'#3b82f6':'#22c55e'">{{ b.status }}</span>
            <button *ngIf="b.status==='active'" (click)="confirmId=b.id"
              style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(34,197,94,0.1);border:1px solid rgba(34,197,94,0.3);border-radius:8px;color:#22c55e;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.85rem">
              <span class="material-icons-round" style="font-size:16px">check</span> Complete
            </button>
            <button (click)="downloadBill(b)"
              style="display:flex;align-items:center;gap:6px;padding:8px 14px;background:rgba(59,130,246,0.1);border:1px solid rgba(59,130,246,0.3);border-radius:8px;color:#3b82f6;cursor:pointer;font-family:'Inter',sans-serif;font-size:0.85rem">
              <span class="material-icons-round" style="font-size:16px">picture_as_pdf</span> Bill
            </button>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.07)">
          <div><div style="color:#64748b;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">Vehicle</div><div style="color:#e2e8f0;font-size:0.9rem;margin-top:2px">{{ b.carName }}</div></div>
          <div><div style="color:#64748b;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">Plate</div><div style="color:#e2e8f0;font-size:0.9rem;margin-top:2px;font-family:monospace">{{ b.carPlate }}</div></div>
          <div><div style="color:#64748b;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">Period</div><div style="color:#e2e8f0;font-size:0.9rem;margin-top:2px">{{ fmt(b.startDate) }} → {{ fmt(b.endDate) }}</div></div>
          <div><div style="color:#64748b;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">Duration</div><div style="color:#e2e8f0;font-size:0.9rem;margin-top:2px">{{ days(b.startDate,b.endDate) }} days</div></div>
          <div><div style="color:#64748b;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">Total</div><div style="color:#22c55e;font-size:1rem;font-weight:700;margin-top:2px">₹{{ b.totalAmount | number }}</div></div>
          <div *ngIf="(b.discount ?? 0) > 0"><div style="color:#64748b;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">Discount</div><div style="color:#22c55e;font-size:0.9rem;font-weight:600;margin-top:2px">{{ b.discount }}% off</div></div>
          <div *ngIf="b.paymentMethod">
            <div style="color:#64748b;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">Payment</div>
            <div style="margin-top:4px">
              <span style="padding:2px 8px;border-radius:12px;font-size:0.72rem;font-weight:600;text-transform:capitalize"
                [style.background]="b.paymentMethod==='full'?'rgba(34,197,94,0.15)':b.paymentMethod==='advance'?'rgba(251,191,36,0.15)':'rgba(245,158,11,0.15)'"
                [style.color]="b.paymentMethod==='full'?'#22c55e':b.paymentMethod==='advance'?'#fbbf24':'#f59e0b'">
                {{ b.paymentMethod === 'full' ? 'Full' : b.paymentMethod === 'advance' ? 'Advance' : 'Partial' }}
              </span>
            </div>
          </div>
          <div *ngIf="b.paymentMethod && b.paymentMethod !== 'full'">
            <div style="color:#64748b;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">Paid</div>
            <div style="color:#e2e8f0;font-size:0.9rem;margin-top:2px">₹{{ (b.amountPaid ?? 0) | number }}</div>
          </div>
          <div *ngIf="b.paymentMethod && b.paymentMethod !== 'full' && (b.balance ?? 0) > 0">
            <div style="color:#64748b;font-size:0.7rem;text-transform:uppercase;letter-spacing:1px">Balance Due</div>
            <div style="color:#f87171;font-size:0.9rem;font-weight:600;margin-top:2px">₹{{ (b.balance ?? 0) | number }}</div>
          </div>
        </div>
      </div>

      <div *ngIf="filtered.length===0&&!loading" style="text-align:center;color:#64748b;padding:60px">
        <span class="material-icons-round" style="font-size:48px;display:block;margin-bottom:12px">event_note</span>No bookings found.
      </div>
    </div>

    <!-- Create Modal -->
    <div *ngIf="showModal" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000;padding:16px" (click)="closeModal()">
      <div style="background:#0d1424;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:28px;width:480px;max-width:100%;max-height:90vh;overflow-y:auto" (click)="$event.stopPropagation()">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px">
          <h2 style="color:white">New Booking</h2>
          <button (click)="closeModal()" style="background:rgba(255,255,255,0.05);border:none;border-radius:8px;width:36px;height:36px;color:#64748b;cursor:pointer;display:flex;align-items:center;justify-content:center">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <div style="display:flex;flex-direction:column;gap:14px">
          <div><label class="flabel">Customer Name</label><input [(ngModel)]="form.customerName" placeholder="Enter name" class="finput"></div>
          <div><label class="flabel">Phone Number</label><input [(ngModel)]="form.customerPhone" placeholder="+91 98765 43210" class="finput"></div>
          <div><label class="flabel">Select Vehicle</label>
            <select [(ngModel)]="form.carId" class="finput">
              <option value="">-- Select an available car --</option>
              <option *ngFor="let c of availableCars" [value]="c.id">{{ c.make }} {{ c.model }} ({{ c.plate }}) – ₹{{ c.dailyRate | number }}/day</option>
            </select>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            <div><label class="flabel">Start Date</label><input type="date" [(ngModel)]="form.startDate" class="finput"></div>
            <div><label class="flabel">End Date</label><input type="date" [(ngModel)]="form.endDate" class="finput"></div>
          </div>
          <div>
            <label class="flabel">Discount % <span style="font-size:0.7rem;color:#64748b;font-style:italic">(optional)</span></label>
            <div style="position:relative;display:flex;align-items:center">
              <span class="material-icons-round" style="position:absolute;left:12px;color:#64748b;font-size:18px">percent</span>
              <input type="number" min="0" max="100" [(ngModel)]="form.discount" placeholder="0" class="finput" style="padding-left:40px;max-width:160px">
            </div>
          </div>

          <!-- Payment Method -->
          <div>
            <label class="flabel">Payment Method</label>
            <div style="display:flex;gap:8px;flex-wrap:wrap">
              <div *ngFor="let pm of paymentMethods" (click)="form.paymentMethod=pm.value"
                style="flex:1;min-width:90px;padding:10px 8px;border-radius:10px;cursor:pointer;text-align:center;transition:all 0.2s;font-size:0.82rem;font-weight:500"
                [style.background]="form.paymentMethod===pm.value ? pm.activeBg : 'rgba(255,255,255,0.04)'"
                [style.border]="form.paymentMethod===pm.value ? ('1px solid ' + pm.activeColor) : '1px solid rgba(255,255,255,0.1)'"
                [style.color]="form.paymentMethod===pm.value ? pm.activeColor : '#94a3b8'">
                <span class="material-icons-round" style="font-size:16px;display:block;margin-bottom:2px">{{ pm.icon }}</span>
                {{ pm.label }}
              </div>
            </div>
          </div>

          <!-- Amount Paid (for advance/partial) -->
          <div *ngIf="form.paymentMethod==='advance' || form.paymentMethod==='partial'">
            <label class="flabel">Amount Paid <span style="font-size:0.7rem;color:#64748b;font-style:italic">(advance received)</span></label>
            <div style="position:relative;display:flex;align-items:center">
              <span style="position:absolute;left:12px;color:#64748b;font-weight:600;font-size:14px">₹</span>
              <input type="number" min="0" [(ngModel)]="form.amountPaid" placeholder="0" class="finput" style="padding-left:32px">
            </div>
          </div>

          <!-- Estimate -->
          <div *ngIf="subtotal > 0" style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:12px;padding:16px">
            <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:0.85rem;margin-bottom:8px"><span>Daily Rate</span><span>₹{{ carRate() | number }}</span></div>
            <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:0.85rem;margin-bottom:8px"><span>Duration</span><span>{{ days(form.startDate,form.endDate) }} days</span></div>
            <div style="display:flex;justify-content:space-between;color:#94a3b8;font-size:0.85rem;margin-bottom:8px"><span>Subtotal</span><span>₹{{ subtotal | number }}</span></div>
            <div *ngIf="form.discount > 0" style="display:flex;justify-content:space-between;color:#22c55e;font-size:0.85rem;margin-bottom:8px"><span>Discount ({{ form.discount }}%)</span><span>-₹{{ discountAmt() | number }}</span></div>
            <div style="display:flex;justify-content:space-between;color:white;font-weight:700;font-size:1rem;padding-top:8px;border-top:1px solid rgba(255,255,255,0.1)"><span>Total</span><span>₹{{ total() | number }}</span></div>
            <ng-container *ngIf="form.paymentMethod==='advance' || form.paymentMethod==='partial'">
              <div style="display:flex;justify-content:space-between;color:#22c55e;font-size:0.85rem;margin-top:8px"><span>Paid Now</span><span>₹{{ paidNow() | number }}</span></div>
              <div style="display:flex;justify-content:space-between;font-size:0.9rem;font-weight:600;margin-top:4px"
                [style.color]="balanceAmt()>0?'#f87171':'#22c55e'">
                <span>Balance Due</span><span>₹{{ balanceAmt() | number }}</span>
              </div>
            </ng-container>
          </div>
        </div>
        <div style="display:flex;gap:10px;margin-top:20px">
          <button (click)="closeModal()" style="flex:1;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#94a3b8;cursor:pointer;font-family:'Inter',sans-serif">Cancel</button>
          <button (click)="createBooking()" [disabled]="!form.carId||!form.customerName||!form.startDate||!form.endDate"
            style="flex:2;padding:12px;background:linear-gradient(135deg,#3b82f6,#1d4ed8);border:none;border-radius:10px;color:white;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;display:flex;align-items:center;justify-content:center;gap:8px">
            <span class="material-icons-round" style="font-size:18px">event_available</span> Create Booking
          </button>
        </div>
      </div>
    </div>

    <!-- Confirm Complete -->
    <div *ngIf="confirmId" style="position:fixed;inset:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:1000" (click)="confirmId=null">
      <div style="background:#0d1424;border:1px solid rgba(255,255,255,0.1);border-radius:20px;padding:32px;width:380px;max-width:90vw;text-align:center" (click)="$event.stopPropagation()">
        <span class="material-icons-round" style="font-size:48px;color:#22c55e;margin-bottom:12px;display:block">check_circle</span>
        <h2 style="color:white;margin-bottom:8px">Complete Booking?</h2>
        <p style="color:#64748b;font-size:0.9rem;margin-bottom:24px">This will mark the booking as completed and set the car back to available.</p>
        <div style="display:flex;gap:10px">
          <button (click)="cancelConfirm()" style="flex:1;padding:12px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:10px;color:#94a3b8;cursor:pointer;font-family:'Inter',sans-serif">Cancel</button>
          <button (click)="complete()" style="flex:1;padding:12px;background:linear-gradient(135deg,#22c55e,#16a34a);border:none;border-radius:10px;color:white;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif">Confirm</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons+Round');
    .flabel { display:block;color:#94a3b8;font-size:0.75rem;font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px; }
    .finput { width:100%;padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;color:white;font-family:'Inter',sans-serif;font-size:0.9rem;outline:none; }
    select option { background:#0d1424; }
    input::placeholder { color:#4b5563; }
  `]
})
export class BookingsComponent implements OnInit {
  bookings: Booking[] = [];
  availableCars: Car[] = [];
  loading = true;
  filter = 'all';
  showModal = false;
  confirmId: string | null = null;
  form: any = this.emptyForm();

  paymentMethods = [
    { value: 'full', label: 'Full', icon: 'payments', activeBg: 'rgba(34,197,94,0.12)', activeColor: '#22c55e' },
    { value: 'advance', label: 'Advance', icon: 'account_balance_wallet', activeBg: 'rgba(251,191,36,0.12)', activeColor: '#fbbf24' },
    { value: 'partial', label: 'Partial', icon: 'receipt_long', activeBg: 'rgba(249,115,22,0.12)', activeColor: '#f97316' },
  ];

  constructor(private bookingService: BookingService, private carService: CarService) { }
  ngOnInit() { this.load(); }
  load() { this.loading = true; this.bookingService.getBookings().subscribe({ next: d => { this.bookings = d; this.loading = false; }, error: () => this.loading = false }); }

  get filtered() { return this.filter === 'all' ? this.bookings : this.bookings.filter(b => b.status === this.filter); }
  get subtotal() {
    if (!this.form.startDate || !this.form.endDate || !this.form.carId) return 0;
    return this.days(this.form.startDate, this.form.endDate) * this.carRate();
  }

  carRate() { const c = this.availableCars.find(c => c.id === this.form.carId); return c ? c.dailyRate : 0; }
  discountAmt() { return Math.round(this.subtotal * Math.min(100, Math.max(0, this.form.discount || 0)) / 100); }
  total() { return this.subtotal - this.discountAmt(); }
  paidNow() { return this.form.paymentMethod === 'full' ? this.total() : Math.min(this.total(), Math.max(0, Number(this.form.amountPaid) || 0)); }
  balanceAmt() { return this.total() - this.paidNow(); }

  emptyForm() { return { carId: '', customerName: '', customerPhone: '', startDate: new Date().toISOString().split('T')[0], endDate: '', discount: 0, paymentMethod: 'full', amountPaid: 0 }; }

  openModal() {
    this.carService.getCars().subscribe({ next: cars => { this.availableCars = cars; } });
    this.form = this.emptyForm();
    this.showModal = true;
  }
  closeModal() { this.showModal = false; }

  createBooking() {
    if (!this.form.carId || !this.form.customerName || !this.form.startDate || !this.form.endDate) return;
    this.bookingService.createBooking(this.form).subscribe({ next: () => { this.closeModal(); this.load(); }, error: (err: any) => { alert(err?.error?.error || 'Booking failed'); } });
  }

  cancelConfirm() { this.confirmId = null; }
  bookingCount(f: string) { return f === 'all' ? this.bookings.length : this.bookings.filter(b => b.status === f).length; }

  complete() {
    if (this.confirmId) {
      this.bookingService.completeBooking(this.confirmId).subscribe({ next: () => { this.confirmId = null; this.load(); } });
    }
  }

  days(start: string, end: string) { return Math.max(1, Math.ceil((new Date(end).getTime() - new Date(start).getTime()) / 86400000)); }
  fmt(d: string) { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }

  downloadBill(b: Booking) {
    const duration = this.days(b.startDate, b.endDate);
    // If we have discountAmount stored use it, otherwise compute from discount %
    const subtotal = b.discountAmount != null
      ? b.totalAmount + b.discountAmount
      : b.totalAmount;
    const discountAmt = b.discountAmount ?? 0;
    const invoiceNo = Math.floor(Math.random() * 900) + 100;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const amountInWords = this.numToWords(b.totalAmount);

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Invoice – ${b.customerName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;color:#1a1a1a;background:#fff;font-size:13px;}
  .page{max-width:780px;margin:0 auto;padding:32px 40px;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:16px;border-bottom:2px solid #0891b2;margin-bottom:16px;}
  .company-name{font-size:18px;font-weight:700;text-transform:uppercase;margin-bottom:4px;}
  .company-detail{font-size:11px;color:#444;line-height:1.6;}
  .logo{width:72px;height:72px;border:2px solid #0891b2;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#0891b2;text-align:center;line-height:1.3;flex-shrink:0;}
  .invoice-title{text-align:center;font-size:18px;font-weight:700;color:#0891b2;margin-bottom:16px;text-decoration:underline;text-underline-offset:4px;}
  .bill-row{display:flex;justify-content:space-between;margin-bottom:20px;}
  .bill-to h4{font-size:11px;font-weight:600;margin-bottom:4px;}
  .bill-to p{font-size:12px;color:#222;font-weight:600;margin-bottom:2px;}
  .bill-to span{font-size:11px;color:#444;display:block;}
  .invoice-details{text-align:right;}
  .invoice-details h4{font-size:11px;font-weight:600;margin-bottom:4px;}
  .invoice-details p{font-size:11px;color:#444;}
  table{width:100%;border-collapse:collapse;margin-bottom:20px;}
  thead tr{background:#0891b2;color:white;}
  thead th{padding:9px 11px;text-align:left;font-size:11px;font-weight:600;}
  thead th:last-child,thead th:nth-child(3),thead th:nth-child(4),thead th:nth-child(5){text-align:right;}
  tbody td{padding:9px 11px;border-bottom:1px solid #e5e7eb;font-size:12px;}
  tbody td:last-child,tbody td:nth-child(3),tbody td:nth-child(4),tbody td:nth-child(5){text-align:right;}
  .total-row td{font-weight:600;border-top:2px solid #0891b2;border-bottom:none;background:#f8fafc;}
  .section{display:flex;gap:32px;margin-bottom:24px;}
  .left-col{flex:1;}
  .right-col{width:300px;flex-shrink:0;}
  .amount-words h4{font-size:11px;font-weight:600;margin-bottom:4px;}
  .amount-words p{font-size:12px;font-weight:600;}
  .terms h4{font-size:11px;font-weight:600;margin:12px 0 4px;}
  .terms p{font-size:11px;color:#555;}
  .summary-row{display:flex;justify-content:space-between;padding:5px 0;font-size:12px;border-bottom:1px solid #f0f0f0;}
  .summary-row.total{background:#0891b2;color:white;padding:8px 10px;font-weight:700;font-size:13px;border-radius:4px;border-bottom:none;margin:4px 0;}
  .footer{display:flex;justify-content:space-between;align-items:flex-end;padding-top:16px;border-top:1px solid #e5e7eb;margin-top:8px;}
  .bank h4{font-size:11px;font-weight:700;margin-bottom:4px;}
  .bank p{font-size:11px;color:#444;line-height:1.7;}
  .signatory{text-align:right;}
  .signatory p{font-size:11px;color:#444;}
  .signatory .for{font-size:11px;font-weight:600;margin-bottom:32px;}
  .signatory .auth{font-size:11px;font-weight:700;border-top:1px solid #222;padding-top:4px;display:inline-block;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body><div class="page">
  <div class="header">
    <div>
      <div class="company-name">Zion Car Rental Service</div>
      <div class="company-detail">
        Phone no.: +91 9100664083<br>
        Email: zioncarrentals90@gmail.com<br>
        State: Telangana
      </div>
    </div>
    <div class="logo">ZION<br>CAR<br>RENTALS</div>
  </div>
  <div class="invoice-title">Tax Invoice</div>
  <div class="bill-row">
    <div class="bill-to">
      <h4>Bill To</h4>
      <p>${b.customerName}</p>
      <span>${b.customerPhone || 'N/A'}</span>
    </div>
    <div class="invoice-details">
      <h4>Invoice Details</h4>
      <p>Invoice No.: ${invoiceNo}</p>
      <p>Date: ${dateStr}</p>
      <p>Time: ${timeStr}</p>
    </div>
  </div>
  <table>
    <thead><tr>
      <th>#</th><th>Item Name</th><th>Quantity</th><th>Price / Unit</th><th>Discount</th><th>Amount</th>
    </tr></thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${b.carName ?? 'Vehicle'}<br><span style="font-size:10px;color:#888">${b.carPlate ?? ''} · ${b.startDate} → ${b.endDate}</span></td>
        <td>${duration} day${duration > 1 ? 's' : ''}</td>
        <td>₹ ${(subtotal / duration).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td>${discountAmt > 0 ? '₹ ' + discountAmt.toLocaleString('en-IN') + '<br><span style="font-size:10px;color:#888">(' + (b.discount ?? 0) + '%)</span>' : '—'}</td>
        <td>₹ ${b.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2"><strong>Total</strong></td>
        <td>${duration}</td>
        <td></td>
        <td>₹ ${discountAmt.toLocaleString('en-IN')}</td>
        <td>₹ ${b.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    </tbody>
  </table>
  <div class="section">
    <div class="left-col">
      <div class="amount-words">
        <h4>Invoice Amount In Words</h4>
        <p>${amountInWords} only</p>
      </div>
      <div class="terms">
        <h4>Terms And Conditions</h4>
        <p>Thank you for doing business with us.</p>
      </div>
    </div>
    <div class="right-col">
      <div class="summary-row"><span>Sub Total</span><span>₹ ${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
      <div class="summary-row"><span>Discount</span><span>₹ ${discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
      <div class="summary-row total"><span>Total</span><span>₹ ${b.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
      <div class="summary-row"><span>Received</span><span>₹ ${(b.amountPaid ?? b.totalAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
      <div class="summary-row" style="${(b.balance ?? 0) > 0 ? 'color:#dc2626;font-weight:600' : ''}"><span>Balance Due</span><span>₹ ${(b.balance ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
      <div class="summary-row"><span>You Saved</span><span>₹ ${discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
      <div class="summary-row"><span>Payment Mode</span><span style="text-transform:capitalize">${b.paymentMethod === 'full' ? 'Full Payment' : b.paymentMethod === 'advance' ? 'Advance Payment' : b.paymentMethod === 'partial' ? 'Partial Payment' : 'Cash'}</span></div>
    </div>
  </div>
  <div class="footer">
    <div class="bank">
      <h4>Pay To:</h4>
      <p>Bank Name: Trimulgherry<br>
      Bank Account No.: 50200095949960<br>
      Bank IFSC code: HDFC0006957<br>
      Account Holder's Name: Zion Car Rental Service.</p>
    </div>
    <div class="signatory">
      <p class="for">For: ZION CAR RENTAL SERVICE</p>
      <p class="auth">Authorized Signatory</p>
    </div>
  </div>
</div><script>window.onload=function(){window.print();}<\/script></body></html>`;

    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
    }
  }

  numToWords(n: number): string {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    if (n === 0) return 'Zero';
    const chunk = (num: number): string => {
      if (num === 0) return '';
      if (num < 20) return ones[num] + ' ';
      if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '') + ' ';
      return ones[Math.floor(num / 100)] + ' Hundred ' + chunk(num % 100);
    };
    const crore = Math.floor(n / 10000000); n %= 10000000;
    const lakh = Math.floor(n / 100000); n %= 100000;
    const thou = Math.floor(n / 1000); n %= 1000;
    let result = '';
    if (crore) result += chunk(crore) + 'Crore ';
    if (lakh) result += chunk(lakh) + 'Lakh ';
    if (thou) result += chunk(thou) + 'Thousand ';
    result += chunk(n);
    return result.trim() + ' Rupees';
  }
}
