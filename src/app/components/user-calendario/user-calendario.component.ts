import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InfoApoderadoService } from 'src/app/services/apoderadoService/infoApoderado.service';

@Component({
  selector: 'app-user-calendario',
  templateUrl: './user-calendario.component.html',
  styleUrls: ['./user-calendario.component.scss'],
})
export class UserCalendarioComponent implements OnInit {

  constructor(
    private route: ActivatedRoute,
    private apoderadoService: InfoApoderadoService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const rut = params.get('id');
      if (rut) {
        this.apoderadoService.getInfoBoletasHistorialApoderado(rut).subscribe({
          next: (data: any) => {
            // this.userData.boletas = data;
            // this.loadStudentDetails().then(() => {
            //   this.isDataLoaded = true;  // Marcar como cargado solo después de que todos los estudiantes hayan sido cargados
            // });
          },
          error: (error) => {
            console.error('Error al obtener los datos del estudiante:', error);
          }
        });
      }
    });
  }

}
