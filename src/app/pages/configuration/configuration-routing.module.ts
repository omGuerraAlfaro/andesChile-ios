import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfigurationPage } from './configuration.page';
import { UserConfigurationComponent } from 'src/app/components/user-configuration/user-configuration.component';
import { UserHistorialPagosComponent } from 'src/app/components/user-historial-pagos/user-historial-pagos.component';
import { UserCalendarioComponent } from 'src/app/components/user-calendario/user-calendario.component';

const routes: Routes = [
  {
    path: '',
    component: ConfigurationPage,
    children: [
      {
        path: 'user/:id',
        component: UserConfigurationComponent,
      },
      {
        path: 'user/historial-pagos/:id',
        component: UserHistorialPagosComponent,
      },
      {
        path: 'user/calendario-escolar/:id',
        component: UserCalendarioComponent,
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfigurationPageRoutingModule {}
