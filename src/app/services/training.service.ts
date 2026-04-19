import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Training } from '../interfaces/training';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  private baseUrl = `${environment.apiUrl}/training`;

  constructor(private http: HttpClient) {}

  getMyTraining(): Observable<Training> {
    return this.http.get<Training>(`${this.baseUrl}/my`);
  }

  getAllTrainings(): Observable<Training[]> {
    return this.http.get<Training[]>(`${this.baseUrl}/all`);
  }
}
