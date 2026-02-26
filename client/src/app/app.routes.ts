import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
    { path: 'login', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
    {
        path: '',
        loadComponent: () => import('./components/layout/layout.component').then(m => m.LayoutComponent),
        canActivate: [authGuard],
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
            { path: 'dashboard', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
            { path: 'fleet', loadComponent: () => import('./components/fleet/fleet.component').then(m => m.FleetComponent) },
            { path: 'bookings', loadComponent: () => import('./components/bookings/bookings.component').then(m => m.BookingsComponent) },
        ]
    },
    { path: '**', redirectTo: '' }
];
