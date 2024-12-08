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
    const date = new Date(isoString);
    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, '0');
    const d = String(date.getUTCDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    const eventsForDay = this.eventMap.get(key);
    if (eventsForDay && eventsForDay.length > 0) {
      // Tomamos el primer evento del día para determinar el color
      const tipoEvento = eventsForDay[0].tipo.toLowerCase();

      switch (tipoEvento) {
        case 'evento':
          return { textColor: '#000000', backgroundColor: '#FFFF00' }; // Amarillo
        case 'clase':
          return { textColor: '#FFFFFF', backgroundColor: '#0000FF' }; // Azul
        case 'feriado':
          return { textColor: '#FFFFFF', backgroundColor: '#FF0000' }; // Rojo
        case 'Interferiado':
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
          const eventDate = new Date(evento.fecha);
          const y = eventDate.getUTCFullYear();
          const m = String(eventDate.getUTCMonth() + 1).padStart(2, '0');
          const d = String(eventDate.getUTCDate()).padStart(2, '0');
          const key = `${y}-${m}-${d}`;

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
    this.selectedDate = event.detail.value;
    this.filtrarEventosPorFecha(this.selectedDate);
  }

  filtrarEventosPorFecha(isoDateString: string) {
    if (!isoDateString) {
      this.eventosDelDia = [];
      return;
    }

    const selected = new Date(isoDateString);
    const y = selected.getUTCFullYear();
    const m = String(selected.getUTCMonth() + 1).padStart(2, '0');
    const d = String(selected.getUTCDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;

    this.eventosDelDia = this.eventMap.get(key) || [];
  }
}
