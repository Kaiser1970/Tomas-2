import { avatarFromName } from '../services/avatarService';
import React from 'react';
import { Patient, NotificationSound } from '../types';
import { calculateAge } from '../services/scheduleEngine';
import { audioService } from './../services/audioService';
import { 
  Users, 
  UserCheck, 
  Plus, 
  X, 
  Volume2, 
  AlertTriangle, 
  PhoneCall, 
  HeartHandshake 
} from 'lucide-react';

interface PatientSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  activePatientId: string;
  onSelectPatient: (patientId: string) => void;
  onAddNewPatient: () => void;
}

export const PatientSwitcherModal: React.FC<PatientSwitcherModalProps> = ({
  isOpen,
  onClose,
  patients,
  activePatientId,
  onSelectPatient,
  onAddNewPatient
}) => {
  if (!isOpen) return null;

  const activePatients = patients.filter(p => p.activo);

  const getToneLabel = (tone: NotificationSound) => {
    switch (tone) {
      case 'campana_zen': return 'Campana Zen';
      case 'pulso_clinico': return 'Pulso Clínico';
      case 'carillon_suave': return 'Carillón Suave';
      case 'melodia_alerta': return 'Melodía Alerta';
      case 'bip_digital': return 'Bip Digital';
      case 'flauta_calma': return 'Flauta Calma';
      default: return tone;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-cream-100 border border-cream-200 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-100/90">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-terracotta-500/10 text-terracotta-400 rounded-xl border border-terracotta-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-coffee-900">Seleccionar Paciente Activo</h2>
              <p className="text-xs text-coffee-500">Gestiona múltiples perfiles de pacientes en este dispositivo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-coffee-500 hover:text-coffee-900 hover:bg-cream-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          {activePatients.map((patient) => {
            const isActive = patient.id === activePatientId;
            const age = calculateAge(patient.fechaNacimiento);

            return (
              <div
                key={patient.id}
                onClick={() => {
                  onSelectPatient(patient.id);
                  onClose();
                }}
                className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isActive
                    ? 'bg-terracotta-100/30 border-terracotta-500/60 ring-1 ring-terracotta-500/40 shadow-lg shadow-terracotta-100/40'
                    : 'bg-cream-200/40 border-cream-200 hover:bg-cream-200 hover:border-coffee-200'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative">
                    <img
                      src={patient.fotoUrl || avatarFromName(patient.nombre)}
                      alt={patient.nombre}
                      className="w-14 h-14 rounded-full object-cover border-2 border-coffee-200"
                    />
                    {isActive && (
                      <span className="absolute -bottom-1 -right-1 bg-terracotta-500 text-white p-1 rounded-full text-xs font-bold ring-2 ring-cream-100">
                        <UserCheck className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-coffee-900">{patient.nombre}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-cream-200 text-coffee-600 font-medium border border-coffee-200">
                        {age} años
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-coffee-500">
                      <span className="flex items-center gap-1 text-coffee-600">
                        <HeartHandshake className="w-3.5 h-3.5 text-blue-400" />
                        Cuidador: {patient.cuidadorResponsable}
                      </span>
                      {patient.habitacionOCama && (
                        <span className="text-amber-400 font-medium">
                          📍 {patient.habitacionOCama}
                        </span>
                      )}
                    </div>

                    {/* Allergies / Chronic badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {(patient.alergias || []).length > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-800 border border-rose-500/20 flex items-center gap-1 font-medium">
                          <AlertTriangle className="w-2.5 h-2.5" />
                          Alergias: {(patient.alergias || []).join(', ')}
                        </span>
                      )}
                      {(patient.padecimientosCronicos || []).map((pad, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-cream-200 text-coffee-600 border border-coffee-200">
                          {pad}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Sound & Action */}
                <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-cream-200/80">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      audioService.playTone(patient.tonoNotificacion);
                    }}
                    title={`Probar tono personalizado (${getToneLabel(patient.tonoNotificacion)})`}
                    className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-cream-200 hover:bg-coffee-200 text-coffee-600 border border-coffee-200 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-terracotta-400" />
                    <span>{getToneLabel(patient.tonoNotificacion)}</span>
                  </button>

                  <button
                    type="button"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      isActive
                        ? 'bg-terracotta-500 text-white shadow-md shadow-terracotta-500/20'
                        : 'bg-cream-200 text-coffee-700 hover:bg-terracotta-500 hover:text-white'
                    }`}
                  >
                    {isActive ? 'Activo' : 'Seleccionar'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-cream-200 bg-cream-100/90 flex items-center justify-between">
          <p className="text-xs text-coffee-500">
            Total pacientes: <span className="font-semibold text-coffee-900">{activePatients.length}</span>
          </p>
          <button
            onClick={() => {
              onClose();
              onAddNewPatient();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-lg shadow-terracotta-500/20"
          >
            <Plus className="w-4 h-4" />
            Añadir Nuevo Paciente
          </button>
        </div>
      </div>
    </div>
  );
};
