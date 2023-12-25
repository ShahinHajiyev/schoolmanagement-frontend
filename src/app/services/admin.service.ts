import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  public apiURL : any = this.authService.apiURL;

  constructor(private http: HttpClient,
              private authService: AuthService) { }

addStudent(neptunCode: string, email: string): Observable<any>{
   return this.http.post<any>(`${this.apiURL}/admin/addStudentByAdmin`, {neptunCode, email});
}


}


