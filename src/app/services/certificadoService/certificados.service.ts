import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CertificadosService {

  private apiUrl = `${environment.api}/pdf-validador`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private http: HttpClient) { }

  getCertificadosPagados(rut: string): Observable<any> {
    return this.http.get<any[]>(`${this.apiUrl}/rut/${rut}`, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  createCertificado(data: any): Observable<any> {
    console.log(data);

    return this.http.post<any>(`${this.apiUrl}/crear`, JSON.stringify(data), this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  downloadCertificado(data: any): Observable<Blob> {
    return this.http.post<Blob>(`${environment.api}/pdf/generate`, data, this.httpOptions)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Manejo de errores para las solicitudes HTTP.
   * @param error Error de la solicitud HTTP.
   * @returns Observable con el error.
   */
  private handleError(error: any) {
    let errorMessage = 'An error occurred: ' + error.message;
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
