import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ScheduleEntry } from '../interfaces/schedule-entry';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private baseUrl = `${environment.apiUrl}/schedule`;

  constructor(private http: HttpClient) {}

  getSchedule(weekStart: string): Observable<ScheduleEntry[]> {
    return this.http.get<ScheduleEntry[]>(`${this.baseUrl}?weekStart=${weekStart}`);
  }
}
