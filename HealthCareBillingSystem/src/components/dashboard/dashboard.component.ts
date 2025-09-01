import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatListModule,
    MatDividerModule,
    MatButtonModule,
    RouterModule,
    RouterOutlet
  ]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;
  currentRoute: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.currentUser = this.authService.currentUserValue;
    
    // Subscribe to route changes to update page title
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.currentRoute = event.urlAfterRedirects;
      }
    });
  }

  getPageTitle(): string {
    if (this.currentRoute.includes('/patients')) {
      return 'Patients';
    } else if (this.currentRoute.includes('/billing')) {
      return 'Billing';
    }
    return 'Dashboard';
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}