import { Patient, Doctor, Medicine, Prescription, DoseRecord, VitalSign } from '../types';

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pat-1',
    nombre: 'Don Roberto Garza Morales',
    fechaNacimiento: '1948-04-12', // 78 años
    sexo: 'M',
    fotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    alergias: ['Penicilina', 'Sulfitos'],
    padecimientosCronicos: ['Hipertensión Arterial', 'Diabetes Tipo 2', 'Artrosis'],
    contactoEmergencia: {
      nombre: 'Sofía Garza (Hija)',
      telefono: '+52 81 1234 5678',
      parentesco: 'Hija'
    },
    cuidadorResponsable: 'Elena Martínez (Enfermera / Cuidadora)',
    tonoNotificacion: 'carillon_suave',
    habitacionOCama: 'Habitación 204-A',
    activo: true,
    creadoEn: '2026-01-10T08:00:00Z'
  },
  {
    id: 'pat-2',
    nombre: 'Doña Carmen Mendoza Solís',
    fechaNacimiento: '1953-09-22', // 72 años
    sexo: 'F',
    fotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    alergias: ['AINES (Ibuprofeno)', 'Aspirina'],
    padecimientosCronicos: ['Insuficiencia Cardíaca Leve', 'Osteoporosis'],
    contactoEmergencia: {
      nombre: 'Carlos Mendoza (Hijo)',
      telefono: '+52 55 9876 5432',
      parentesco: 'Hijo'
    },
    cuidadorResponsable: 'María Mendoza (Familiar)',
    tonoNotificacion: 'campana_zen',
    habitacionOCama: 'Habitación 108',
    activo: true,
    creadoEn: '2026-01-15T09:30:00Z'
  },
  {
    id: 'pat-3',
    nombre: 'Mateo Hernández Vega',
    fechaNacimiento: '2016-11-05', // 9 años
    sexo: 'M',
    fotoUrl: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
    alergias: ['Amoxicilina'],
    padecimientosCronicos: ['Asma Bronquial'],
    contactoEmergencia: {
      nombre: 'Lucía Vega (Madre)',
      telefono: '+52 33 2211 4433',
      parentesco: 'Madre'
    },
    cuidadorResponsable: 'Lucía Vega',
    tonoNotificacion: 'melodia_alerta',
    activo: true,
    creadoEn: '2026-02-01T11:00:00Z'
  }
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    nombre: 'Dra. Patricia Valenzuela Ramos',
    especialidad: 'Cardiología y Medicina Interna',
    cedula: 'CP-8921345',
    telefono: '+52 81 8345 6789',
    correo: 'dra.valenzuela@centromedicodelvalle.com',
    consultorio: 'Hospital San José, Consultorio 412',
    activo: true,
    creadoEn: '2026-01-05T08:00:00Z'
  },
  {
    id: 'doc-2',
    nombre: 'Dr. Alejandro Ríos Fuentes',
    especialidad: 'Endocrinología y Diabetes',
    cedula: 'CP-4390123',
    telefono: '+52 81 8122 3344',
    correo: 'dr.rios@endocrinologia.mx',
    consultorio: 'Centro Médico Christus, Módulo B-12',
    activo: true,
    creadoEn: '2026-01-08T10:00:00Z'
  },
  {
    id: 'doc-3',
    nombre: 'Dra. Gabriela Castro Méndez',
    especialidad: 'Geriatría Integral',
    cedula: 'CP-7612984',
    telefono: '+52 55 5566 7788',
    correo: 'dra.castro@geriatriamx.com',
    consultorio: 'Clínica de la Tercera Edad, Piso 3',
    activo: true,
    creadoEn: '2026-01-12T12:00:00Z'
  }
];

export const INITIAL_MEDICINES: Medicine[] = [
  {
    id: 'med-1',
    nombreComercial: 'Losartán Potásico',
    sustanciaActiva: 'Losartán',
    presentacion: 'tabletas',
    concentracion: '50 mg',
    laboratorio: 'Laboratorios Silanes',
    codigoBarras: '7501234567890',
    stockActual: 28,
    stockMinimoAlerta: 10,
    unidadMedida: 'comprimidos',
    esFavorito: true,
    instruccionesGenerales: 'Tomar por la mañana con o sin alimentos.',
    activo: true,
    creadoEn: '2026-01-05T08:00:00Z'
  },
  {
    id: 'med-2',
    nombreComercial: 'Metformina LP',
    sustanciaActiva: 'Metformina Clorhidrato',
    presentacion: 'tabletas',
    concentracion: '850 mg',
    laboratorio: 'Merck Healthcare',
    codigoBarras: '7509876543210',
    stockActual: 18,
    stockMinimoAlerta: 12,
    unidadMedida: 'tabletas',
    esFavorito: true,
    instruccionesGenerales: 'Tomar junto con la comida principal para evitar molestias estomacales.',
    activo: true,
    creadoEn: '2026-01-05T08:00:00Z'
  },
  {
    id: 'med-3',
    nombreComercial: 'Atorvastatina',
    sustanciaActiva: 'Atorvastatina Cálcica',
    presentacion: 'tabletas',
    concentracion: '20 mg',
    laboratorio: 'Pfizer',
    codigoBarras: '7504567890123',
    stockActual: 8, // Stock bajo para alerta
    stockMinimoAlerta: 10,
    unidadMedida: 'tabletas',
    esFavorito: true,
    instruccionesGenerales: 'Tomar por la noche antes de dormir.',
    activo: true,
    creadoEn: '2026-01-05T08:00:00Z'
  },
  {
    id: 'med-4',
    nombreComercial: 'Paracetamol',
    sustanciaActiva: 'Paracetamol',
    presentacion: 'tabletas',
    concentracion: '500 mg',
    laboratorio: 'Genéricos Pisa',
    codigoBarras: '7503216549870',
    stockActual: 40,
    stockMinimoAlerta: 15,
    unidadMedida: 'tabletas',
    esFavorito: true,
    instruccionesGenerales: 'Para dolor articular o malestar general según horario.',
    activo: true,
    creadoEn: '2026-01-05T08:00:00Z'
  },
  {
    id: 'med-5',
    nombreComercial: 'Salbutamol Aerosol',
    sustanciaActiva: 'Salbutamol Sulfato',
    presentacion: 'inhalador',
    concentracion: '100 mcg / dosis',
    laboratorio: 'GlaxoSmithKline',
    codigoBarras: '7507891234560',
    stockActual: 120,
    stockMinimoAlerta: 30,
    unidadMedida: 'inhalaciones (puff)',
    esFavorito: false,
    instruccionesGenerales: 'Usar espaciador e inhalar profundamente. Enjuagar boca después del uso.',
    activo: true,
    creadoEn: '2026-02-01T10:00:00Z'
  },
  {
    id: 'med-6',
    nombreComercial: 'Omeprazol',
    sustanciaActiva: 'Omeprazol',
    presentacion: 'capsulas',
    concentracion: '20 mg',
    laboratorio: 'AstraZeneca',
    codigoBarras: '7501122334455',
    stockActual: 14,
    stockMinimoAlerta: 8,
    unidadMedida: 'cápsulas',
    esFavorito: true,
    instruccionesGenerales: 'Tomar en ayunas con medio vaso de agua, 30 min antes del desayuno.',
    activo: true,
    creadoEn: '2026-01-05T08:00:00Z'
  }
];

