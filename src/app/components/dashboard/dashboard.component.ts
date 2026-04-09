import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { DashboardStats } from 'src/app/interfaces/dashboard-stats';
import { RecentEnrollment } from 'src/app/interfaces/recent-enrollment';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  stats: DashboardStats | null = null;
  recentEnrollments: RecentEnrollment[] = [];
  loggedUser: string | null = null;

  // Calendar state
  calendarDays: (number | null)[] = [];
  currentMonth: string = '';
  todayDate: Date = new Date();
  private todayDayNumber: number = this.todayDate.getDate();

  private destroy$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    this.loggedUser = this.authService.getLoggedUserSync();
    this.buildCalendar();
    this.loadStats();
    this.loadRecentEnrollments();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadStats(): void {
    this.dashboardService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.stats = data });
  }

  private loadRecentEnrollments(): void {
    this.dashboardService.getRecentEnrollments()
      .pipe(takeUntil(this.destroy$))
      .subscribe({ next: data => this.recentEnrollments = data });
  }

  private buildCalendar(): void {
    const now = new Date();
    this.currentMonth = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Pad the start so day 1 falls on the correct weekday column (Mon-based)
    const offset = (firstDay + 6) % 7; // convert Sun=0 to Mon=0
    this.calendarDays = [
      ...Array(offset).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1)
    ];
  }

  isToday(day: number | null): boolean {
    return day === this.todayDayNumber;
  }

  logout(): void {
    this.authService.logout();
  }
}
