import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserDto } from '../interfaces/user-dto';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ─── Users ───────────────────────────────────────────────────

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.apiUrl}/admin/users`);
  }

  addUser(neptunCode: string, email: string, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/addStudentByAdmin`, { neptunCode, email, selectedUser: role });
  }

  // ─── Courses ──────────────────────────────────────────────────

  addCourse(courseName: string, credit: number, teacherNeptunCode: string, semesterId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/addcourse`, { courseName, credit, teacherNeptunCode, semesterId });
  }

  deleteCourse(courseId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/admin/course/${courseId}`);
  }
}
