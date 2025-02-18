import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions } from '@capacitor/core';
import { catchError, from, map, Observable, tap, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class PdfgeneratorService {

  private apiUrl = `${environment.api}/pdf/generate`;

  constructor(private http: HttpClient) { }

  getPdfAlumnoRegular(validationCode: string, data: any): Observable<Blob> {
    // Ajusta la URL a la ruta real de tu backend
    const url = `${this.apiUrl}/alumno-regular/app?validationCode=${validationCode}`;

    const options: HttpOptions = {
      url,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
      },
      data,               // El body que quieras enviar
      responseType: 'arraybuffer', // Importante para recibir binario
    };

    // Usamos CapacitorHttp.request(...) y lo convertimos a un Observable con 'from'
    return from(CapacitorHttp.request(options)).pipe(
      map((response: any) => {
        // Por lo general, 'response.data' viene como un string base64.
        // Lo convertimos a ArrayBuffer y luego creamos un Blob.
        const arrayBuffer = this.base64ToArrayBuffer(response.data);
        const pdfBlob = new Blob([arrayBuffer], { type: 'application/pdf' });
        return pdfBlob;
      })
    );
  }

  /**
   * Convierte una cadena base64 a ArrayBuffer.
   */
  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }




  private handleError(error: any) {
    let errorMessage = 'An error occurred: ' + error.message;
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
