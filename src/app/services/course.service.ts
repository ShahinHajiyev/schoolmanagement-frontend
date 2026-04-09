import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../interfaces/course';
import { Student } from '../interfaces/student';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  private courseUrl = `${environment.apiUrl}/course`;

  constructor(private httpClient: HttpClient) {}

  getCourses(): Observable<Course[]> {
    return this.httpClient.get<Course[]>(`${this.courseUrl}/getcourses`);
  }

  getAvailableCourses(): Observable<Course[]> {
    return this.httpClient.get<Course[]>(`${this.courseUrl}/availablecourses`);
  }

  getCourseByCourseId(courseId: number): Observable<Course> {
    return this.httpClient.get<Course>(`${this.courseUrl}/getcourse/${courseId}`);
  }

  getEnrolledStudents(courseId: number): Observable<Student[]> {
    return this.httpClient.get<Student[]>(`${this.courseUrl}/${courseId}/students`);
  }
}
