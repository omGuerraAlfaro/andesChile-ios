import { Component, OnInit } from '@angular/core';
import { CalendarioEscolarService } from 'src/app/services/calendarioService/calendario-escolar.service';
import { FechaCalendario } from 'src/interfaces/calendario.interface';

@Component({
  selector: 'app-user-calendario',
  templateUrl: './user-calendario.component.html',
  styleUrls: ['./user-calendario.component.scss']
})
export class UserCalendarioComponent implements OnInit {
  isLoading = true;
  eventos: FechaCalendario[] = [];
  eventMap = new Map<string, FechaCalendario[]>();
  selectedDate: string = '';
  eventosDelDia: FechaCalendario[] = [];

  // Callback para destacar días con eventos
  highlightedDates = (isoString: string) => {
    const key = isoString.split('T')[0]; // Extraemos solo la parte 'YYYY-MM-DD'

    const eventsForDay = this.eventMap.get(key);
    if (eventsForDay && eventsForDay.length > 0) {
      const tipoEvento = eventsForDay[0].tipo.toLowerCase();

      switch (tipoEvento) {
        case 'evento':
          return { textColor: '#000000', backgroundColor: '#FFFF00' }; // Amarillo
        case 'clase':
          return { textColor: '#FFFFFF', backgroundColor: '#0000FF' }; // Azul
        case 'feriado':
          return { textColor: '#FFFFFF', backgroundColor: '#FF0000' }; // Rojo
        case 'interferiado':
          return { textColor: '#FFFFFF', backgroundColor: '#FF0000' }; // Rojo
        default:
          return undefined;
      }
    }

    return undefined;
  }

  constructor(private calendarioService: CalendarioEscolarService) {}

  ngOnInit() {
    this.loadDates();
  }

  loadDates() {
    this.isLoading = true;
    this.calendarioService.getAllFechas().subscribe({
      next: (data: FechaCalendario[]) => {
        this.eventos = data;

        // Llenamos el mapa con las fechas como claves
        this.eventos.forEach(evento => {
          const key = evento.fecha; // Usamos directamente la fecha en formato ISO

          if (!this.eventMap.has(key)) {
            this.eventMap.set(key, []);
          }
          this.eventMap.get(key)?.push(evento);
        });
      },
      error: (error: any) => {
        console.error('Error al cargar las fechas:', error);
      },
      complete: () => {
        this.isLoading = false;
      },
    });
  }

  onDateChange(event: any) {
    this.selectedDate = event.detail.value.split('T')[0]; // Extraemos solo 'YYYY-MM-DD'
    this.filtrarEventosPorFecha(this.selectedDate);
  }

  filtrarEventosPorFecha(isoDateString: string) {
    if (!isoDateString) {
      this.eventosDelDia = [];
      return;
    }

    const key = isoDateString; // Usamos directamente la fecha como clave
    this.eventosDelDia = this.eventMap.get(key) || [];
  }
}
