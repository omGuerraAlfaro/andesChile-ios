import { Component, OnInit } from '@angular/core';
import { CalendarComponentOptions, DayConfig } from 'ion2-calendar';
import { CalendarioEscolarService } from 'src/app/services/calendarioService/calendario-escolar.service';
import { FechaCalendario } from 'src/interfaces/calendario.interface';

@Component({
  selector: 'app-user-calendario',
  templateUrl: './user-calendario.component.html',
  styleUrls: ['./user-calendario.component.scss'],
})
export class UserCalendarioComponent implements OnInit {
  date!: string; // Fecha seleccionada
  daysConfig: DayConfig[] = []; // Configuración de días
  options!: CalendarComponentOptions;

  constructor(private calendarioService: CalendarioEscolarService) {}

  ngOnInit() {
    // Llama al método para cargar las fechas desde el backend
    this.loadDates();
  }

  loadDates() {
    this.calendarioService.getAllFechas().subscribe({
      next: (data: FechaCalendario[]) => {
        console.log('Datos del endpoint:', data);
  
        // Transforma los datos del endpoint al formato `daysConfig`
        this.daysConfig = data.map((fecha) => ({
          date: new Date(fecha.fecha), // Convierte la fecha al formato `Date`
          marked: true, // Indica que está marcado
          cssClass: this.getCssClassByTipo(fecha.tipo), // Clase CSS según el tipo
          subTitle: fecha.descripcion ?? 'Sin descripción', // Maneja el caso de `null`
        }));
  
        // Configura las opciones del calendario
        this.options = {
          daysConfig: this.daysConfig,
        };
  
        console.log('Configuración de días:', this.daysConfig);
      },
      error: (error) => {
        console.error('Error al cargar las fechas del endpoint:', error);
      },
    });
  }
  

  getCssClassByTipo(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'feriado':
        return 'feriado-day'; // Clase CSS personalizada
      case 'clase':
        return 'class-day'; // Clase CSS personalizada
      default:
        return 'default-day';
    }
  }
}
