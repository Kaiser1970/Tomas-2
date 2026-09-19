import { Prescription, Medicine, DoseRecord, DoseStatus, DoseType, PrescriptionMedicineItem } from '../types';
import { storageService } from './storageService';

export interface TreatmentProgress {
  esIndefinido: boolean;
  duracionDias?: number;
  fechaInicio: string;
  fechaFin?: string;
  diaActual: number;
  totalDias: number;
  diasRestantes: number;
  porcentajeProgreso: number; // 0 to 100
  estadoTratamiento: 'no_iniciado' | 'en_curso' | 'ultimo_dia' | 'finalizado' | 'indefinido';
  textoProgreso: string;
}

export interface ComputedDose {
  uniqueId: string; // key: `${pacienteId}_${fecha}_${horaProgramada}_${prescripcionItemId}`
  pacienteId: string;
  recetaId: string;
  prescripcionItemId: string;
  medicamentoId: string;
  medicamento: Medicine;
  dosisCantidad: number;
  unidadDosis: string;
  viaAdministracion: string;
  indicaciones: string;
  fecha: string; // YYYY-MM-DD
  horaProgramada: string; // HH:mm
  horaReal?: string;
  estado: DoseStatus;
  tipo: DoseType;
  motivoOmision?: string;
  pospuestoHasta?: string;
  stockDescontado?: boolean;
  esAtrasadaDeDiasAnteriores?: boolean;
  progresoTratamiento?: TreatmentProgress;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatHumanDate(dateStr: string): string {
  try {
    const d = parseDate(dateStr);
    return d.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

/**
 * Calculates end date based on start date and total duration days (inclusive).
 * e.g., Start 2026-09-02 for 7 days -> End 2026-09-08
 */
export function calculateTreatmentEndDate(startDateStr: string, durationDays: number): string {
  if (!startDateStr || !durationDays || durationDays <= 0) return startDateStr;
  const d = parseDate(startDateStr);
  d.setDate(d.getDate() + (Math.max(1, durationDays) - 1));
  return formatDate(d);
}

/**
 * Calculates duration in days between two date strings (inclusive).
 */
export function calculateDurationDays(startDateStr: string, endDateStr: string): number {
  if (!startDateStr || !endDateStr) return 1;
  const start = parseDate(startDateStr);
  const end = parseDate(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return Math.max(1, diffDays);
}

/**
 * Computes treatment lifecycle progression (Day X of Y, percentage, remaining days, status).
 */
export function getTreatmentProgress(
  item: { fechaInicio: string; fechaFin?: string; duracionDias?: number; esIndefinido: boolean },
  referenceDateStr: string = getTodayDateString()
): TreatmentProgress {
  if (item.esIndefinido) {
    return {
      esIndefinido: true,
      fechaInicio: item.fechaInicio,
      diaActual: 0,
      totalDias: 0,
      diasRestantes: 0,
      porcentajeProgreso: 100,
      estadoTratamiento: 'indefinido',
      textoProgreso: 'Tratamiento Continuo / Crónico'
    };
  }

  const effectiveEndDate = item.fechaFin || calculateTreatmentEndDate(item.fechaInicio, item.duracionDias || 7);
  const totalDays = item.duracionDias || calculateDurationDays(item.fechaInicio, effectiveEndDate);
  
  const refDate = parseDate(referenceDateStr);
  const startDate = parseDate(item.fechaInicio);
  const endDate = parseDate(effectiveEndDate);

  const diffStart = Math.floor((refDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  
  if (refDate < startDate) {
    const daysUntilStart = Math.max(1, Math.floor((startDate.getTime() - refDate.getTime()) / (1000 * 60 * 60 * 24)));
    return {
      esIndefinido: false,
      duracionDias: totalDays,
      fechaInicio: item.fechaInicio,
      fechaFin: effectiveEndDate,
      diaActual: 0,
      totalDias: totalDays,
      diasRestantes: totalDays,
      porcentajeProgreso: 0,
      estadoTratamiento: 'no_iniciado',
      textoProgreso: `Inicia en ${daysUntilStart} día${daysUntilStart > 1 ? 's' : ''}`
    };
  }

  if (refDate > endDate) {
    return {
      esIndefinido: false,
      duracionDias: totalDays,
      fechaInicio: item.fechaInicio,
      fechaFin: effectiveEndDate,
      diaActual: totalDays,
      totalDias: totalDays,
      diasRestantes: 0,
      porcentajeProgreso: 100,
      estadoTratamiento: 'finalizado',
      textoProgreso: `Tratamiento Concluido (${totalDays} días completados)`
    };
  }

  const currentDay = Math.min(totalDays, Math.max(1, diffStart));
  const remainingDays = Math.max(0, totalDays - currentDay);
  const percent = Math.min(100, Math.round((currentDay / totalDays) * 100));

  if (currentDay === totalDays) {
    return {
      esIndefinido: false,
      duracionDias: totalDays,
      fechaInicio: item.fechaInicio,
      fechaFin: effectiveEndDate,
      diaActual: currentDay,
      totalDias: totalDays,
      diasRestantes: 0,
      porcentajeProgreso: 100,
      estadoTratamiento: 'ultimo_dia',
      textoProgreso: `¡Último día de tratamiento! (Día ${currentDay} de ${totalDays})`
    };
  }

  return {
    esIndefinido: false,
    duracionDias: totalDays,
    fechaInicio: item.fechaInicio,
    fechaFin: effectiveEndDate,
    diaActual: currentDay,
    totalDias: totalDays,
    diasRestantes: remainingDays,
    porcentajeProgreso: percent,
    estadoTratamiento: 'en_curso',
    textoProgreso: `Día ${currentDay} de ${totalDays} (Faltan ${remainingDays} día${remainingDays !== 1 ? 's' : ''})`
  };
}

/**
 * Validates and deduplicates an array of scheduled hours.
 */
export function validateAndDeduplicateHours(hours: string[]): {
  isValid: boolean;
  duplicates: string[];
  sanitized: string[];
} {
  const seen = new Set<string>();
  const duplicates: string[] = [];
  const sanitized: string[] = [];

  for (const h of hours) {
    const trimmed = h.trim();
    if (!trimmed) continue;
    if (seen.has(trimmed)) {
      if (!duplicates.includes(trimmed)) {
        duplicates.push(trimmed);
      }
    } else {
      seen.add(trimmed);
      sanitized.push(trimmed);
    }
  }

  return {
    isValid: duplicates.length === 0,
    duplicates,
    sanitized: sanitized.sort()
  };
}

export function calculateAge(birthDateStr: string): number {
  try {
    const birth = parseDate(birthDateStr);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return Math.max(0, age);
  } catch {
    return 0;
  }
}

export function generateHoursEveryX(startHourStr: string = '08:00', intervalHours: number = 8): string[] {
  const hours: string[] = [];
  const [startH, startM] = startHourStr.split(':').map(Number);
  let currentMinutes = startH * 60 + (startM || 0);

  const step = (intervalHours || 8) * 60;
  for (let i = 0; i < 24 * 60; i += step) {
    const minOfDay = (currentMinutes + i) % (24 * 60);
    const h = Math.floor(minOfDay / 60);
    const m = minOfDay % 60;
    const formatted = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    if (!hours.includes(formatted)) {
      hours.push(formatted);
    }
  }
  return hours.sort();
}

export function getDosesForPatientAndDate(patientId: string, dateStr: string): ComputedDose[] {
  const prescriptions = storageService.getPrescriptions().filter(p => p.activo && p.estado === 'activa' && p.pacienteId === patientId);
  const medicines = storageService.getMedicines().filter(m => m.activo);
  const doseRecords = storageService.getDoseRecords().filter(r => r.pacienteId === patientId);

  const targetDate = parseDate(dateStr);
  const dayOfWeek = targetDate.getDay(); // 0 = Sun, 1 = Mon ...
  const todayStr = getTodayDateString();
  const isPastDate = dateStr < todayStr;
  const isToday = dateStr === todayStr;

  const results: ComputedDose[] = [];

  prescriptions.forEach(prescription => {
    prescription.medicamentos.forEach(item => {
      const medicine = medicines.find(m => m.id === item.medicamentoId);
      if (!medicine) return;

      // Check date bounds
      const startDate = parseDate(item.fechaInicio);
      if (targetDate < startDate) return;

      if (!item.esIndefinido) {
        const effectiveEnd = item.fechaFin || calculateTreatmentEndDate(item.fechaInicio, item.duracionDias || 7);
        const endDate = parseDate(effectiveEnd);
        if (targetDate > endDate) return;
      }

      const treatmentProgress = getTreatmentProgress(item, dateStr);

      // Check pattern applicability
      let scheduledHours: string[] = [];

      switch (item.patronHorario) {
        case 'hora_fija':
          scheduledHours = validateAndDeduplicateHours(item.horasFijas || ['08:00']).sanitized;
          break;

        case 'cada_x_horas': {
          const interval = item.intervaloHoras || 8;
          const start = item.horaInicioIntervalo || '08:00';
          scheduledHours = generateHoursEveryX(start, interval);
          break;
        }

        case 'dias_semana': {
          const activeDays = item.diasSemana || [1, 2, 3, 4, 5];
          if (activeDays.includes(dayOfWeek)) {
            scheduledHours = validateAndDeduplicateHours(item.horasFijas || ['08:00']).sanitized;
          }
          break;
        }

        case 'frecuencia_dias': {
          const intervalDays = item.cadaNDias || 2;
          const diffTime = Math.abs(targetDate.getTime() - startDate.getTime());
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays % intervalDays === 0) {
            scheduledHours = validateAndDeduplicateHours(item.horasFijas || ['08:00']).sanitized;
          }
          break;
        }

        default:
          scheduledHours = validateAndDeduplicateHours(item.horasFijas || ['08:00']).sanitized;
      }

      scheduledHours.forEach(hour => {
        const uniqueId = `${patientId}_${dateStr}_${hour}_${item.id}`;
        
        // Find existing record
        const record = doseRecords.find(
          r => r.pacienteId === patientId &&
               r.fecha === dateStr &&
               r.horaProgramada === hour &&
               r.prescripcionItemId === item.id
        );

        let status: DoseStatus = 'pendiente';
        let horaReal: string | undefined = undefined;
        let motivoOmision: string | undefined = undefined;
        let pospuestoHasta: string | undefined = undefined;
        let stockDescontado: boolean | undefined = undefined;

        if (record) {
          status = record.estado;
          horaReal = record.horaReal;
          motivoOmision = record.motivoOmision;
          pospuestoHasta = record.pospuestoHasta;
          stockDescontado = record.stockDescontado;
        } else {
          // If not recorded yet
          if (isPastDate) {
            status = 'atrasada';
          } else if (isToday) {
            // Check if scheduled time is already passed today
            const now = new Date();
            const [h, m] = hour.split(':').map(Number);
            const scheduledMinutes = h * 60 + m;
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            if (currentMinutes > scheduledMinutes + 30) {
              status = 'atrasada';
            } else {
              status = 'pendiente';
            }
          } else {
            status = 'pendiente';
          }
        }

        results.push({
          uniqueId,
          pacienteId: patientId,
          recetaId: prescription.id,
          prescripcionItemId: item.id,
          medicamentoId: medicine.id,
          medicamento: medicine,
          dosisCantidad: item.dosisCantidad,
          unidadDosis: item.unidadDosis,
          viaAdministracion: item.viaAdministracion,
          indicaciones: item.indicaciones,
          fecha: dateStr,
          horaProgramada: hour,
          horaReal,
          estado: status,
          tipo: 'programada',
          motivoOmision,
          pospuestoHasta,
          stockDescontado,
          progresoTratamiento: treatmentProgress
        });
      });
    });
  });

  // Also include any manual/extra doses registered for this date & patient
  const extraRecords = doseRecords.filter(
    r => r.pacienteId === patientId && r.fecha === dateStr && r.tipo === 'extra_manual'
  );

  extraRecords.forEach(extra => {
    const medicine = medicines.find(m => m.id === extra.medicamentoId);
    if (!medicine) return;

    results.push({
      uniqueId: `extra_${extra.id}`,
      pacienteId: patientId,
      recetaId: extra.recetaId || 'extra',
      prescripcionItemId: extra.prescripcionItemId || 'extra',
      medicamentoId: medicine.id,
      medicamento: medicine,
      dosisCantidad: 1,
      unidadDosis: medicine.unidadMedida,
      viaAdministracion: 'oral',
      indicaciones: extra.observaciones || 'Toma adicional / de rescate',
      fecha: dateStr,
      horaProgramada: extra.horaProgramada,
      horaReal: extra.horaReal,
      estado: extra.estado,
      tipo: 'extra_manual',
      motivoOmision: extra.motivoOmision,
      stockDescontado: extra.stockDescontado
    });
  });

  // Sort by time
  return results.sort((a, b) => a.horaProgramada.localeCompare(b.horaProgramada));
}

// Function to find all overdue doses from PAST days (up to 14 days back) that have no 'tomada' or 'omitida' record
export function getOverdueDosesFromPastDays(patientId: string): ComputedDose[] {
  const todayStr = getTodayDateString();
  const pastDoses: ComputedDose[] = [];

  // Check past 7 days
  for (let i = 1; i <= 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${day}`;

    const doses = getDosesForPatientAndDate(patientId, dateStr);
    const pendingOrOverdue = doses.filter(d => d.estado === 'atrasada' || d.estado === 'pendiente');
    pendingOrOverdue.forEach(d => {
      pastDoses.push({
        ...d,
        esAtrasadaDeDiasAnteriores: true
      });
    });
  }

  return pastDoses;
}

export function executeRecordDose(
  dose: ComputedDose,
  newState: DoseStatus,
  options?: {
    motivoOmision?: string;
    pospuestoHasta?: string;
    observaciones?: string;
  }
): void {
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const shouldDeductStock = newState === 'tomada' && !dose.stockDescontado;

  const record: DoseRecord = {
    id: `dose_${dose.pacienteId}_${dose.fecha}_${dose.horaProgramada.replace(':', '')}_${dose.prescripcionItemId}`,
    pacienteId: dose.pacienteId,
    recetaId: dose.recetaId,
    prescripcionItemId: dose.prescripcionItemId,
    medicamentoId: dose.medicamentoId,
    fecha: dose.fecha,
    horaProgramada: dose.horaProgramada,
    horaReal: newState === 'tomada' ? (dose.horaReal || timeStr) : undefined,
    estado: newState,
    tipo: dose.tipo,
    motivoOmision: options?.motivoOmision,
    pospuestoHasta: options?.pospuestoHasta,
    observaciones: options?.observaciones,
    stockDescontado: dose.stockDescontado || shouldDeductStock
  };

  storageService.recordDose(record);

  if (shouldDeductStock) {
    storageService.adjustMedicineStock(dose.medicamentoId, -dose.dosisCantidad);
  }
}
