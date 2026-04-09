import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enrollment } from '../interfaces/enrollment';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GradesService {

  private baseUrl = `${environment.apiUrl}/grades`;

  constructor(private http: HttpClient) {}

  getMyGrades(): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/my`);
  }

  getGradesByCourse(courseId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/course/${courseId}`);
  }

  updateGrade(enrollmentId: string, grade: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${enrollmentId}`, { grade });
  }
}
