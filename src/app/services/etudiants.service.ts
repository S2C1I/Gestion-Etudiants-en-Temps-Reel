import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EtudiantsService {

  private apiUrl = `${environment.apiUrl}/etudiants`;

  constructor(private http: HttpClient) { }

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getEtudiants(page: number, limit: number, search: string = ''): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<any>(this.apiUrl, { params, headers: this.getHeaders() });
  }

  getEtudiantById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  createEtudiant(etudiant: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, etudiant, { headers: this.getHeaders() });
  }

  updateEtudiant(id: number, etudiant: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, etudiant, { headers: this.getHeaders() });
  }

  deleteEtudiant(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getTotalEtudiants(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/total`, { headers: this.getHeaders() });
  }

}
