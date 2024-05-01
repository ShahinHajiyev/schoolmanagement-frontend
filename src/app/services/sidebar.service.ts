import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Menu } from '../interfaces/menu';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  constructor(private httpClient : HttpClient,
              private authService: AuthService) { }

  private baseURL = this.authService.apiURL;

  getMenus() : Observable<Menu[]>{
       return this.httpClient.get<Menu[]>(`${this.baseURL}/menu/menuItems`);
  }



}
