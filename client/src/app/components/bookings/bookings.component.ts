import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  logoBase64 = '';
  signatureBase64 = '';

  paymentMethods = [
    { value: 'full', label: 'Full', icon: 'payments', activeBg: 'rgba(34,197,94,0.12)', activeColor: '#22c55e' },
    { value: 'advance', label: 'Advance', icon: 'account_balance_wallet', activeBg: 'rgba(251,191,36,0.12)', activeColor: '#fbbf24' },
    { value: 'partial', label: 'Partial', icon: 'receipt_long', activeBg: 'rgba(249,115,22,0.12)', activeColor: '#f97316' },
  ];

  constructor(
    private bookingService: BookingService,
    private carService: CarService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.load();
    this.loadBillImages();
  }

  private loadBillImages() {
    const toBase64 = (url: string) =>
      this.http.get(url, { responseType: 'blob' }).toPromise().then(blob => {
        if (!blob) return '';
        return new Promise<string>((res, rej) => {
          const r = new FileReader();
          r.onload = () => res((r.result as string) || '');
          r.onerror = rej;
          r.readAsDataURL(blob);
        });
      }).catch(() => '');
    toBase64('assets/logo.png').then(b => { this.logoBase64 = b; });
    toBase64('assets/signature.png').then(b => { this.signatureBase64 = b; });
  }
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
    const subtotal = b.discountAmount != null
      ? b.totalAmount + b.discountAmount
      : b.totalAmount;
    const discountAmt = b.discountAmount ?? 0;
    const additionalCharges = 0;
    const totalWithCharges = b.totalAmount + additionalCharges;
    const received = b.amountPaid ?? (b.paymentMethod === 'full' ? totalWithCharges : 0);
    const balance = (b.balance ?? totalWithCharges - received);
    const previousBalance = 0;
    const currentBalance = balance;
    const invoiceNo = Math.floor(Math.random() * 900) + 100;
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' }).replace(/\//g, '-');
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const amountInWords = this.numToWords(totalWithCharges);
    const pricePerUnit = (subtotal / duration);
    const discountPct = b.discount ?? (subtotal > 0 ? Math.round((discountAmt / subtotal) * 100) : 0);
    const paymentModeLabel = b.paymentMethod === 'full' ? 'Full Payment' : b.paymentMethod === 'advance' ? 'Advance' : b.paymentMethod === 'partial' ? 'Partial' : 'Zion Car Rentals';

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>Tax Invoice – ${b.customerName}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  *{box-sizing:border-box;margin:0;padding:0;}
  body{font-family:'Inter',sans-serif;color:#1a1a1a;background:#fff;font-size:13px;}
  .page{max-width:780px;margin:0 auto;padding:28px 40px;}
  .top-signatory{text-align:right;margin-bottom:10px;}
  .top-signatory .for{font-size:11px;font-weight:600;color:#1e293b;}
  .top-signatory .auth{font-size:11px;font-weight:700;color:#1e293b;border-top:1px solid #1e293b;padding-top:4px;display:inline-block;}
  .signature-block{margin-top:20px;text-align:right;}
  .signature-block .sign-img{margin-bottom:6px;}
  .signature-block .auth{font-size:11px;font-weight:700;color:#1e293b;border-top:1px solid #1e293b;padding-top:4px;display:inline-block;}
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:12px;border-bottom:2px solid #1e3a5f;margin-bottom:14px;}
  .company-block .company-name{font-size:18px;font-weight:700;color:#1e3a5f;margin-bottom:6px;}
  .company-detail{font-size:11px;color:#334155;line-height:1.65;}
  .logo{width:72px;height:72px;border:2px solid #1e3a5f;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;color:#1e3a5f;text-align:center;line-height:1.3;flex-shrink:0;}
  .bill-logo{height:72px;width:auto;object-fit:contain;flex-shrink:0;}
  .invoice-title{text-align:center;font-size:20px;font-weight:700;color:#1e3a5f;margin-bottom:16px;text-decoration:underline;text-underline-offset:5px;}
  .bill-row{display:flex;justify-content:space-between;margin-bottom:18px;}
  .bill-to h4{font-size:11px;font-weight:600;color:#1e3a5f;margin-bottom:6px;}
  .bill-to .customer-name{font-size:13px;color:#0f172a;font-weight:600;margin-bottom:2px;}
  .bill-to .contact-label{font-size:11px;color:#475569;}
  .invoice-details{text-align:right;}
  .invoice-details h4{font-size:11px;font-weight:600;color:#1e3a5f;margin-bottom:6px;}
  .invoice-details p{font-size:11px;color:#334155;}
  table{width:100%;border-collapse:collapse;margin-bottom:18px;}
  thead tr{background:#1e3a5f;color:#fff;}
  thead th{padding:10px 12px;text-align:left;font-size:11px;font-weight:600;}
  thead th:last-child,thead th:nth-child(3),thead th:nth-child(4),thead th:nth-child(5),thead th:nth-child(6){text-align:right;}
  tbody td{padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:12px;color:#334155;}
  tbody td:last-child,tbody td:nth-child(3),tbody td:nth-child(4),tbody td:nth-child(5),tbody td:nth-child(6){text-align:right;}
  .total-row td{font-weight:600;border-top:2px solid #1e3a5f;border-bottom:none;background:#f1f5f9;color:#0f172a;}
  .section{display:flex;justify-content:space-between;gap:32px;margin-bottom:22px;}
  .left-col{flex:1;}
  .right-col{width:280px;flex-shrink:0;}
  .amount-words h4{font-size:11px;font-weight:600;color:#1e3a5f;margin-bottom:4px;}
  .amount-words p{font-size:12px;font-weight:600;color:#0f172a;}
  .terms h4{font-size:11px;font-weight:600;color:#1e3a5f;margin:12px 0 4px;}
  .terms p{font-size:11px;color:#475569;}
  .summary-row{display:flex;justify-content:space-between;padding:6px 0;font-size:12px;border-bottom:1px solid #e2e8f0;color:#334155;}
  .summary-row span:last-child{font-weight:500;}
  .summary-row.total{background:#1e3a5f;color:#fff;padding:10px 12px;font-weight:700;font-size:14px;border-radius:4px;border-bottom:none;margin:6px 0;}
  .footer{display:flex;justify-content:space-between;align-items:flex-start;padding-top:16px;border-top:1px solid #e2e8f0;margin-top:12px;}
  .bank h4{font-size:11px;font-weight:700;color:#1e3a5f;margin-bottom:6px;}
  .bank p{font-size:11px;color:#334155;line-height:1.7;}
  @media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}
</style></head><body><div class="page">
  <div class="header">
    <div class="company-block">
      <div class="company-name">ZION CAR RENTAL SERVICE</div>
      <div class="company-detail">
        8,5,199 mallika arjuna colony old bowenpally telangana<br>
        Phone no.: 9100664083<br>
        Email: zioncarrentals90@gmail.com<br>
        State: 36-Telangana
      </div>
    </div>
    ${this.logoBase64 ? `<img src="${this.logoBase64}" alt="ZION CAR RENTALS" class="bill-logo">` : '<div class="logo">ZION<br>CAR<br>RENTALS</div>'}
  </div>
  <div class="invoice-title">Tax Invoice</div>
  <div class="bill-row">
    <div class="bill-to">
      <h4>Bill To</h4>
      <p class="customer-name">${b.customerName}</p>
      <span class="contact-label">Contact No.: ${b.customerPhone || '—'}</span>
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
      <th>#</th><th>Item Name</th><th>Quantity</th><th>Price/ Unit</th><th>Discount</th><th>Amount</th>
    </tr></thead>
    <tbody>
      <tr>
        <td>1</td>
        <td>${b.carName ?? 'Vehicle'}</td>
        <td>${duration}</td>
        <td>₹ ${pricePerUnit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td>${discountAmt > 0 ? '₹ ' + discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 }) + ' (' + discountPct + '%)' : '—'}</td>
        <td>₹ ${b.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
      <tr class="total-row">
        <td colspan="2">Total</td>
        <td>${duration}</td>
        <td></td>
        <td>₹ ${discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
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
    <div class="summary-row"><span>Additional charges 1</span><span>₹ ${additionalCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    <div class="summary-row total"><span>Total</span><span>₹ ${totalWithCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    <div class="summary-row"><span>Received</span><span>₹ ${received.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    <div class="summary-row" style="${currentBalance > 0 ? 'color:#b91c1c;font-weight:600' : ''}"><span>Balance</span><span>₹ ${currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    <div class="summary-row"><span>You Saved</span><span>₹ ${discountAmt.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    <div class="summary-row"><span>Payment Mode</span><span>${paymentModeLabel}</span></div>
    <div class="summary-row"><span>Previous Balance</span><span>₹ ${previousBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    <div class="summary-row" style="font-weight:600"><span>Current Balance</span><span>₹ ${currentBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
<div class="signature-block" style="display: flex; flex-direction: column; align-items: flex-end;">
  ${this.signatureBase64 ? `<img style="display: block; width: 70px; height: 70px; object-fit: contain; margin-bottom: 4px;" src="${this.signatureBase64}" alt="Signature">` : ''}
  <p style="margin: 0;" class="auth">Authorized Signatory</p>
</div>
    </div>
  </div>
  <div class="footer">
    <div class="bank">
      <h4>Pay To:</h4>
      <p>Bank Name: Trimulgherry<br>
      Bank Account No.: 50200095949960<br>
      Bank IFSC code: HDFC0006957<br>
      Account Holder's Name: Zion Car Rental<br>Service.</p>
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
