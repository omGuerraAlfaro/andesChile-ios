import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonModal, AlertController } from '@ionic/angular';
import { firstValueFrom } from 'rxjs';
import { Browser } from '@capacitor/browser';

import { InfoApoderadoService } from 'src/app/services/apoderadoService/infoApoderado.service';
import { EstudianteService } from 'src/app/services/estudianteService/estudiante.service';
import { IEstudiante } from 'src/interfaces/apoderadoInterface';
import { WebpayService } from 'src/app/services/paymentService/webpay.service';

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

  // Modal para confirmar la solicitud del certificado.
  @ViewChild('modal', { static: true }) modal!: IonModal;
  // Modal para mostrar el detalle del carrito.
  @ViewChild('cartModal', { static: true }) cartModal!: IonModal;

  userData: IEstudiante[] = [];
  isDataLoaded: boolean = false;

  // Estudiante seleccionado en el modal.
  selectedStudent!: IEstudiante | null;

  // Tipo/nombre del certificado a agregar.
  certificateType: string = '';

  // Carrito de certificados.
  carrito: any[] = [];

  // Variables para Webpay.
  suma: number = 0;      // Se actualizará automáticamente a partir del carrito.

  constructor(
    private route: ActivatedRoute,
    private apoderadoService: InfoApoderadoService,
    private estudianteService: EstudianteService,
    private alertController: AlertController,
    private webpayService: WebpayService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const rut = params.get('id');
      if (rut) {
        this.apoderadoService.getInfoApoderado(rut).subscribe({
          next: (data: any) => {
            // Se asume que data.estudiantes es el arreglo de estudiantes.
            this.userData = data.estudiantes;
            this.isDataLoaded = true;
            console.log('Estudiantes:', this.userData);
          },
          error: (error) => {
            console.error('Error al obtener los datos del estudiante:', error);
          }
        });
      }
    });
  }

  /**
   * Abre el modal para confirmar la solicitud del certificado.
   * @param certificateType Tipo/nombre del certificado.
   */
  openCertificateModal(certificateType: string) {
    this.certificateType = certificateType;
    this.selectedStudent = null;
    this.modal.present();
  }

  /**
   * Cierra el modal sin realizar ninguna acción.
   */
  cancelModal() {
    this.modal.dismiss();
  }

  /**
   * Confirma la acción del modal: se valida la selección del estudiante, se verifica que 
   * el certificado no se haya agregado previamente al carrito y se arma el objeto que se agregará.
   */
  confirmModal() {
    // Si hay un solo estudiante, se selecciona automáticamente.
    if (this.userData.length === 1) {
      this.selectedStudent = this.userData[0];
    }
    // Si hay más de un estudiante, debe haber sido seleccionado.
    if (!this.selectedStudent) {
      console.log("Por favor, seleccione un estudiante");
      return;
    }

    // Verificar si el certificado ya se encuentra en el carrito.
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

    // Armamos el objeto que se agregará al carrito.
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

    // Se agrega el certificado al carrito.
    this.carrito.push(certificadoCarrito);
    console.log("Certificado agregado al carrito:", certificadoCarrito);
    // Actualizamos la suma del carrito.
    this.updateSumaCarrito();
    this.modal.dismiss();
  }

  /**
   * Abre el modal del carrito para ver el detalle de las selecciones.
   */
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

  /**
   * Elimina un certificado del carrito tras confirmar la acción.
   * @param item Elemento a eliminar.
   */
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
              // Actualizamos la suma luego de eliminar el elemento.
              this.updateSumaCarrito();
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Cierra el modal del carrito.
   */
  closeCart() {
    this.cartModal.dismiss();
  }

  /**
   * Procesa el pago a través de Webpay.
   */
  async pagarConWebpay(): Promise<void> {
    const rutApoderadoAmbiente = localStorage.getItem('rutAmbiente');
    const { v4: uuidv4 } = require('uuid');
    const uuid = uuidv4();
    const longitudDeseada = 4;
    const buyOrderId = `${rutApoderadoAmbiente}-${uuid.substring(0, longitudDeseada)}_CERTIFICADO}`;

    const data = {
      amount: this.suma,
      buyOrder: buyOrderId,
      sessionId: rutApoderadoAmbiente!.toString(),
      returnUrl: "https://www.colegioandeschile.cl/webpay-respuesta"
    };

    try {
      const response = await firstValueFrom<WebpayResponse>(this.webpayService.webpayCrearOrden(data));
      if (response) {
        console.log(response);
        // Abre el navegador con la URL de Webpay y el token correspondiente.
        await Browser.open({ url: `${response.url}?token_ws=${response.token}` });
        this.router.navigate(["/home"]);
      } else {
        console.error('No se recibió respuesta de la API de Webpay.');
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * Actualiza la suma total de los valores en el carrito.
   */
  updateSumaCarrito(): void {
    this.suma = this.carrito.reduce((acumulador: number, item: any) => acumulador + item.valor, 0);
    console.log("Suma total del carrito:", this.suma);
  }
}
