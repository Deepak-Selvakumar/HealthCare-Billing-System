import { Routes } from '@angular/router';
import { AuthGuard } from '../guards/auth.guard';
import { LoginComponent } from '../components/login/login.component';
import { RegisterComponent } from '../components/register/register.component';
import { DashboardComponent } from '../components/dashboard/dashboard.component';
import { BillListComponent } from '../components/bill-list/bill-list.component';
import { PatientListComponent } from '../components/patient-list/patient-list.component';
 

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { 
    path: '', 
    component: DashboardComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'patients', component: PatientListComponent },
      { path: 'billing', component: BillListComponent },
      { path: 'patients/:id/bills', component: BillListComponent }
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];