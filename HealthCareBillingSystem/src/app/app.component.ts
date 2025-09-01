import { Component } from '@angular/core';
import { Router, RouterOutlet, RouterLink, NavigationEnd } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'HealthCare Billing System';
  currentRoute: string = '';

  constructor(private authService: AuthService, private router: Router) {
    // Track route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url;
    });
  }

  get isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isOnDashboard(): boolean {
    // Check if we're on any authenticated route (dashboard, patients, billing)
    return this.currentRoute.includes('/dashboard') || 
           this.currentRoute.includes('/patients') || 
           this.currentRoute.includes('/billing');
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}