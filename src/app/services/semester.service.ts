import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Semester } from '../interfaces/semester';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SemesterService {

  private baseUrl = `${environment.apiUrl}/semester`;

  constructor(private http: HttpClient) {}

  getSemesters(): Observable<Semester[]> {
    return this.http.get<Semester[]>(`${this.baseUrl}/getsemesters`);
  }
}
