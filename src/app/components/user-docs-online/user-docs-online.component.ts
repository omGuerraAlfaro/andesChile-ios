import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, AlertController, MenuController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Browser } from '@capacitor/browser';

import { InfoApoderadoService } from 'src/app/services/apoderadoService/infoApoderado.service';
import { EstudianteService } from 'src/app/services/estudianteService/estudiante.service';
import { IEstudiante } from 'src/interfaces/apoderadoInterface';
import { WebpayService } from 'src/app/services/paymentService/webpay.service';
import { CertificadosService } from 'src/app/services/certificadoService/certificados.service';
import { PdfgeneratorService } from 'src/app/services/pdfGeneratorService/pdf-generator.service';

interface WebpayResponse {
  url: string;
  token: string;
}

@Component({
  selector: 'app-user-docs-online',
  templateUrl: './user-docs-online.component.html',
  styleUrls: ['./user-docs-online.component.scss'],
})
export class UserDocsOnlineComponent implements OnInit {

  @ViewChild('modal', { static: true }) modal!: IonModal;
  @ViewChild('cartModal', { static: true }) cartModal!: IonModal;
  @ViewChild('availableModal', { static: true }) availableModal!: IonModal;

  userData: IEstudiante[] = [];
  isDataLoaded: boolean = false;
  selectedStudent!: IEstudiante | null;
  certificateType: string = '';
  carrito: any[] = [];
  suma: number = 0;

