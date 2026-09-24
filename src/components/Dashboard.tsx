import { avatarFromName } from '../services/avatarService';
import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  Patient, 
  Medicine, 
  Doctor, 
  Prescription, 
  DoseStatus, 
  DrugInteractionAlert 
} from '../types';
import { 
  ComputedDose, 
  getDosesForPatientAndDate, 
  getOverdueDosesFromPastDays, 
  getTodayDateString, 
  formatHumanDate, 
  calculateAge,
  executeRecordDose
} from '../services/scheduleEngine';
import { audioService } from '../services/audioService';
import { checkInteractionsAndDuplicates } from '../services/interactionChecker';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertTriangle, 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  PhoneCall, 
  AlertOctagon, 
  PlusCircle, 
  Volume2, 
  Sparkles, 
  Pill, 
  Activity, 
  Timer, 
  ShieldCheck, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { ManualDoseModal } from './ManualDoseModal';
import { OmissionReasonModal } from './OmissionReasonModal';
import { OverdueDosesModal } from './OverdueDosesModal';

interface DashboardProps {
  activePatient: Patient;
  patients: Patient[];
  medicines: Medicine[];
  doctors: Doctor[];
  prescriptions: Prescription[];
  onRefreshData: () => void;
  onOpenPatientSwitcher: () => void;
  accessibilityMode: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({
  activePatient,
  patients,
  medicines,
  doctors,
  prescriptions,
  onRefreshData,
  onOpenPatientSwitcher,
  accessibilityMode
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(getTodayDateString());
  const [showManualModal, setShowManualModal] = useState(false);
  const [showOverdueModal, setShowOverdueModal] = useState(false);
  const [omissionDose, setOmissionDose] = useState<ComputedDose | null>(null);

  const todayStr = getTodayDateString();
  const isToday = selectedDate === todayStr;

  // Compute doses for selected date and patient
  const dailyDoses = getDosesForPatientAndDate(activePatient.id, selectedDate);
  const overduePastDoses = getOverdueDosesFromPastDays(activePatient.id);

  // Compute counters
  const totalDoses = dailyDoses.length;
  const tomadas = dailyDoses.filter(d => d.estado === 'tomada').length;
  const pendientes = dailyDoses.filter(d => d.estado === 'pendiente' || d.estado === 'atrasada').length;
  const omitidas = dailyDoses.filter(d => d.estado === 'omitida').length;

  const adherenciaPorcentaje = totalDoses > 0 
    ? Math.round((tomadas / totalDoses) * 100) 
    : 100;

  // Active medicines for interaction checking
  const activePrescriptions = prescriptions.filter(p => p.activo && p.estado === 'activa' && p.pacienteId === activePatient.id);
  const activeMedIds = Array.from(new Set(activePrescriptions.flatMap(p => p.medicamentos.map(m => m.medicamentoId))));
  const activePatientMedicines = medicines.filter(m => activeMedIds.includes(m.id));
  const drugAlerts = checkInteractionsAndDuplicates(activePatientMedicines);

  const age = calculateAge(activePatient.fechaNacimiento);

  // Date handlers
  const handlePrevDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleSetToday = () => {
    setSelectedDate(todayStr);
  };

  // Dose action handlers
  const handleMarkAsTaken = (dose: ComputedDose) => {
    // Play patient's personalized tone sound
    audioService.playTone(activePatient.tonoNotificacion);

    // Trigger visual celebration
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#C9713D', '#E3A778', '#8C4A25']
      });
    } catch {
      // Confetti fallback
    }

