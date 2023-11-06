import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constants } from 'src/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class GeoDataService {
  private apiURL = 'http://localhost:3000/api';
  private counties = Constants.COUNTIES;

  constructor(private http: HttpClient) {}

  getCounties(): string[] {
    return this.counties;
  }

  getInstitutionsByCounty(county: string): Observable<string[]> {
    console.log(`${this.apiURL}/institutions/${county}`);
    return this.http.get<string[]>(`${this.apiURL}/institutions/${county}`);
  }
}