  // Propiedad para certificados disponibles (pagados)
  availableCertificates: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private apoderadoService: InfoApoderadoService,
    private estudianteService: EstudianteService,
    private alertController: AlertController,
    private webpayService: WebpayService,
    private certificadoService: CertificadosService,
    private pdfService: PdfgeneratorService,
    private router: Router,
    private menuCtrl: MenuController
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const rut = params.get('id');
      if (rut) {
        this.apoderadoService.getInfoApoderado(rut).subscribe({
          next: (data: any) => {
            this.userData = data.estudiantes;
            this.isDataLoaded = true;
            console.log('Estudiantes:', this.userData);
          },
          error: (error) => {
            console.error('Error al obtener los datos del estudiante:', error);
          }
        });

        // Se asigna la data a availableCertificates para mostrar certificados pagados
        this.certificadoService.getCertificadosPagados(rut).subscribe({
          next: (data: any) => {
            console.log('Certificados pagados:', data);
            this.availableCertificates = data;
          },
          error: (error) => {
            console.error('Error al obtener certificados pagados:', error);
          }
        });
      }
    });
  }

  openCertificateModal(certificateType: string) {
    this.certificateType = certificateType;
    this.selectedStudent = null;
    this.modal.present();
  }

  cancelModal() {
    this.modal.dismiss();
  }

  confirmModal() {
    if (this.userData.length === 1) {
      this.selectedStudent = this.userData[0];
    }
    if (!this.selectedStudent) {
      console.log("Por favor, seleccione un estudiante");
      return;
    }

    const exists = this.carrito.some(item =>
      item.numero_matricula === this.selectedStudent!.id && item.certificado === this.certificateType
    );
    if (exists) {
      this.alertController.create({
        header: 'Duplicado',
        message: 'El certificado ya está agregado en el carrito.',
        buttons: ['OK']
      }).then(alert => alert.present());
      return;
    }

    const certificadoCarrito = {
      numero_matricula: this.selectedStudent.id,
      primer_nombre_alumno: this.selectedStudent.primer_nombre_alumno,
      segundo_nombre_alumno: this.selectedStudent.segundo_nombre_alumno,
      primer_apellido_alumno: this.selectedStudent.primer_apellido_alumno,
      segundo_apellido_alumno: this.selectedStudent.segundo_apellido_alumno,
      rut: this.selectedStudent.rut,
      dv: this.selectedStudent.dv,
      certificado: this.certificateType,
      valor: 1000
    };

    this.carrito.push(certificadoCarrito);
    console.log("Certificado agregado al carrito:", certificadoCarrito);
    this.updateSumaCarrito();
    this.modal.dismiss();
  }

  openCart() {
    if (this.carrito.length === 0) {
      this.alertController.create({
        header: 'Carrito vacío',
        message: 'Selecciona los documentos que deseas solicitar.',
        buttons: ['OK']
      }).then(alert => alert.present());
      console.log("El carrito está vacío");
      return;
    }
    console.log("Abriendo carrito, contenido:", this.carrito);
    this.cartModal.present();
  }

  async deleteCertificate(item: any) {
    const alert = await this.alertController.create({
      header: 'Eliminar certificado',
      message: '¿Desea eliminar este certificado del carrito?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Eliminar',
          handler: () => {
            const index = this.carrito.indexOf(item);
            if (index > -1) {
              this.carrito.splice(index, 1);
              this.updateSumaCarrito();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async downloadCertificate(cert: any) {
    const alert = await this.alertController.create({
      header: 'Descargar certificado',
      message: '¿Desea descargar este certificado certificado?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Descargar',
          handler: () => {
            this.pdfService.getPdfAlumnoRegular(cert, {}).subscribe({
              next: (blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `certificado.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
          
                setTimeout(() => window.open(url, '_blank'), 100);
              },
              error: (error) => {
                console.error('Error al generar el PDF', error);
              }
            });
          }
        }
      ]
    });
    await alert.present();
  }

  closeCart() {
    this.cartModal.dismiss();
  }

  // Métodos para el modal de certificados disponibles
  openAvailableCertificates() {
    this.availableModal.present();
  }

  closeAvailableModal() {
    this.availableModal.dismiss();
  }

  /**
   * Función para generar un ID corto alfanumérico de la longitud especificada.
   * En este caso, se generarán IDs de 4 caracteres.
   */
  private generateShortId(length: number = 4): string {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Procesa el pago a través de Webpay generando un buyOrder que consiste en IDs cortos.
   */
  async pagarConWebpay(): Promise<void> {
    const { v4: uuidv4 } = require('uuid');

    // Generamos IDs únicos para cada certificado
    const uniqueIds = this.carrito.map(() => this.generateShortId(5));

    const buyOrder = uniqueIds.join('-');

    // Creamos los certificados con su propio uniqueIdPago
    const certificadosConUniqueId = await Promise.all(
      this.carrito.map(async (cert, index) => ({
        uniqueIdPago: uniqueIds[index],
        validationCode: uuidv4(),
        certificateType: cert.certificado,
        certificateNumber: cert.numero_matricula,
        primerNombreAlumno: cert.primer_nombre_alumno,
        segundoNombreAlumno: cert.segundo_nombre_alumno,
        primerApellidoAlumno: cert.primer_apellido_alumno,
        segundoApellidoAlumno: cert.segundo_apellido_alumno,
        curso: await this.getCursoEstudiante(cert.rut),
        rut: cert.rut,
        dv: cert.dv,
        rutApoderado: localStorage.getItem('rutAmbiente'),
        isErp: cert.isErp
      }))
    );

    // Enviamos cada certificado con su uniqueIdPago individual al servicio
    this.certificadoService.createCertificado(certificadosConUniqueId).subscribe({
      next: (response) => {
        console.log('Certificados insertados con éxito:', response);
        // Continuar con el proceso de pago o cualquier otra acción
      },
      error: (error) => {
        console.error('Error al insertar certificados:', error);
      }
    });

    const data = {
      amount: this.suma,
      buyOrder: buyOrder,
      sessionId: localStorage.getItem('rutAmbiente') || '',
      returnUrl: "https://www.colegioandeschile.cl/webpay-respuesta/certificado"
    };

    try {
      const response = await firstValueFrom<WebpayResponse>(this.webpayService.webpayCrearOrdenForCertificados(data));
      if (response) {
        console.log(response);
        await Browser.open({ url: `${response.url}?token_ws=${response.token}` });
        this.closeCart();
        this.router.navigate(["/home"]);
      } else {
        console.error('No se recibió respuesta de la API de Webpay.');
      }
    } catch (error) {
      console.error(error);
    }
  }

  updateSumaCarrito(): void {
    this.suma = this.carrito.reduce((acumulador: number, item: any) => acumulador + item.valor, 0);
    console.log("Suma total del carrito:", this.suma);
  }

  async getCursoEstudiante(rut: any): Promise<number | undefined> {
    try {
      const response = await firstValueFrom(this.estudianteService.getInfoEstudiante2(rut));

      if (response.curso && response.curso.length > 0) {
        return response.curso[0].id;
      } else {
        console.log(`No se encontró curso para el estudiante con RUT ${rut}`);
        return undefined;
      }
    } catch (error) {
      console.error('Error al obtener el curso:', error);
      return undefined;
    }
  }

  tieneCertificadoDisponible(certificadoNombre: string): boolean {
    const certificadosDisponibles = [
      'Certificado Alumno Regular',
      // 'Certificado de Matrícula',
      // 'Certificado de Notas',
      // 'Certificado de Anotaciones'
    ];
    return certificadosDisponibles.includes(certificadoNombre);
  }

}
