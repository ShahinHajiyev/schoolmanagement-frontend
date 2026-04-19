import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Enrollment } from '../interfaces/enrollment';
import { Gpa } from '../interfaces/gpa';
import { Student } from '../interfaces/student';
import { TranscriptItem } from '../interfaces/transcript-item';
import { environment } from 'src/environments/environment';

export interface PagedStudents {
  content: Student[];
  totalElements: number;
  totalPages: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  private baseUrl = `${environment.apiUrl}/student`;

  constructor(private http: HttpClient) {}

  getStudents(page = 0, size = 20): Observable<PagedStudents> {
    return this.http.get<PagedStudents>(`${this.baseUrl}?page=${page}&size=${size}`);
  }

  getStudentEnrollments(neptunCode: string): Observable<Enrollment[]> {
    return this.http.get<Enrollment[]>(`${this.baseUrl}/${neptunCode}/enrollments`);
  }

  getStudentGpa(neptunCode: string): Observable<Gpa> {
    return this.http.get<Gpa>(`${this.baseUrl}/${neptunCode}/gpa`);
  }

  getStudentTranscript(neptunCode: string): Observable<TranscriptItem[]> {
    return this.http.get<TranscriptItem[]>(`${this.baseUrl}/${neptunCode}/transcript`);
  }
}
