import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Menu } from '../interfaces/menu';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {

  private baseUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getMenus(): Observable<Menu[]> {
    return this.httpClient.get<Menu[]>(`${this.baseUrl}/menu/menuItems`);
  }
}
