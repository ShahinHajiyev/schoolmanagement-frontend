import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../interfaces/course';
import { CourseDetails } from '../interfaces/course-details';
import { CourseSchedule } from '../interfaces/course-schedule';
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

  getCourseDetails(courseId: number): Observable<CourseDetails> {
    return this.httpClient.get<CourseDetails>(`${this.courseUrl}/${courseId}/details`);
  }

  saveCourseDetails(courseId: number, details: CourseDetails): Observable<any> {
    return this.httpClient.put<any>(`${this.courseUrl}/${courseId}/details`, details);
  }

  getCourseSchedule(courseId: number): Observable<CourseSchedule[]> {
    return this.httpClient.get<CourseSchedule[]>(`${this.courseUrl}/${courseId}/schedule`);
  }

  addCourseSchedule(courseId: number, entry: Omit<CourseSchedule, 'id' | 'courseId' | 'courseName' | 'teacherName'>): Observable<any> {
    return this.httpClient.post<any>(`${this.courseUrl}/${courseId}/schedule`, entry);
  }

  deleteCourseSchedule(scheduleId: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.courseUrl}/schedule/${scheduleId}`);
  }
}
