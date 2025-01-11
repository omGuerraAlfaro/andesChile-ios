export interface AlumnoInterface{
    id:string;
    rut: string;
    nombre: string;
    curso: string;
    
}


export interface AsistenciaResumen {
    estudianteId: number;
    nombreCompleto?: string;
    asistencias: number;
    inasistencias: number;
    totalidad: number;
    porcentajeAsistencia: number;
    porcentajeInasistencia: number;
    message?: string;
}