    executeRecordDose(dose, 'tomada');
    onRefreshData();
  };

  const handleOpenOmission = (dose: ComputedDose) => {
    setOmissionDose(dose);
  };

  const handleConfirmOmission = (dose: ComputedDose, reason: string) => {
    executeRecordDose(dose, 'omitida', { motivoOmision: reason });
    onRefreshData();
  };

  const handleSnooze = (dose: ComputedDose, minutes: number) => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + minutes);
    const snoozeTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    executeRecordDose(dose, 'pendiente', { pospuestoHasta: snoozeTime });
    audioService.speak(`Toma pospuesta para las ${snoozeTime}`);
    onRefreshData();
  };

  const handleVoiceRead = (dose: ComputedDose) => {
    audioService.speakDoseReminder(
      activePatient.nombre,
      dose.medicamento.nombreComercial,
      `${dose.dosisCantidad} ${dose.unidadDosis}`,
      dose.indicaciones
    );
  };

  // Group doses by time block (Mañana, Tarde, Noche, Madrugada)
  const groupDosesByPeriod = (doses: ComputedDose[]) => {
    const morning: ComputedDose[] = [];
    const afternoon: ComputedDose[] = [];
    const evening: ComputedDose[] = [];
    const night: ComputedDose[] = [];

    doses.forEach(dose => {
      const h = parseInt(dose.horaProgramada.split(':')[0], 10);
      if (h >= 6 && h < 12) morning.push(dose);
      else if (h >= 12 && h < 18) afternoon.push(dose);
      else if (h >= 18 && h <= 23) evening.push(dose);
      else night.push(dose);
    });

    return [
      { name: 'Mañana (06:00 - 12:00)', icon: '🌅', items: morning },
      { name: 'Tarde (12:00 - 18:00)', icon: '☀️', items: afternoon },
      { name: 'Noche (18:00 - 24:00)', icon: '🌙', items: evening },
      { name: 'Madrugada (00:00 - 06:00)', icon: '🌌', items: night },
    ].filter(g => g.items.length > 0);
  };

  const doseGroups = groupDosesByPeriod(dailyDoses);

  return (
    <div className={`space-y-6 ${accessibilityMode ? 'text-lg' : ''}`}>
      {/* 1. Active Patient Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-cream-100 via-cream-100 to-cream-200/80 border border-cream-200 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={activePatient.fotoUrl || avatarFromName(activePatient.nombre)}
                alt={activePatient.nombre}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-2 ring-terracotta-500/50 shadow-md"
              />
              <button
                onClick={onOpenPatientSwitcher}
                className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-terracotta-500 text-white font-bold shadow-md hover:bg-terracotta-400 transition-colors"
                title="Cambiar paciente"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-coffee-900 tracking-tight">
                  {activePatient.nombre}
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-cream-200 text-coffee-600 font-bold border border-coffee-200">
                  {age} años
                </span>
                {activePatient.habitacionOCama && (
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-800 font-semibold border border-blue-500/20">
                    📍 {activePatient.habitacionOCama}
                  </span>
                )}
              </div>

              <p className="text-xs text-coffee-500">
                Cuidador responsable: <span className="text-coffee-700 font-medium">{activePatient.cuidadorResponsable}</span>
              </p>

              {/* Allergy / Chronic badges */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                {(activePatient.alergias || []).length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-800 border border-rose-500/30 flex items-center gap-1 font-bold">
                    <AlertTriangle className="w-3 h-3 text-rose-400" />
                    Alergias: {(activePatient.alergias || []).join(', ')}
                  </span>
                )}
                {(activePatient.padecimientosCronicos || []).map((pad, i) => (
                  <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-cream-200 text-coffee-600 border border-coffee-200">
                    {pad}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Emergency / Tone Card */}
          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-cream-200">
            {activePatient.contactoEmergencia && (
              <a
                href={`tel:${activePatient.contactoEmergencia.telefono || ''}`}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-800 border border-rose-500/30 text-xs font-bold transition-colors"
                title={`Llamar a ${activePatient.contactoEmergencia.nombre || 'emergencia'}`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
                <span>SOS: {activePatient.contactoEmergencia.nombre} ({activePatient.contactoEmergencia.telefono})</span>
              </a>
            )}

            <button
              onClick={() => audioService.playTone(activePatient.tonoNotificacion || 'carillon_suave')}
              className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-lg bg-cream-200 hover:bg-coffee-200 text-coffee-500 hover:text-coffee-700 border border-coffee-200/80 transition-colors"
            >
              <Volume2 className="w-3 h-3 text-terracotta-400" />
              <span>Tono: {activePatient.tonoNotificacion ? activePatient.tonoNotificacion.replace('_', ' ') : 'Estándar'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Overdue Past Doses Alert Banner (Prominent Warning) */}
      {overduePastDoses.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-200 via-amber-100 to-cream-100 border border-amber-500/40 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-800 border border-amber-500/30 shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-coffee-900 flex items-center gap-2">
                ¡Atención! Hay {overduePastDoses.length} tomas atrasadas de días anteriores
              </h3>
              <p className="text-xs text-amber-800/90">
                Tomas pendientes que no fueron confirmadas en fechas previas. Regularízalas para mantener el historial clínico exacto.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowOverdueModal(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-xs font-black transition-colors shadow-md shadow-amber-500/20 whitespace-nowrap self-start sm:self-center"
          >
            Revisar y Regularizar ({overduePastDoses.length})
          </button>
        </div>
      )}

      {/* 3. Drug Interaction Alerts (if any) */}
      {drugAlerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-rose-100 border border-rose-500/30 space-y-2">
          <div className="flex items-center gap-2 text-rose-700 text-xs font-bold">
            <AlertOctagon className="w-4 h-4 text-rose-500" />
            Alerta de Farmacovigilancia ({drugAlerts.length} detectadas)
          </div>
          <div className="space-y-1.5">
            {drugAlerts.map((alert, idx) => (
              <div key={idx} className="text-xs text-coffee-600 pl-6 border-l-2 border-rose-500/50 py-0.5">
                <span className="font-semibold text-rose-700">{alert.descripcion}</span>
                <p className="text-[11px] text-coffee-500">{alert.recomendacion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. Date Navigator Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-cream-100/90 border border-cream-200 shadow-md">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevDay}
            className="p-2 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-600 hover:text-coffee-900 border border-coffee-200 transition-colors"
            title="Día anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="text-sm sm:text-base font-extrabold text-coffee-900 capitalize">
                {isToday ? 'Hoy' : formatHumanDate(selectedDate)}
              </span>
              {isToday && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-terracotta-500/20 text-terracotta-800 font-bold border border-terracotta-500/30">
                  En Curso
                </span>
              )}
            </div>
            <p className="text-xs text-coffee-500">{formatHumanDate(selectedDate)}</p>
          </div>

          <button
            onClick={handleNextDay}
            className="p-2 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-600 hover:text-coffee-900 border border-coffee-200 transition-colors"
            title="Día siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Date input & "Hoy" button */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {!isToday && (
            <button
              onClick={handleSetToday}
              className="px-3 py-1.5 rounded-xl bg-terracotta-500/10 hover:bg-terracotta-500/20 text-terracotta-400 border border-terracotta-500/30 text-xs font-bold transition-colors"
            >
              Ir a Hoy
            </button>
          )}

          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500 font-mono"
            />
          </div>

          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-md shadow-blue-600/20"
            title="Registrar una toma que no estaba programada en el horario habitual"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Toma Extra</span>
          </button>
        </div>
      </div>

      {/* 5. Stat Counter Cards (Pendientes, Tomadas, Omitidas) */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {/* Pendientes Card (Amber) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-amber-950/20 to-cream-100 border border-amber-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-amber-700">Pendientes</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-black text-coffee-900">{pendientes}</span>
            <span className="text-xs text-coffee-500">/ {totalDoses}</span>
          </div>
          <p className="text-[11px] text-coffee-500 mt-1 hidden sm:block">Dosis por administrar</p>
        </div>

        {/* Tomadas Card (Emerald) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-emerald-950/20 to-cream-100 border border-emerald-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-emerald-700">Tomadas</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-black text-emerald-400">{tomadas}</span>
            <span className="text-xs text-coffee-500">/ {totalDoses}</span>
          </div>
          <p className="text-[11px] text-coffee-500 mt-1 hidden sm:block">Cumplidas con éxito</p>
        </div>

        {/* Omitidas Card (Rose/Gray) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-b from-rose-950/20 to-cream-100 border border-rose-500/30 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-rose-700">Omitidas</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-4xl font-black text-rose-400">{omitidas}</span>
            <span className="text-xs text-coffee-500">/ {totalDoses}</span>
          </div>
          <p className="text-[11px] text-coffee-500 mt-1 hidden sm:block">No administradas</p>
        </div>
      </div>

      {/* Adherence Progress Bar */}
      <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-coffee-600 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
            Adherencia del día
          </span>
          <span className="font-black text-emerald-400 font-mono text-sm">
            {adherenciaPorcentaje}%
          </span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-cream-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500 rounded-full"
            style={{ width: `${adherenciaPorcentaje}%` }}
          />
        </div>
      </div>

      {/* 6. Section "Tomas del Día" */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Pill className="w-5 h-5 text-terracotta-400" />
            <h2 className="text-lg font-bold text-coffee-900">Tomas del Día</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-coffee-600 font-semibold">
              {dailyDoses.length} programadas
            </span>
          </div>
        </div>

        {dailyDoses.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-cream-100/60 border border-cream-200/80 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center text-coffee-500 mx-auto">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-coffee-900">Sin tomas programadas</h3>
            <p className="text-xs text-coffee-500 max-w-sm mx-auto">
              No hay medicamentos agendados para este paciente en la fecha seleccionada ({formatHumanDate(selectedDate)}).
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {doseGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-coffee-500 uppercase tracking-wider">
                  <span>{group.icon}</span>
                  <span>{group.name}</span>
                  <div className="h-px bg-cream-200 flex-1 ml-2" />
                </div>

                <div className="space-y-3">
                  {group.items.map((dose) => {
                    const isTaken = dose.estado === 'tomada';
                    const isOmitted = dose.estado === 'omitida';
                    const isOverdue = dose.estado === 'atrasada';
                    const isPending = dose.estado === 'pendiente';

                    return (
                      <div
                        key={dose.uniqueId}
                        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                          isTaken
                            ? 'bg-emerald-100 border-emerald-500/30'
                            : isOmitted
                            ? 'bg-rose-100 border-rose-500/30 opacity-75'
                            : isOverdue
                            ? 'bg-amber-100 border-amber-500/40 ring-1 ring-amber-500/20 shadow-md shadow-amber-500/25'
                            : 'bg-cream-100 border-cream-200 hover:border-coffee-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          {/* Left info */}
                          <div className="flex items-start gap-3.5">
                            {/* Time Badge */}
                            <div className={`p-2.5 rounded-xl font-mono font-black text-center shrink-0 border ${
                              isTaken
                                ? 'bg-emerald-500/20 text-emerald-800 border-emerald-500/30'
                                : isOverdue
                                ? 'bg-amber-500/20 text-amber-800 border-amber-500/40'
                                : isOmitted
                                ? 'bg-rose-500/20 text-rose-800 border-rose-500/30'
                                : 'bg-cream-200 text-coffee-900 border-coffee-200'
                            }`}>
                              <span className="text-sm sm:text-base block">{dose.horaProgramada}</span>
                              <span className="text-[9px] uppercase tracking-wider block opacity-70">
                                {dose.tipo === 'extra_manual' ? 'EXTRA' : 'HORA'}
                              </span>
                            </div>

                            {/* Med Details */}
                            <div className="space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-base font-bold text-coffee-900">
                                  {dose.medicamento.nombreComercial}
                                </h3>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-coffee-600 font-semibold border border-coffee-200">
                                  {dose.dosisCantidad} {dose.unidadDosis}
                                </span>
                                <span className="text-[10px] px-2 py-0.5 rounded bg-cream-200 text-coffee-500 capitalize">
                                  Vía {dose.viaAdministracion}
                                </span>
                                {dose.tipo === 'extra_manual' && (
                                  <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-blue-800 font-bold border border-blue-500/30">
                                    Toma Manual
                                  </span>
                                )}
                              </div>

                              <p className="text-xs text-coffee-500">
                                {dose.medicamento.sustanciaActiva} • {dose.medicamento.concentracion} ({dose.medicamento.presentacion})
                              </p>

                              {dose.indicaciones && (
                                <p className="text-xs text-terracotta-400/90 font-medium">
                                  💡 {dose.indicaciones}
                                </p>
                              )}

                              {isTaken && dose.horaReal && (
                                <p className="text-xs text-emerald-400 font-bold flex items-center gap-1 pt-0.5">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Tomada a las {dose.horaReal}
                                </p>
                              )}

                              {isOmitted && dose.motivoOmision && (
                                <p className="text-xs text-rose-400 font-medium flex items-center gap-1 pt-0.5">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Omitida: {dose.motivoOmision}
                                </p>
                              )}

                              {dose.pospuestoHasta && (
                                <p className="text-xs text-amber-400 font-medium flex items-center gap-1 pt-0.5">
                                  <Timer className="w-3.5 h-3.5" />
                                  Pospuesta para las {dose.pospuestoHasta}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Right action buttons (with anti-duplication security) */}
                          <div className="flex flex-wrap items-center gap-2 self-end sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0 border-cream-200/80 w-full sm:w-auto justify-end">
                            {/* Voice Button */}
                            <button
                              type="button"
                              onClick={() => handleVoiceRead(dose)}
                              className="p-2 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-500 hover:text-terracotta-400 border border-coffee-200 transition-colors"
                              title="Escuchar indicaciones en voz alta"
                            >
                              <Volume2 className="w-4 h-4" />
                            </button>

                            {isTaken ? (
                              /* Verified Taken Pill - Anti-duplicity Lock */
                              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 text-emerald-800 border border-emerald-500/40 text-xs font-black shadow-sm">
                                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                                <span>Dosis Registrada</span>
                              </div>
                            ) : (
                              <>
                                {/* Snooze Options */}
                                <div className="relative group">
                                  <button
                                    type="button"
                                    onClick={() => handleSnooze(dose, 15)}
                                    className="px-2.5 py-2 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-600 text-xs font-semibold border border-coffee-200 transition-colors"
                                    title="Posponer 15 minutos"
                                  >
                                    +15m
                                  </button>
                                </div>

                                {/* Omit Button */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenOmission(dose)}
                                  className="px-3 py-2 rounded-xl bg-cream-200 hover:bg-rose-100 text-coffee-500 hover:text-rose-800 border border-coffee-200 hover:border-rose-500/30 text-xs font-semibold transition-colors"
                                >
                                  Omitir
                                </button>

                                {/* Primary Mark Taken Button */}
                                <button
                                  type="button"
                                  onClick={() => handleMarkAsTaken(dose)}
                                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-400 hover:to-terracotta-500 text-white font-black text-xs transition-all shadow-lg shadow-terracotta-500/20 hover:scale-102"
                                >
                                  <CheckCircle2 className="w-4 h-4 text-white" />
                                  <span>Tomar Dosis</span>
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <ManualDoseModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        patientName={activePatient.nombre}
        patientId={activePatient.id}
        medicines={medicines}
        onAddMedicine={onRefreshData}
        onSaveManualDose={(data) => {
          const med = medicines.find(m => m.id === data.medicamentoId);
          if (!med) return;
          const newDose: ComputedDose = {
            uniqueId: `extra_${Date.now()}`,
            pacienteId: activePatient.id,
            recetaId: 'extra',
            prescripcionItemId: 'extra',
            medicamentoId: med.id,
            medicamento: med,
            dosisCantidad: 1,
            unidadDosis: med.unidadMedida,
            viaAdministracion: 'oral',
            indicaciones: data.observaciones,
            fecha: data.fecha,
            horaProgramada: data.hora,
            estado: 'tomada',
            tipo: 'extra_manual',
            stockDescontado: data.descontarStock
          };
          executeRecordDose(newDose, 'tomada', { observaciones: data.observaciones });
          audioService.playTone(activePatient.tonoNotificacion);
          onRefreshData();
        }}
      />

      <OmissionReasonModal
        isOpen={!!omissionDose}
        onClose={() => setOmissionDose(null)}
        dose={omissionDose}
        onConfirmOmission={handleConfirmOmission}
      />

      <OverdueDosesModal
        isOpen={showOverdueModal}
        onClose={() => setShowOverdueModal(false)}
        overdueDoses={overduePastDoses}
        patientName={activePatient.nombre}
        onMarkDose={(dose, action) => {
          executeRecordDose(dose, action);
          onRefreshData();
        }}
        onBulkResolve={(action) => {
          overduePastDoses.forEach(dose => {
            executeRecordDose(dose, action);
          });
          onRefreshData();
          setShowOverdueModal(false);
        }}
      />
    </div>
  );
};
