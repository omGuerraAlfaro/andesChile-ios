export interface FechaCalendario {
    id_dia: number;          // Identificador único para cada día
    fecha: string;           // Fecha en formato ISO (YYYY-MM-DD)
    tipo: string;            // Tipo de evento (e.g., "Feriado", "Clase", "Evento")
    descripcion: string | null; // Descripción opcional del evento
  }
  