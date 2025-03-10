import { Component, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ToastController, MenuController, ModalController } from '@ionic/angular';
import { AuthService } from 'src/app/services/authService/auth.service';
import { ILoginResponse, IUser } from 'src/interfaces/login.interface';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  @ViewChild('popover') popover: any;
  isOpen = false;

  //para guardar el input vacío
  field!: string;
  //inicio sesion
  existe: any;

  user = {
    usuario: '',
    password: '',
  };

  userData!: IUser;
  passwordType: string = 'password';

  constructor(
    private router: Router,
    public toastController: ToastController,
    private auth: AuthService,
    private menuCtrl: MenuController,
    private modalController: ModalController
  ) { }

  ingresar(): void {
    if (!this.validateModel(this.user)) {
      this.presentToast('Falta ingresar ' + this.field, 3000);
      return;
    }

    // console.log("Iniciando sesión...");
    // console.log("Usuario:", this.user.usuario);
    // console.log("pass" , this.user.password)
    const user = this.user.usuario;
    const pass = this.user.password;
    this.auth.iniciarSesion(user, pass).subscribe({
      next: (loginData: ILoginResponse) => {
        if (loginData && loginData.token) {
          this.userData = loginData.user;
          console.log(this.userData);

          const { id, username, correo_electronico, rut } = this.userData;

          this.saveUserDataToLocalStorage(id.toString(), username, correo_electronico, rut, loginData.token);
          this.navigateToProfile(loginData.user);
        } else {
          this.presentToast('El usuario y/o contraseña son inválidos', 3000);
        }
        this.menuCtrl.enable(false);
        this.closeModal();
      },
      error: (error) => {
        this.closeModal();
        console.error("Error en el inicio de sesión:", error);
        this.presentToast('Error al intentar iniciar sesión. Inténtalo de nuevo.', 3000);
      }
    });
  }

  private saveUserDataToLocalStorage(id_user: string, name_user: string, email_user: string, rut: string, token: string): void {
    localStorage.setItem('ingresado', 'true');
    localStorage.setItem('usuario', name_user);
    localStorage.setItem('id_user', id_user);
    // localStorage.setItem('username', name_user);
    localStorage.setItem('email', email_user);
    localStorage.setItem('rutAmbiente', rut);
    localStorage.setItem('token', token);
  }

  private navigateToProfile(data: any): void {
    const navigationExtras: NavigationExtras = {
      state: {
        user: data
      }
    };
    this.router.navigate(['/home/profile'], navigationExtras);
  }



  recuperar() {
    this.router.navigate(['/resetpassword']);
  }

  validateModel(model: any) {
    //recorro todas las entradas que me entrega el Object entries y obtengo
    //su clave-valor
    for (const [key, value] of Object.entries(model)) {
      //verifico campo vacío
      if (value === '') {
        this.field = key;
        return false;
      }
    }
    return true;
  }

  async closeModal() {
    const modal = await this.modalController.getTop();
    if (modal) {
      await modal.dismiss();
    }
  }

  //toast
  async presentToast(msg: string, duracion?: number) {
    const toast = await this.toastController.create({
      message: msg,
      duration: duracion ? duracion : 2000,
      position: 'top'
    });
    toast.present();
  }

  presentPopover(e: Event) {
    this.popover.event = e;
    this.isOpen = true;
  }

  togglePasswordVisibility() {
    this.passwordType = this.passwordType === 'password' ? 'text' : 'password';
  }
}
