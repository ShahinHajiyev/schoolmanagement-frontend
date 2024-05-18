import { HttpClient } from '@angular/common/http';
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

      public apiUrl = "http://localhost:8090/api/enrollment/testdropdown";
      
      getDropdown() : Observable<Testdropdown[]>{
        return this.httpClient.get<Testdropdown[]>(`${this.apiUrl}`);

      }

  

  

}
