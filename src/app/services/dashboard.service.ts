import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { DashboardStats } from '../interfaces/dashboard-stats';
import { RecentEnrollment } from '../interfaces/recent-enrollment';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/stats`);
  }

  getRecentEnrollments(): Observable<RecentEnrollment[]> {
    return this.http.get<RecentEnrollment[]>(`${this.baseUrl}/recent-enrollments`);
  }
}
