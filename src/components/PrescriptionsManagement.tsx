import React, { useState, useMemo } from 'react';
import { 
  Prescription, 
  PrescriptionMedicineItem, 
  Patient, 
  Doctor, 
  Medicine, 
  SchedulePattern, 
  AdministrationRoute 
} from '../types';
import { 
  generateHoursEveryX, 
  getTodayDateString, 
  calculateTreatmentEndDate, 
  calculateDurationDays, 
  getTreatmentProgress, 
  validateAndDeduplicateHours,
  formatHumanDate 
} from '../services/scheduleEngine';
import { MedicineSearchSelect } from './MedicineSearchSelect';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar, 
  User, 
  Stethoscope, 
  Pill, 
  Check, 
  X, 
  Eye, 
  Paperclip, 
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  Hash
} from 'lucide-react';

interface PrescriptionsManagementProps {
  prescriptions: Prescription[];
  patients: Patient[];
  doctors: Doctor[];
  medicines: Medicine[];
  activePatientId: string;
  onAddPrescription: (prescription: Prescription) => void;
  onUpdatePrescription: (prescription: Prescription) => void;
  onDeletePrescription: (id: string) => void;
  onAddMedicine?: (newMedicine: Medicine) => void;
}

const DAYS_OF_WEEK = [
  { day: 1, label: 'Lun' },
  { day: 2, label: 'Mar' },
  { day: 3, label: 'Mié' },
  { day: 4, label: 'Jue' },
  { day: 5, label: 'Vie' },
  { day: 6, label: 'Sáb' },
  { day: 0, label: 'Dom' },
];

