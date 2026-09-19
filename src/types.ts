export type DoseStatus = 'pendiente' | 'tomada' | 'omitida' | 'atrasada';
export type DoseType = 'programada' | 'extra_manual';
export type SchedulePattern = 'hora_fija' | 'cada_x_horas' | 'dias_semana' | 'frecuencia_dias';
export type AppTab = 'dashboard' | 'recetas' | 'medicamentos' | 'pacientes' | 'doctores' | 'reportes';
export type MedicinePresentation = 
  | 'tabletas' 
  | 'capsulas' 
  | 'jarabe' 
  | 'inyeccion' 
  | 'gotas' 
  | 'inhalador' 
  | 'pomada' 
  | 'parche' 
  | 'supositorio'
  | 'sobre_polvo';

export type AdministrationRoute = 
  | 'oral' 
  | 'topica' 
  | 'inyectable' 
  | 'oftalmica' 
  | 'inhalatoria' 
  | 'sublingual' 
  | 'nasal' 
  | 'rectal';

export type UserRole = 'cuidador' | 'paciente' | 'clinica_admin' | 'enfermero';

export type NotificationSound = 
  | 'campana_zen' 
  | 'pulso_clinico' 
  | 'carillon_suave' 
  | 'melodia_alerta' 
  | 'bip_digital'
  | 'flauta_calma';

export interface Patient {
  id: string;
  nombre: string;
  fechaNacimiento: string; // YYYY-MM-DD
  sexo: 'M' | 'F' | 'Otro';
  fotoUrl?: string;
  alergias: string[];
  padecimientosCronicos: string[];
  contactoEmergencia: {
    nombre: string;
    telefono: string;
    parentesco: string;
  };
  cuidadorResponsable: string;
  tonoNotificacion: NotificationSound;
  habitacionOCama?: string; // Para modo clínica
  activo: boolean;
  creadoEn: string;
}

export interface Doctor {
  id: string;
  nombre: string;
  especialidad: string;
  cedula: string;
  telefono: string;
  correo: string;
  consultorio: string;
  activo: boolean;
  creadoEn: string;
}

export interface Medicine {
  id: string;
  nombreComercial: string;
  sustanciaActiva: string;
  presentacion: MedicinePresentation;
  concentracion: string; // ej. 500 mg, 10 mg/5 ml
  laboratorio?: string;
  codigoBarras?: string;
  stockActual: number;
  stockMinimoAlerta: number;
  unidadMedida: string; // comprimidos, ml, gotas, puff, etc.
  esFavorito?: boolean;
  instruccionesGenerales?: string;
  claveCBM?: string; // Clave del Cuadro Básico (ej. 010.000.0104.00)
  formaFarmaceutica?: string; // ej. Tableta, Suspensión oral
  grupoTerapeutico?: string; // ej. Cardiología
  origenCatalogo?: 'IMSS'; // Presente si viene del catálogo precargado
  activo: boolean;
  creadoEn: string;
}

export interface PrescriptionMedicineItem {
  id: string;
  medicamentoId: string;
  dosisCantidad: number; // ej. 1 tableta, 10 ml
  unidadDosis: string;
  viaAdministracion: AdministrationRoute;
  indicaciones: string; // ej. Con alimentos, En ayunas, etc.
  fechaInicio: string; // YYYY-MM-DD
  fechaFin?: string; // YYYY-MM-DD o vacio para indefinido
  duracionDias?: number; // Duración en días del tratamiento (ej. 5, 7, 10, 14 días)
  esIndefinido: boolean;
  patronHorario: SchedulePattern;
  // Configuración según el patrón:
  horasFijas?: string[]; // ["08:00", "14:00", "20:00"]
  intervaloHoras?: number; // cada 8 horas
  horaInicioIntervalo?: string; // "08:00"
  diasSemana?: number[]; // [1, 3, 5] donde 0 = Dom, 1 = Lun, etc.
  cadaNDias?: number; // ej. cada 2 dias (dia por medio), cada 3 dias
}

export interface Prescription {
  id: string;
  pacienteId: string;
  doctorId: string;
  fechaEmision: string; // YYYY-MM-DD
  diagnostico?: string;
  estado: 'activa' | 'completada' | 'archivada';
  archivoAdjuntoUrl?: string; // Receta escaneada o foto
  medicamentos: PrescriptionMedicineItem[];
  activo: boolean;
  creadoEn: string;
}

export interface DoseRecord {
  id: string;
  pacienteId: string;
  recetaId: string;
  prescripcionItemId: string;
  medicamentoId: string;
  fecha: string; // YYYY-MM-DD
  horaProgramada: string; // HH:mm
  horaReal?: string; // HH:mm:ss
  estado: DoseStatus;
  tipo: DoseType;
  motivoOmision?: string;
  observaciones?: string;
  registradoPor?: string;
  pospuestoHasta?: string; // HH:mm
  stockDescontado?: boolean;
}

export interface VitalSign {
  id: string;
  pacienteId: string;
  fecha?: string; // YYYY-MM-DD
  hora?: string; // HH:mm
  fechaHora?: string; // ISO string
  presionArterialSistolica?: number; // mmHg
  presionArterialDiastolica?: number; // mmHg
  presionSistolica?: number;
  presionDiastolica?: number;
  glucosaMgDl?: number; // mg/dL
  glucosa?: number;
  frecuenciaCardiaca?: number; // bpm
  temperatura?: number; // °C
  saturacionOxigeno?: number; // %
  pesoKg?: number; // kg
  observaciones?: string;
  notas?: string;
}

export interface DrugInteractionAlert {
  medicamentos: string[];
  sustancias: string[];
  nivelRiesgo: 'alto' | 'moderado' | 'leve';
  descripcion: string;
  recomendacion: string;
}

export interface DailySummaryStats {
  total: number;
  pendientes: number;
  tomadas: number;
  omitidas: number;
  adherenciaPorcentaje: number;
}
