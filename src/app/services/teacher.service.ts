import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../interfaces/course';
import { Enrollment } from '../interfaces/enrollment';
import { Student } from '../interfaces/student';
import { Teacher } from '../interfaces/teacher';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TeacherService {

  private baseUrl = `${environment.apiUrl}/teacher`;

  constructor(private http: HttpClient) {}

  getTeachers(): Observable<Teacher[]> {
    return this.http.get<Teacher[]>(this.baseUrl);
  }

  getMyCourses(): Observable<Course[]> {
    return this.http.get<Course[]>(`${this.baseUrl}/mycourses`);
  }

  getCourseStudents(courseId: number): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.baseUrl}/mycourses/${courseId}/students`);
  }

  getCourseEnrollments(courseId: number): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/mycourses/${courseId}/enrollments`);
  }
}
