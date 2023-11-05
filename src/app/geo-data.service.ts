import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  private apiURL = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  getCounties(): Observable<string[]> {
    console.log(`${this.apiURL}/counties`);
    return this.http.get<string[]>(`${this.apiURL}/counties`);
  }

  getInstitutionsByCounty(county: string): Observable<string[]> {
    console.log(`${this.apiURL}/institutions/${county}`);
    return this.http.get<string[]>(`${this.apiURL}/institutions/${county}`);
  }
}
