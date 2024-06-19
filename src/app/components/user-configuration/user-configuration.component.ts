import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonModal } from '@ionic/angular';
import { InfoApoderadoService } from 'src/app/services/apoderadoService/infoApoderado.service';
import { IApoderado } from 'src/interfaces/apoderadoInterface';
import { OverlayEventDetail } from '@ionic/core/components';

@Component({
  selector: 'app-user-configuration',
  templateUrl: './user-configuration.component.html',
  styleUrls: ['./user-configuration.component.scss'],
})
export class UserConfigurationComponent implements OnInit {
  @ViewChild('editModal') editModal!: IonModal;
  @ViewChild('passwordModal') passwordModal!: IonModal;

  userData: IApoderado | undefined;
  editData: IApoderado | undefined;
  newPassword: string = '';
  confirmPasswordInput: string = '';

  constructor(
    private route: ActivatedRoute,
    private apoderadoService: InfoApoderadoService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const rut = params.get('id');
      if (rut) {
        this.apoderadoService.getInfoApoderado(rut).subscribe({
          next: (dataUser: IApoderado) => {
            this.userData = dataUser;
            this.editData = { ...this.userData }; // Clonar datos para editar
            console.log(this.userData);
          },
          error: (error) => {
            console.error('Error al obtener los datos del estudiante:', error);
          }
        });
      }
    });
  }

  openEditModal() {
    this.editModal.present();
  }

  openPasswordModal() {
    this.passwordModal.present();
  }

  cancelEdit() {
    this.editModal.dismiss(null, 'cancel');
  }

  confirmEdit() {
    this.editModal.dismiss(this.editData, 'confirm');
  }

  cancelPassword() {
    this.passwordModal.dismiss(null, 'cancel');
  }

  confirmPassword() {
    if (this.newPassword !== this.confirmPasswordInput) {
      console.error('Las contraseñas no coinciden');
      return;
    }
    this.passwordModal.dismiss({
      newPassword: this.newPassword,
      confirmPassword: this.confirmPasswordInput
    }, 'confirm');
  }

  onWillDismiss(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<IApoderado>>;
    if (ev.detail.role === 'confirm' && ev.detail.data) {
      this.userData = ev.detail.data;
      // Aquí puedes realizar la lógica para enviar los datos al endpoint PUT
      console.log('Datos actualizados:', this.userData);
      // this.apoderadoService.updateInfoApoderado(this.userData).subscribe(response => {
      //   console.log('Datos guardados correctamente:', response);
      // }, error => {
      //   console.error('Error al guardar los datos:', error);
      // });
    }
  }

  onWillDismissPassword(event: Event) {
    const ev = event as CustomEvent<OverlayEventDetail<{ newPassword: string, confirmPassword: string }>>;
    if (ev.detail.role === 'confirm' && ev.detail.data) {
      if (ev.detail.data.newPassword === ev.detail.data.confirmPassword) {
        // Lógica para enviar la nueva contraseña al servidor
        console.log('Nueva contraseña:', ev.detail.data.newPassword);
        // this.apoderadoService.updatePassword(this.userData?.rut, ev.detail.data.newPassword).subscribe(response => {
        //   console.log('Contraseña actualizada correctamente:', response);
        // }, error => {
        //   console.error('Error al actualizar la contraseña:', error);
        // });
      } else {
        console.error('Las contraseñas no coinciden');
        // Aquí puedes agregar lógica para mostrar un mensaje de error al usuario
      }
    }
  }
}
