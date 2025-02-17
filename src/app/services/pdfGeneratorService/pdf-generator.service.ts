import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PdfgeneratorService {

  private apiUrl = `${environment.api}/pdf/generate`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
    responseType: 'blob' as 'json'
  };

  constructor(private http: HttpClient) { }

  getPdfAlumnoRegular(validationCode: string, data: any): Observable<Blob> {
    const params = new HttpParams().set('validationCode', validationCode);
  
    return this.http.post<Blob>(`${this.apiUrl}/alumno-regular`, data, { 
      params: params, 
      headers: this.httpOptions.headers, 
      responseType: 'blob' as 'json' 
    }).pipe(
      catchError(this.handleError)
    );
  }
  
  

  private handleError(error: any) {
    let errorMessage = 'An error occurred: ' + error.message;
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
