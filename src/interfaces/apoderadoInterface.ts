import { BoletaDetalle } from "./boletaInterface";

export interface IApoderado {
    id: number;
    primer_nombre: string;
    segundo_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    fecha_nacimiento: Date;
    rut: string;
    dv: string;
    telefono: string;
    correo_electronico: string;
    estado_civil: string;
    nacionalidad: string;
    actividad: string;
    escolaridad: string;
    descuento_asignado: number;
    estudiantes: IEstudiante[];
}


export interface IEstudiante {
    id: number;
    primer_nombre_alumno: string;
    segundo_nombre_alumno: string;
    primer_apellido_alumno: string;
    segundo_apellido_alumno: string;
    fecha_nacimiento_alumno: Date;
    rut: string;
    dv: string;
    telefono_contacto: string;
    genero_alumno: string;
    alergico: string;
    vive_con: string;
    enfermedad_cronica: string;
    apoderado_id: number;
    curso_id: number;
    apoderado: IApoderado;
    curso: ICurso[];
}

export interface ICurso {
    id: number;
    nombre: string;
    nivel_grado: string;
    descripcion: string;
}

export interface EstudianteConBoletas {
    estudiante: IEstudiante;
    boletas: BoletaDetalle[];
    curso: ICurso[];
}


export interface IApoderadoAlone {
    id: number;
    primer_nombre_apoderado: string;
    segundo_nombre_apoderado: string;
    primer_apellido_apoderado: string;
    segundo_apellido_apoderado: string;
    fecha_nacimiento: Date;
    telefono_apoderado: string;
    correo_apoderado: string;
    estado_civil: string;
    nacionalidad: string;
    profesion_oficio: string;
    escolaridad: string;
    rut: string;
    dv: string;
}