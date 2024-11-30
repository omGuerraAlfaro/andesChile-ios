import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfigurationPageRoutingModule } from './configuration-routing.module';

import { ConfigurationPage } from './configuration.page';
import { UserConfigurationComponent } from 'src/app/components/user-configuration/user-configuration.component';
import { UserHistorialPagosComponent } from 'src/app/components/user-historial-pagos/user-historial-pagos.component';
import { UserCalendarioComponent } from 'src/app/components/user-calendario/user-calendario.component';
import { CalendarModule } from 'ion2-calendar';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfigurationPageRoutingModule,
    CalendarModule,
    FormsModule
  ],
  declarations: [ConfigurationPage, UserConfigurationComponent, UserHistorialPagosComponent, UserCalendarioComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ConfigurationPageModule {}
