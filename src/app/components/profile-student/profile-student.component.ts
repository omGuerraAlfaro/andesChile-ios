import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, MenuController, IonModal, ModalController } from '@ionic/angular';
import { EstudianteService } from 'src/app/services/estudianteService/estudiante.service';
import { CalendarioAsistenciaService } from 'src/app/services/calendarioAsistenciaService/calendario-asistencia.service';
import { IAnotaciones } from 'src/interfaces/AnotacionInterface';
import { IEstudiante } from 'src/interfaces/apoderadoInterface';

@Component({
  selector: 'app-profile-student',
  templateUrl: './profile-student.component.html',
  styleUrls: ['./profile-student.component.scss'],
})
export class ProfileStudentComponent implements OnInit {
  @ViewChild('popover') popover: any;
  @ViewChild('modal', { static: true }) modal!: IonModal;
  @ViewChild('detailModal', { static: true }) detailModal!: IonModal;

  isOpen = false;
  public attendanceData: number[] = []; // Datos del gráfico
  public chartTitle: string = 'Porcentaje de Asistencia'; // Título del gráfico
  presentingElement: Element | null = null;

  student: IEstudiante | null = null;
  anotaciones: IAnotaciones[] = [];
  selectedAnotacion: IAnotaciones | null = null;

  public showMessage: boolean = false; // Controla si se muestra el mensaje en lugar del gráfico
  public attendanceMessage: string = ''; // Mensaje recibido


  constructor(
    private route: ActivatedRoute,
    private estudianteService: EstudianteService,
    private calendarioAsistenciaService: CalendarioAsistenciaService, // Nuevo servicio para asistencia
    private menuCtrl: MenuController,
    public alertController: AlertController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const rut = params.get('id');
      if (rut) {
        this.estudianteService.getInfoEstudiante(rut).subscribe({
          next: (dataStudent: IEstudiante) => {
            console.log(dataStudent);

            this.student = dataStudent;
            // Llamar al método para obtener los datos de asistencia
            if (this.student && this.student.id) {
              this.getAttendanceData(1, dataStudent.id);
            }
          },
          error: (error) => {
            console.error('Error al obtener los datos del estudiante:', error);
          }
        });
      }
    });
    this.menuCtrl.enable(true);
    this.presentingElement = document.querySelector('.ion-page');
  }

  getAttendanceData(semestreId: number, idEstudiante: number) {
    const fechaHoy = new Date().toISOString().split('T')[0];
  
    this.calendarioAsistenciaService.getAsistenciaResumen(semestreId, idEstudiante, fechaHoy).subscribe({
      next: (data: { porcentajeAsistencia?: number; porcentajeInasistencia?: number; message?: string }) => {
        if (data.message) {
          console.warn('Mensaje recibido:', data.message);
          this.showMessage = true;
          this.attendanceMessage = data.message;
          this.attendanceData = [];
        } else {
          this.showMessage = false;
          this.attendanceData = [
            data.porcentajeAsistencia || 0,
            data.porcentajeInasistencia || 0
          ];
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos de asistencia:', error);
      }
    });
  }
  
  getAnotacionesEstudiante(id: any): void {
    this.estudianteService.getAnotacionesEstudiante(id).subscribe({
      next: (dataAnotaciones: IAnotaciones[]) => {
        this.anotaciones = dataAnotaciones;
      },
      error: (error) => {
        console.error('Error al obtener las anotaciones del estudiante:', error);
      }
    });
  }

  openModalAnotaciones() {
    if (this.student) {
      this.getAnotacionesEstudiante(this.student.id);
    }
    this.modal.present();
  }

  closeModal() {
    this.modal.dismiss();
  }

  openDetailModal(anotacion: IAnotaciones) {
    this.selectedAnotacion = anotacion;
    this.detailModal.present();
  }

  closeDetailModal() {
    this.detailModal.dismiss();
    this.selectedAnotacion = null;
  }

  working() {
    this.presentAlertWorking("Funcionalidad en Desarrollo", "Disculpa las molestias pero pronto habilitaremos esta funcionalidad.");
  }

  async presentAlertWorking(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: [
        {
          text: 'Okay',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            console.log('Alert OK');
          },
        },
      ],
    });

    await alert.present();
  }
}
