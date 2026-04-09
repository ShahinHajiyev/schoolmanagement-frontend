import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enrollment } from '../interfaces/enrollment';
import { Student } from '../interfaces/student';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private baseUrl = `${environment.apiUrl}/student`;

  constructor(private http: HttpClient) {}

  getStudents(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/all`);
  }

  getStudentEnrollments(neptunCode: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/${neptunCode}/enrollments`);
  }
}
