import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { InfoApoderadoService } from 'src/app/services/apoderadoService/infoApoderado.service';
import { EstudianteService } from 'src/app/services/estudianteService/estudiante.service';
import { IEstudiante } from 'src/interfaces/apoderadoInterface';


@Component({
  selector: 'app-user-historial-pagos',
  templateUrl: './user-historial-pagos.component.html',
  styleUrls: ['./user-historial-pagos.component.scss'],
})
export class UserHistorialPagosComponent implements OnInit {
  userData: any = { boletas: [] };
  isDataLoaded: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private apoderadoService: InfoApoderadoService,
    private estudianteService: EstudianteService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const rut = params.get('id');
      if (rut) {
        this.apoderadoService.getInfoBoletasHistorialApoderado(rut).subscribe({
          next: (data: any) => {
            this.userData.boletas = data;
            this.loadStudentDetails().then(() => {
              this.isDataLoaded = true;  // Marcar como cargado solo después de que todos los estudiantes hayan sido cargados
            });
          },
          error: (error) => {
            console.error('Error al obtener los datos del estudiante:', error);
          }
        });
      }
    });
  }

  async loadStudentDetails() {
    const requests = this.userData.boletas.map((boleta: any) => {
      if (boleta.boleta.rut_estudiante) {
        return this.estudianteService.getInfoEstudiante(boleta.boleta.rut_estudiante).toPromise().then(dataStudent => {
          boleta.estudiante = dataStudent; // Agregar datos del estudiante a la boleta
        }).catch((error:any) => {
          console.error(`Error al obtener datos del estudiante con RUT ${boleta.boleta.rut_estudiante}:`, error);
        });
      } else {
        return Promise.resolve();
      }
    });

    // Espera a que todas las solicitudes se completen
    await Promise.all(requests);
  }

  getFullName(estudiante: IEstudiante): string {
    if (estudiante) {
      return `${estudiante.primer_nombre_alumno} ${estudiante.segundo_nombre_alumno || ''} ${estudiante.primer_apellido_alumno} ${estudiante.segundo_apellido_alumno || ''}`.trim();
    }
    return '';
  }

  getCurso(estudiante: IEstudiante): string {
    return estudiante?.curso?.length ? estudiante.curso[0].nombre : 'Sin curso asignado';
  }
}
