export interface IAnotaciones{
    id: number;
    anotacion_titulo: string;
    anotacion_descripcion: string;
    fecha_ingreso: Date;
    es_positiva: boolean;
    es_negativa: boolean;
    anotacion_estado: boolean;
}