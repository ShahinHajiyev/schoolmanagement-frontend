import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enrollment } from '../interfaces/enrollment';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {

  private apiUrl = `${environment.apiUrl}/enrollment`;

  constructor(private httpClient: HttpClient) {}

  getMyEnrollments(): Observable<Enrollment[]> {
    return this.httpClient.get<Enrollment[]>(`${this.apiUrl}/myenrollments`);
  }

  isEnrolled(courseId: number): Observable<boolean> {
    return this.httpClient.get<boolean>(`${this.apiUrl}/isenrolled/${courseId}`);
  }

  registerCourse(courseId: number, neptunCode: string): Observable<HttpResponse<any>> {
    return this.httpClient.post<any>(
      `${this.apiUrl}/addenrollment`,
      { courseId, neptunCode },
      { observe: 'response' }
    );
  }

  unregisterCourse(courseId: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.apiUrl}/${courseId}`);
  }
}
