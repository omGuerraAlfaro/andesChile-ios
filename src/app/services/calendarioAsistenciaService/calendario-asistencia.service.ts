import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AsistenciaResumen } from 'src/interfaces/alumnoInterface';

@Injectable({
  providedIn: 'root'
})
export class CalendarioAsistenciaService {

  private apiUrl = `${environment.api}/asistencia`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  constructor(private http: HttpClient) { }

  getAsistenciaResumen(
    semestreId: number,
    alumnoId: number,
    fechaHoy: string
  ): Observable<AsistenciaResumen> {
    return this.http.get<AsistenciaResumen>(
      `${this.apiUrl}/resumen/alumno/${semestreId}/${alumnoId}/${fechaHoy}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    let errorMessage = 'An error occurred: ' + error.message;
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
