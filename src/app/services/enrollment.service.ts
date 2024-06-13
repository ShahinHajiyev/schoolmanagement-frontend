import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Testdropdown } from '../interfaces/testdropdown';

@Injectable({
  providedIn: 'root'
})
export class EnrollmentService {

  

  constructor(private router : Router,
              private httpClient: HttpClient) {
     
              }

      public apiUrl = "http://localhost:8090/api/enrollment";

      registerCourse(courseId:  number, neptunCode: string): Observable<any>{
        return this.httpClient.post<any>(`${this.apiUrl}/addenrollment`,{courseId, neptunCode})

      }

  

  

}