export const PrescriptionsManagement: React.FC<PrescriptionsManagementProps> = ({
  prescriptions,
  patients,
  doctors,
  medicines,
  activePatientId,
  onAddPrescription,
  onUpdatePrescription,
  onDeletePrescription,
  onAddMedicine
}) => {
  const [filterPatient, setFilterPatient] = useState<string>(activePatientId);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showModal, setShowModal] = useState(false);
  const [viewAttachmentUrl, setViewAttachmentUrl] = useState<string | null>(null);

  // Form State
  const [pacienteId, setPacienteId] = useState(activePatientId);
  const [doctorId, setDoctorId] = useState(doctors[0]?.id || '');
  const [fechaEmision, setFechaEmision] = useState(getTodayDateString());
  const [diagnostico, setDiagnostico] = useState('');
  const [archivoAdjuntoUrl, setArchivoAdjuntoUrl] = useState('');
  
  // Sorted active medicines A-Z
  const sortedMedicines = useMemo(() => {
    return [...medicines]
      .filter(m => m.activo)
      .sort((a, b) => a.nombreComercial.localeCompare(b.nombreComercial, 'es', { sensitivity: 'base' }));
  }, [medicines]);

  // Medicines List in Form
  const [formMeds, setFormMeds] = useState<PrescriptionMedicineItem[]>([
    {
      id: `item-${Date.now()}`,
      medicamentoId: sortedMedicines[0]?.id || medicines[0]?.id || '',
      dosisCantidad: 1,
      unidadDosis: 'tableta',
      viaAdministracion: 'oral',
      indicaciones: 'Con alimentos',
      fechaInicio: getTodayDateString(),
      duracionDias: 7,
      fechaFin: calculateTreatmentEndDate(getTodayDateString(), 7),
      esIndefinido: false,
      patronHorario: 'hora_fija',
      horasFijas: ['08:00', '20:00']
    }
  ]);

  // Form custom hour temporary inputs & warnings
  const [customHours, setCustomHours] = useState<{ [key: number]: string }>({});
  const [duplicateWarnings, setDuplicateWarnings] = useState<{ [key: number]: string | null }>({});
  const [formError, setFormError] = useState<string | null>(null);

  const activePrescriptions = prescriptions.filter(p => p.activo);
  const filtered = activePrescriptions.filter(p => {
    const matchesPatient = filterPatient === 'all' || p.pacienteId === filterPatient;
    const matchesStatus = filterStatus === 'all' || p.estado === filterStatus;
    return matchesPatient && matchesStatus;
  });

  const handleOpenAdd = () => {
    const today = getTodayDateString();
    setPacienteId(activePatientId);
    setDoctorId(doctors[0]?.id || '');
    setFechaEmision(today);
    setDiagnostico('');
    setFormError(null);
    setDuplicateWarnings({});
    setCustomHours({});
    setArchivoAdjuntoUrl('https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80');
    setFormMeds([
      {
        id: `item-${Date.now()}`,
        medicamentoId: sortedMedicines[0]?.id || medicines[0]?.id || '',
        dosisCantidad: 1,
        unidadDosis: 'tableta',
        viaAdministracion: 'oral',
        indicaciones: 'Con alimentos',
        fechaInicio: today,
        duracionDias: 7,
        fechaFin: calculateTreatmentEndDate(today, 7),
        esIndefinido: false,
        patronHorario: 'hora_fija',
        horasFijas: ['08:00', '20:00']
      }
    ]);
    setShowModal(true);
  };

  const handleAddMedItem = () => {
    const today = getTodayDateString();
    setFormMeds([
      ...formMeds,
      {
        id: `item-${Date.now()}-${Math.random()}`,
        medicamentoId: sortedMedicines[0]?.id || medicines[0]?.id || '',
        dosisCantidad: 1,
        unidadDosis: 'tableta',
        viaAdministracion: 'oral',
        indicaciones: '',
        fechaInicio: today,
        duracionDias: 7,
        fechaFin: calculateTreatmentEndDate(today, 7),
        esIndefinido: false,
        patronHorario: 'hora_fija',
        horasFijas: ['08:00']
      }
    ]);
  };

  const handleRemoveMedItem = (index: number) => {
    if (formMeds.length <= 1) return;
    setFormMeds(formMeds.filter((_, i) => i !== index));
    const nextWarns = { ...duplicateWarnings };
    delete nextWarns[index];
    setDuplicateWarnings(nextWarns);
  };

  const handleUpdateMedItem = (index: number, updates: Partial<PrescriptionMedicineItem>) => {
    const updated = [...formMeds];
    const currentItem = updated[index];
    const newItem = { ...currentItem, ...updates };

    // Keep duration & end date synchronized
    if (updates.fechaInicio !== undefined || updates.duracionDias !== undefined) {
      const start = updates.fechaInicio !== undefined ? updates.fechaInicio : currentItem.fechaInicio;
      const duration = updates.duracionDias !== undefined ? updates.duracionDias : (currentItem.duracionDias || 7);
      if (!newItem.esIndefinido && duration > 0) {
        newItem.fechaFin = calculateTreatmentEndDate(start, duration);
      }
    } else if (updates.fechaFin !== undefined && !newItem.esIndefinido) {
      if (newItem.fechaInicio && updates.fechaFin) {
        newItem.duracionDias = calculateDurationDays(newItem.fechaInicio, updates.fechaFin);
      }
    }

    // When toggling esIndefinido
    if (updates.esIndefinido === true) {
      newItem.fechaFin = undefined;
    } else if (updates.esIndefinido === false && !newItem.fechaFin) {
      const days = newItem.duracionDias || 7;
      newItem.duracionDias = days;
      newItem.fechaFin = calculateTreatmentEndDate(newItem.fechaInicio, days);
    }

    updated[index] = newItem;
    setFormMeds(updated);
  };

  const handleAddHourToItem = (itemIndex: number, newHour: string) => {
    const trimmed = newHour.trim();
    if (!trimmed) return;

    const currentItem = formMeds[itemIndex];
    const currentHours = currentItem.horasFijas || [];

    if (currentHours.includes(trimmed)) {
      setDuplicateWarnings({
        ...duplicateWarnings,
        [itemIndex]: `⚠️ El horario ${trimmed} ya está programado para este medicamento. No se permiten dosis duplicadas al día.`
      });
      return;
    }

    // Clear warning and add
    const nextWarns = { ...duplicateWarnings };
    delete nextWarns[itemIndex];
    setDuplicateWarnings(nextWarns);

    const updatedHours = [...currentHours, trimmed].sort();
    handleUpdateMedItem(itemIndex, { horasFijas: updatedHours });
    setCustomHours({ ...customHours, [itemIndex]: '' });
  };

  const handleRemoveHourFromItem = (itemIndex: number, hourToRemove: string) => {
    const currentItem = formMeds[itemIndex];
    const currentHours = currentItem.horasFijas || [];
    if (currentHours.length <= 1) {
      setDuplicateWarnings({
        ...duplicateWarnings,
        [itemIndex]: '⚠️ Debe haber al menos un horario de toma asignado.'
      });
      return;
    }

    const nextWarns = { ...duplicateWarnings };
    delete nextWarns[itemIndex];
    setDuplicateWarnings(nextWarns);

    const updatedHours = currentHours.filter(h => h !== hourToRemove);
    handleUpdateMedItem(itemIndex, { horasFijas: updatedHours });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!pacienteId || !doctorId || formMeds.length === 0) {
      setFormError('Por favor completa todos los datos obligatorios de la receta.');
      return;
    }

    // Validate no duplicates in medication list
    const medIds = formMeds.map(m => m.medicamentoId);
    const uniqueMedIds = new Set(medIds);
    if (uniqueMedIds.size < medIds.length) {
      setFormError('Has incluido el mismo medicamento más de una vez en esta receta. Configura todos los horarios dentro del mismo registro.');
      return;
    }

    // Validate hours and durations
    for (let i = 0; i < formMeds.length; i++) {
      const item = formMeds[i];
      if (item.patronHorario === 'hora_fija') {
        const { duplicates, sanitized } = validateAndDeduplicateHours(item.horasFijas || []);
        if (duplicates.length > 0) {
          setFormError(`El medicamento #${i + 1} tiene horarios duplicados (${duplicates.join(', ')}). Corrige los horarios antes de guardar.`);
          return;
        }
        if (sanitized.length === 0) {
          setFormError(`El medicamento #${i + 1} debe tener al menos un horario configurado.`);
          return;
        }
      }

      if (!item.esIndefinido && (!item.duracionDias || item.duracionDias < 1)) {
        setFormError(`El medicamento #${i + 1} debe tener una duración válida de al menos 1 día.`);
        return;
      }
    }

    // Final clean up of medicines before saving
    const sanitizedMeds = formMeds.map(item => {
      let finalItem = { ...item };
      if (item.patronHorario === 'hora_fija') {
        finalItem.horasFijas = validateAndDeduplicateHours(item.horasFijas || ['08:00']).sanitized;
      }
      if (!item.esIndefinido) {
        const days = item.duracionDias || 7;
        finalItem.duracionDias = days;
        finalItem.fechaFin = item.fechaFin || calculateTreatmentEndDate(item.fechaInicio, days);
      } else {
        finalItem.fechaFin = undefined;
        finalItem.duracionDias = undefined;
      }
      return finalItem;
    });

    const newPrescription: Prescription = {
      id: `rec-${Date.now()}`,
      pacienteId,
      doctorId,
      fechaEmision,
      diagnostico: diagnostico.trim() || undefined,
      estado: 'activa',
      archivoAdjuntoUrl: archivoAdjuntoUrl.trim() || undefined,
      medicamentos: sanitizedMeds,
      activo: true,
      creadoEn: new Date().toISOString()
    };

    onAddPrescription(newPrescription);
    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Gestión de Recetas Médicas
          </h2>
          <p className="text-xs text-slate-400">
            Vinculación de paciente, médico, medicamentos y reglas de horario de tomas
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:opacity-95 transition-opacity shadow-lg shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Receta Médica</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-slate-400 font-semibold">Filtrar por Paciente:</span>
          <select
            value={filterPatient}
            onChange={(e) => setFilterPatient(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todos los pacientes</option>
            {patients.filter(p => p.activo).map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-semibold">Estado:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Todas las recetas</option>
            <option value="activa">Activas</option>
            <option value="completada">Completadas</option>
            <option value="archivada">Archivadas</option>
          </select>
        </div>
      </div>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-2">
            <FileText className="w-10 h-10 text-slate-500 mx-auto" />
            <h4 className="text-sm font-bold text-white">No hay recetas que coincidan con el filtro</h4>
            <p className="text-xs text-slate-400">Prueba cambiando el paciente o añadiendo una nueva receta.</p>
          </div>
        ) : (
          filtered.map((prescription) => {
            const patient = patients.find(p => p.id === prescription.pacienteId);
            const doctor = doctors.find(d => d.id === prescription.doctorId);

            return (
              <div
                key={prescription.id}
                className="p-5 sm:p-6 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-4"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white">
                          Receta #{prescription.id.slice(-6).toUpperCase()}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          prescription.estado === 'activa'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {prescription.estado}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>Paciente: <strong className="text-slate-200">{patient?.nombre || 'Desconocido'}</strong></span>
                        <span>•</span>
                        <span>Emitida: <span className="font-mono">{prescription.fechaEmision}</span></span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {prescription.archivoAdjuntoUrl && (
                      <button
                        onClick={() => setViewAttachmentUrl(prescription.archivoAdjuntoUrl!)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Ver Receta Física</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm('¿Dar de baja esta receta?')) {
                          onDeletePrescription(prescription.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                      title="Eliminar receta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Doctor & Diagnosis */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-slate-400">Médico Tratante:</span>
                      <p className="font-bold text-white">{doctor?.nombre} ({doctor?.especialidad})</p>
                    </div>
                  </div>
                  {prescription.diagnostico && (
                    <div>
                      <span className="text-slate-400">Diagnóstico / Motivo:</span>
                      <p className="font-medium text-slate-200">{prescription.diagnostico}</p>
                    </div>
                  )}
                </div>

                {/* Prescribed Medicines in this Recipe */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Medicamentos y Horarios Prescritos ({prescription.medicamentos.length}):
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {prescription.medicamentos.map((item) => {
                      const med = medicines.find(m => m.id === item.medicamentoId);
                      const progress = getTreatmentProgress(item);

                      // Calculate doses per day
                      let dailyDosesCount = 1;
                      if (item.patronHorario === 'hora_fija') {
                        dailyDosesCount = (item.horasFijas || ['08:00']).length;
                      } else if (item.patronHorario === 'cada_x_horas') {
                        dailyDosesCount = Math.floor(24 / (item.intervaloHoras || 8));
                      } else if (item.patronHorario === 'dias_semana') {
                        dailyDosesCount = (item.horasFijas || ['08:00']).length;
                      }

                      const totalTreatmentDoses = !item.esIndefinido && progress.totalDias
                        ? dailyDosesCount * progress.totalDias
                        : null;

                      return (
                        <div
                          key={item.id}
                          className="p-4 rounded-2xl bg-slate-800/70 border border-slate-700/70 space-y-3 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Pill className="w-4 h-4" />
                              </div>
                              <div>
                                <strong className="text-white text-sm block">{med?.nombreComercial}</strong>
                                <p className="text-[11px] text-slate-400">
                                  {med?.sustanciaActiva} {med?.concentracion} • Vía {item.viaAdministracion}
                                </p>
                              </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 font-mono font-bold shrink-0">
                              {item.dosisCantidad} {item.unidadDosis}
                            </span>
                          </div>

                          {/* Treatment Progression & Duration Status Control */}
                          <div className={`p-3 rounded-xl border space-y-2 ${
                            item.esIndefinido
                              ? 'bg-blue-950/20 border-blue-500/30'
                              : progress.estadoTratamiento === 'finalizado'
                              ? 'bg-slate-900/80 border-slate-700/60'
                              : progress.estadoTratamiento === 'ultimo_dia'
                              ? 'bg-amber-950/30 border-amber-500/40'
                              : 'bg-emerald-950/20 border-emerald-500/30'
                          }`}>
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[11px] font-bold flex items-center gap-1.5">
                                <CalendarDays className="w-3.5 h-3.5" />
                                {item.esIndefinido ? (
                                  <span className="text-blue-300">Tratamiento Continuo</span>
                                ) : progress.estadoTratamiento === 'finalizado' ? (
                                  <span className="text-slate-400">Tratamiento Concluido</span>
                                ) : progress.estadoTratamiento === 'ultimo_dia' ? (
                                  <span className="text-amber-300 font-black">¡Último Día de Toma Hoy!</span>
                                ) : (
                                  <span className="text-emerald-300">Control de Duración</span>
                                )}
                              </span>
                              
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                item.esIndefinido
                                  ? 'bg-blue-500/20 text-blue-300'
                                  : progress.estadoTratamiento === 'finalizado'
                                  ? 'bg-slate-700 text-slate-300'
                                  : progress.estadoTratamiento === 'ultimo_dia'
                                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                                  : 'bg-emerald-500/20 text-emerald-300'
                              }`}>
                                {progress.textoProgreso}
                              </span>
                            </div>

                            {/* Progress bar for defined treatments */}
                            {!item.esIndefinido && progress.totalDias > 0 && (
                              <div className="space-y-1">
                                <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      progress.estadoTratamiento === 'finalizado'
                                        ? 'bg-slate-500'
                                        : progress.estadoTratamiento === 'ultimo_dia'
                                        ? 'bg-amber-400'
                                        : 'bg-emerald-400'
                                    }`}
                                    style={{ width: `${progress.porcentajeProgreso}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                                  <span>Inició: {item.fechaInicio}</span>
                                  <span className="font-semibold text-slate-300">
                                    {progress.diaActual} de {progress.totalDias} días ({progress.porcentajeProgreso}%)
                                  </span>
                                  <span>Término: {item.fechaFin}</span>
                                </div>
                              </div>
                            )}

                            {/* Doses and count calculations */}
                            <div className="flex flex-wrap items-center justify-between gap-1 pt-1 text-[11px] border-t border-slate-800/80 text-slate-300">
                              <span className="flex items-center gap-1 font-mono">
                                <Hash className="w-3 h-3 text-emerald-400" />
                                <strong>{dailyDosesCount}</strong> toma{dailyDosesCount !== 1 ? 's' : ''}/día
                              </span>
                              {totalTreatmentDoses && (
                                <span className="text-[10px] text-slate-400">
                                  Total tratam.: <strong className="text-emerald-300 font-mono">{totalTreatmentDoses} dosis</strong>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Pattern & Scheduled Hours Chips */}
                          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                            <div className="flex items-center justify-between text-[11px] text-slate-400">
                              <span className="flex items-center gap-1 font-semibold text-emerald-300">
                                <Clock className="w-3 h-3" />
                                {item.patronHorario === 'hora_fija' && 'Horas Fijas Asignadas (Sin duplicados):'}
                                {item.patronHorario === 'cada_x_horas' && `Intervalo Cada ${item.intervaloHoras} horas:`}
                                {item.patronHorario === 'dias_semana' && 'Días de semana seleccionados:'}
                                {item.patronHorario === 'frecuencia_dias' && `Frecuencia Cada ${item.cadaNDias} días:`}
                              </span>
                            </div>

                            {/* Show Scheduled Hours Chips */}
                            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                              {item.patronHorario === 'cada_x_horas' ? (
                                generateHoursEveryX(item.horaInicioIntervalo, item.intervaloHoras).map((h, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                                    {h}
                                  </span>
                                ))
                              ) : item.horasFijas ? (
                                item.horasFijas.map((h, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono text-[11px] font-bold border border-emerald-500/30">
                                    {h}
                                  </span>
                                ))
                              ) : null}
                            </div>
                          </div>

                          {item.indicaciones && (
                            <p className="text-emerald-400 text-[11px] italic bg-emerald-950/20 p-2 rounded-xl border border-emerald-500/20">
                              💡 "{item.indicaciones}"
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* New Prescription Wizard Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  Alta de Receta Médica y Programación de Horarios
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6">
              {/* Form Global Error Banner */}
              {formError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold block">No se pudo guardar la receta</strong>
                    <span>{formError}</span>
                  </div>
                </div>
              )}

              {/* Patient & Doctor Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Paciente *
                  </label>
                  <select
                    value={pacienteId}
                    onChange={(e) => setPacienteId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    required
                  >
                    {patients.filter(p => p.activo).map(p => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Doctor Tratante *
                  </label>
                  <select
                    value={doctorId}
                    onChange={(e) => setDoctorId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                    required
                  >
                    {doctors.filter(d => d.activo).map(d => (
                      <option key={d.id} value={d.id}>{d.nombre} ({d.especialidad})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Fecha de Emisión *
                  </label>
                  <input
                    type="date"
                    value={fechaEmision}
                    onChange={(e) => setFechaEmision(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Diagnóstico o Indicación Principal
                </label>
                <input
                  type="text"
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  placeholder="Ej. Hipertensión esencial, Tratamiento antibiótico posoperatorio..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Medicine Items in Recipe */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <Pill className="w-4 h-4" />
                    Medicamentos, Horarios y Control de Días
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMedItem}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir otro medicamento
                  </button>
                </div>

                {formMeds.map((medItem, idx) => {
                  const dailyDosesCount = medItem.patronHorario === 'hora_fija'
                    ? (medItem.horasFijas || []).length
                    : medItem.patronHorario === 'cada_x_horas'
                    ? Math.floor(24 / (medItem.intervaloHoras || 8))
                    : (medItem.horasFijas || []).length;

                  const totalEstimatedDoses = !medItem.esIndefinido && medItem.duracionDias
                    ? dailyDosesCount * medItem.duracionDias
                    : null;

                  return (
                    <div
                      key={medItem.id}
                      className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px] font-mono">
                            #{idx + 1}
                          </span>
                          Medicamento Prescrito
                        </span>
                        {formMeds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMedItem(idx)}
                            className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Eliminar
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        {/* Searchable Alphabetical Medicine Selector with Instant Quick Add */}
                        <MedicineSearchSelect
                          medicines={medicines}
                          selectedMedicineId={medItem.medicamentoId}
                          onSelectMedicine={(id) => handleUpdateMedItem(idx, { medicamentoId: id })}
                          onAddMedicine={onAddMedicine}
                          label="Medicamento (Búsqueda Alfabética A-Z y Filtro por Letra)"
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Dosis Cantidad</label>
                              <input
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={medItem.dosisCantidad}
                                onChange={(e) => handleUpdateMedItem(idx, { dosisCantidad: parseFloat(e.target.value) || 1 })}
                                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">Unidad</label>
                              <input
                                type="text"
                                value={medItem.unidadDosis}
                                onChange={(e) => handleUpdateMedItem(idx, { unidadDosis: e.target.value })}
                                placeholder="tableta, ml, puff"
                                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 mb-1">Vía de Adm.</label>
                            <select
                              value={medItem.viaAdministracion}
                              onChange={(e) => handleUpdateMedItem(idx, { viaAdministracion: e.target.value as AdministrationRoute })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs capitalize"
                            >
                              <option value="oral">Oral</option>
                              <option value="topica">Tópica</option>
                              <option value="inyectable">Inyectable</option>
                              <option value="oftalmica">Oftálmica</option>
                              <option value="inhalatoria">Inhalatoria</option>
                              <option value="sublingual">Sublingual</option>
                              <option value="nasal">Nasal</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Schedule Pattern Selector & Anti-Duplicate Hours Management */}
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            Horarios de las Tomas (Sin Duplicados)
                          </span>
                          <select
                            value={medItem.patronHorario}
                            onChange={(e) => handleUpdateMedItem(idx, { patronHorario: e.target.value as SchedulePattern })}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-semibold focus:outline-none focus:border-emerald-500"
                          >
                            <option value="hora_fija">Por horas fijas (ej. 08:00, 20:00)</option>
                            <option value="cada_x_horas">Cada X horas (ej. cada 8 horas)</option>
                            <option value="dias_semana">Días específicos de la semana</option>
                            <option value="frecuencia_dias">Por frecuencia de días (ej. cada 2 días)</option>
                          </select>
                        </div>

                        {/* Inline Warning for Duplicates */}
                        {duplicateWarnings[idx] && (
                          <div className="p-2.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                            <span>{duplicateWarnings[idx]}</span>
                          </div>
                        )}

                        {/* Config according to pattern */}
                        {medItem.patronHorario === 'hora_fija' && (
                          <div className="space-y-3">
                            <div>
                              <div className="flex items-center justify-between mb-1.5">
                                <label className="text-[11px] text-slate-400">
                                  Horas de toma asignadas ({medItem.horasFijas?.length || 0} tomas al día):
                                </label>
                                <span className="text-[10px] text-emerald-400 font-mono font-semibold">
                                  ✓ Validación anti-duplicados activa
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {(medItem.horasFijas || ['08:00']).map((h, hIdx) => (
                                  <div
                                    key={hIdx}
                                    className="flex items-center gap-1.5 bg-slate-800 px-3 py-1 rounded-xl border border-emerald-500/30 font-mono text-xs text-white"
                                  >
                                    <Clock className="w-3 h-3 text-emerald-400" />
                                    <span className="font-bold">{h}</span>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveHourFromItem(idx, h)}
                                      className="text-slate-400 hover:text-rose-400 ml-1 font-bold text-sm leading-none"
                                      title="Eliminar este horario"
                                    >
                                      ×
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Add Custom Hour Form & Quick Preset Chips */}
                            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[11px] text-slate-400">Añadir hora personalizada:</span>
                                <input
                                  type="time"
                                  value={customHours[idx] || ''}
                                  onChange={(e) => setCustomHours({ ...customHours, [idx]: e.target.value })}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (customHours[idx]) {
                                      handleAddHourToItem(idx, customHours[idx]);
                                    }
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors"
                                >
                                  + Agregar
                                </button>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/80">
                                <span className="text-[10px] text-slate-500">Horas comunes:</span>
                                {['07:00', '08:00', '12:00', '14:00', '18:00', '20:00', '22:00'].map((quickH) => {
                                  const isAlreadyAdded = (medItem.horasFijas || []).includes(quickH);
                                  return (
                                    <button
                                      key={quickH}
                                      type="button"
                                      disabled={isAlreadyAdded}
                                      onClick={() => handleAddHourToItem(idx, quickH)}
                                      className={`text-[10px] px-2 py-0.5 rounded-lg font-mono transition-colors ${
                                        isAlreadyAdded
                                          ? 'bg-slate-800/40 text-slate-600 cursor-not-allowed line-through'
                                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                                      }`}
                                      title={isAlreadyAdded ? 'Ya asignado' : `Agregar toma a las ${quickH}`}
                                    >
                                      +{quickH}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}

                        {medItem.patronHorario === 'cada_x_horas' && (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Intervalo en Horas</label>
                                <select
                                  value={medItem.intervaloHoras || 8}
                                  onChange={(e) => handleUpdateMedItem(idx, { intervaloHoras: parseInt(e.target.value) })}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                                >
                                  <option value="4">Cada 4 horas (6 tomas/día)</option>
                                  <option value="6">Cada 6 horas (4 tomas/día)</option>
                                  <option value="8">Cada 8 horas (3 tomas/día)</option>
                                  <option value="12">Cada 12 horas (2 tomas/día)</option>
                                  <option value="24">Cada 24 horas (1 toma/día)</option>
                                </select>
                              </div>
                              <div>
                                <label className="block text-[11px] text-slate-400 mb-1">Hora Primera Toma</label>
                                <input
                                  type="time"
                                  value={medItem.horaInicioIntervalo || '08:00'}
                                  onChange={(e) => handleUpdateMedItem(idx, { horaInicioIntervalo: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                                />
                              </div>
                            </div>

                            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                              <span className="text-[10px] text-slate-400 block mb-1">Horarios generados automáticamente en el día:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {generateHoursEveryX(medItem.horaInicioIntervalo || '08:00', medItem.intervaloHoras || 8).map((h, i) => (
                                  <span key={i} className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {medItem.patronHorario === 'dias_semana' && (
                          <div className="space-y-2">
                            <label className="block text-[11px] text-slate-400">Selecciona los días activos:</label>
                            <div className="flex items-center gap-1.5">
                              {DAYS_OF_WEEK.map(({ day, label }) => {
                                const activeDays = medItem.diasSemana || [1, 2, 3, 4, 5];
                                const isSelected = activeDays.includes(day);

                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                      const next = isSelected
                                        ? activeDays.filter(d => d !== day)
                                        : [...activeDays, day];
                                      handleUpdateMedItem(idx, { diasSemana: next });
                                    }}
                                    className={`w-9 h-8 rounded-lg text-xs font-bold transition-colors ${
                                      isSelected
                                        ? 'bg-emerald-500 text-slate-950 font-black'
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {medItem.patronHorario === 'frecuencia_dias' && (
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Frecuencia cada cuántos días:</label>
                            <select
                              value={medItem.cadaNDias || 2}
                              onChange={(e) => handleUpdateMedItem(idx, { cadaNDias: parseInt(e.target.value) })}
                              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                            >
                              <option value="2">Cada 2 días (Día por medio)</option>
                              <option value="3">Cada 3 días</option>
                              <option value="7">Cada 7 días (Semanal)</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Treatment Duration & Completion Control (Days Tracker) */}
                      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                            <CalendarDays className="w-3.5 h-3.5" />
                            Duración del Tratamiento y Control hasta su Término
                          </span>
                        </div>

                        {/* Mode Selector Toggle */}
                        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                          <button
                            type="button"
                            onClick={() => handleUpdateMedItem(idx, { esIndefinido: false })}
                            className={`py-1.5 px-2 rounded-lg font-semibold transition-all ${
                              !medItem.esIndefinido
                                ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            📅 Por Días de Tratamiento
                          </button>
                          <button
                            type="button"
                            onClick={() => handleUpdateMedItem(idx, { esIndefinido: true })}
                            className={`py-1.5 px-2 rounded-lg font-semibold transition-all ${
                              medItem.esIndefinido
                                ? 'bg-blue-500 text-slate-950 shadow-md font-bold'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            ♾️ Continuo / Crónico
                          </button>
                        </div>

                        {!medItem.esIndefinido ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                  Fecha de Inicio
                                </label>
                                <input
                                  type="date"
                                  value={medItem.fechaInicio}
                                  onChange={(e) => handleUpdateMedItem(idx, { fechaInicio: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                  Duración (Días)
                                </label>
                                <input
                                  type="number"
                                  min="1"
                                  max="365"
                                  value={medItem.duracionDias || 7}
                                  onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    handleUpdateMedItem(idx, { duracionDias: isNaN(val) ? 1 : Math.max(1, val) });
                                  }}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono font-bold"
                                  required
                                />
                              </div>

                              <div>
                                <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                  Fecha de Término
                                </label>
                                <input
                                  type="date"
                                  value={medItem.fechaFin || calculateTreatmentEndDate(medItem.fechaInicio, medItem.duracionDias || 7)}
                                  onChange={(e) => handleUpdateMedItem(idx, { fechaFin: e.target.value })}
                                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                                  required
                                />
                              </div>
                            </div>

                            {/* Quick Presets for Treatment Duration */}
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1.5">
                                Presets comunes de tratamiento (antibióticos, analgésicos, etc.):
                              </span>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {[
                                  { days: 3, label: '3 días' },
                                  { days: 5, label: '5 días' },
                                  { days: 7, label: '7 días (1 sem)' },
                                  { days: 10, label: '10 días' },
                                  { days: 14, label: '14 días (2 sem)' },
                                  { days: 21, label: '21 días (3 sem)' },
                                  { days: 30, label: '30 días (1 mes)' }
                                ].map((preset) => (
                                  <button
                                    key={preset.days}
                                    type="button"
                                    onClick={() => handleUpdateMedItem(idx, { duracionDias: preset.days })}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors ${
                                      medItem.duracionDias === preset.days
                                        ? 'bg-emerald-500 text-slate-950 font-bold'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Live calculation banner */}
                            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-300 space-y-1">
                              <div className="flex items-center justify-between font-bold">
                                <span>📅 Inicia: {medItem.fechaInicio}</span>
                                <span>🏁 Concluye: {medItem.fechaFin || calculateTreatmentEndDate(medItem.fechaInicio, medItem.duracionDias || 7)}</span>
                              </div>
                              <p className="text-[11px] text-slate-300">
                                📊 Control de dosis: <strong className="text-white">{dailyDosesCount} toma{dailyDosesCount !== 1 ? 's' : ''}/día</strong> durante <strong className="text-white">{medItem.duracionDias || 7} días</strong> = <strong className="text-emerald-400 font-mono">{totalEstimatedDoses} dosis en total</strong> hasta concluir el tratamiento.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div>
                              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                                Fecha de Inicio
                              </label>
                              <input
                                type="date"
                                value={medItem.fechaInicio}
                                onChange={(e) => handleUpdateMedItem(idx, { fechaInicio: e.target.value })}
                                className="w-full sm:w-1/2 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                                required
                              />
                            </div>
                            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/30 text-xs text-blue-300">
                              ♾️ Este medicamento está configurado como <strong>Tratamiento Continuo</strong> (sin fecha de término). Se programarán las {dailyDosesCount} tomas diarias de forma indefinida en el calendario del paciente.
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Indications */}
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Indicaciones Especiales de Administración
                        </label>
                        <input
                          type="text"
                          value={medItem.indicaciones}
                          onChange={(e) => handleUpdateMedItem(idx, { indicaciones: e.target.value })}
                          placeholder="Ej. Tomar con abundante agua, con alimentos, 30 min antes del desayuno..."
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Attachment link */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                  Foto o Escaneo de Receta Física (URL)
                </label>
                <input
                  type="url"
                  value={archivoAdjuntoUrl}
                  onChange={(e) => setArchivoAdjuntoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition-colors shadow-lg shadow-emerald-500/20"
                >
                  Guardar y Programar Receta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Attachment Viewer Modal */}
      {viewAttachmentUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-emerald-400" />
                Receta Médica Adjunta
              </h4>
              <button onClick={() => setViewAttachmentUrl(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="rounded-2xl overflow-hidden border border-slate-800 bg-black max-h-[70vh] flex items-center justify-center">
              <img
                src={viewAttachmentUrl}
                alt="Receta adjunta"
                className="w-full object-contain max-h-[70vh]"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
