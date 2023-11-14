import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Course } from '../interfaces/course';

@Injectable({
  providedIn: 'root'
})
export class CourseService {

  constructor(private httpClient: HttpClient) { }

   private courseUrl = 'http://localhost:8090/api/course/getcourses';

   getCourses():Observable<Course[]>{
    return this.httpClient.get<Course[]>(`${this.courseUrl}`);
   }


}