export const INITIAL_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rec-1',
    pacienteId: 'pat-1',
    doctorId: 'doc-1',
    fechaEmision: '2026-02-15',
    diagnostico: 'Hipertensión grado 2 y control metabólico',
    estado: 'activa',
    archivoAdjuntoUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    activo: true,
    creadoEn: '2026-02-15T10:00:00Z',
    medicamentos: [
      {
        id: 'rec-med-1',
        medicamentoId: 'med-1', // Losartan
        dosisCantidad: 1,
        unidadDosis: 'tableta',
        viaAdministracion: 'oral',
        indicaciones: 'Tomar a primera hora de la mañana con agua.',
        fechaInicio: '2026-02-15',
        esIndefinido: true,
        patronHorario: 'hora_fija',
        horasFijas: ['08:00']
      },
      {
        id: 'rec-med-2',
        medicamentoId: 'med-2', // Metformina
        dosisCantidad: 1,
        unidadDosis: 'tableta',
        viaAdministracion: 'oral',
        indicaciones: 'Junto con los alimentos para proteger mucosa.',
        fechaInicio: '2026-02-15',
        esIndefinido: true,
        patronHorario: 'hora_fija',
        horasFijas: ['08:30', '14:30', '20:30']
      },
      {
        id: 'rec-med-3',
        medicamentoId: 'med-3', // Atorvastatina
        dosisCantidad: 1,
        unidadDosis: 'tableta',
        viaAdministracion: 'oral',
        indicaciones: 'Por la noche antes de acostarse.',
        fechaInicio: '2026-02-15',
        esIndefinido: true,
        patronHorario: 'hora_fija',
        horasFijas: ['22:00']
      },
      {
        id: 'rec-med-4',
        medicamentoId: 'med-6', // Omeprazol
        dosisCantidad: 1,
        unidadDosis: 'cápsula',
        viaAdministracion: 'oral',
        indicaciones: 'En ayunas estricto, 30 minutos antes del desayuno.',
        fechaInicio: '2026-02-15',
        esIndefinido: false,
        fechaFin: '2026-10-30',
        patronHorario: 'hora_fija',
        horasFijas: ['07:30']
      }
    ]
  },
  {
    id: 'rec-2',
    pacienteId: 'pat-2',
    doctorId: 'doc-3',
    fechaEmision: '2026-02-20',
    diagnostico: 'Artralgia degenerativa y prevención cardiovascular',
    estado: 'activa',
    activo: true,
    creadoEn: '2026-02-20T11:00:00Z',
    medicamentos: [
      {
        id: 'rec-med-5',
        medicamentoId: 'med-4', // Paracetamol
        dosisCantidad: 1,
        unidadDosis: 'tableta',
        viaAdministracion: 'oral',
        indicaciones: 'Cada 8 horas con un vaso con agua.',
        fechaInicio: '2026-02-20',
        esIndefinido: false,
        fechaFin: '2026-09-30',
        patronHorario: 'cada_x_horas',
        intervaloHoras: 8,
        horaInicioIntervalo: '08:00'
      }
    ]
  },
  {
    id: 'rec-3',
    pacienteId: 'pat-3',
    doctorId: 'doc-1',
    fechaEmision: '2026-03-01',
    diagnostico: 'Hiperreactividad bronquial en días escolares',
    estado: 'activa',
    activo: true,
    creadoEn: '2026-03-01T09:00:00Z',
    medicamentos: [
      {
        id: 'rec-med-6',
        medicamentoId: 'med-5', // Salbutamol
        dosisCantidad: 2,
        unidadDosis: 'puff',
        viaAdministracion: 'inhalatoria',
        indicaciones: 'Lunes a Viernes antes de iniciar actividades físicas.',
        fechaInicio: '2026-03-01',
        esIndefinido: true,
        patronHorario: 'dias_semana',
        diasSemana: [1, 2, 3, 4, 5],
        horasFijas: ['07:45', '18:00']
      }
    ]
  }
];

export const INITIAL_VITAL_SIGNS: VitalSign[] = [
  {
    id: 'vit-1',
    pacienteId: 'pat-1',
    fechaHora: '2026-09-01T08:15:00',
    presionSistolica: 125,
    presionDiastolica: 82,
    glucosa: 110,
    frecuenciaCardiaca: 72,
    temperatura: 36.5,
    saturacionOxigeno: 97,
    pesoKg: 78.4,
    notas: 'Valores estables después de la toma de Losartán.'
  },
  {
    id: 'vit-2',
    pacienteId: 'pat-1',
    fechaHora: '2026-09-02T08:05:00',
    presionSistolica: 128,
    presionDiastolica: 84,
    glucosa: 118,
    frecuenciaCardiaca: 75,
    temperatura: 36.6,
    saturacionOxigeno: 98,
    pesoKg: 78.2,
    notas: 'Medición matutina de rutina.'
  }
];
