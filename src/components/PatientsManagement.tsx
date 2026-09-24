import { PRESET_AVATARS } from '../services/avatarService';
import React, { useState } from 'react';
import { Patient, NotificationSound } from '../types';
import { calculateAge } from '../services/scheduleEngine';
import { audioService } from '../services/audioService';
import { 
  Users, 
  UserPlus, 
  Edit, 
  Trash2, 
  Volume2, 
  Phone, 
  AlertTriangle, 
  Heart, 
  Check, 
  X, 
  Search,
  Building
} from 'lucide-react';

interface PatientsManagementProps {
  patients: Patient[];
  activePatientId: string;
  onSelectActivePatient: (id: string) => void;
  onAddPatient: (patient: Patient) => void;
  onUpdatePatient: (patient: Patient) => void;
  onDeletePatient: (id: string) => void;
}

const TONES_LIST: { id: NotificationSound; name: string }[] = [
  { id: 'campana_zen', name: 'Campana Zen (Campana armónica)' },
  { id: 'pulso_clinico', name: 'Pulso Clínico (2 tonos suaves)' },
  { id: 'carillon_suave', name: 'Carillón Suave (Secuencia pentatónica)' },
  { id: 'melodia_alerta', name: 'Melodía Alerta (Triple tono distintivo)' },
  { id: 'bip_digital', name: 'Bip Digital (Reloj inteligente)' },
  { id: 'flauta_calma', name: 'Flauta Calma (Tono de viento relajante)' },
];



export const PatientsManagement: React.FC<PatientsManagementProps> = ({
  patients,
  activePatientId,
  onSelectActivePatient,
  onAddPatient,
  onUpdatePatient,
  onDeletePatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('1960-01-01');
  const [sexo, setSexo] = useState<'M' | 'F' | 'Otro'>('M');
  const [fotoUrl, setFotoUrl] = useState(PRESET_AVATARS[0]);
  const [alergiasInput, setAlergiasInput] = useState('');
  const [padecimientosInput, setPadecimientosInput] = useState('');
  const [contactoNombre, setContactoNombre] = useState('');
  const [contactoTelefono, setContactoTelefono] = useState('');
  const [contactoParentesco, setContactoParentesco] = useState('');
  const [cuidadorResponsable, setCuidadorResponsable] = useState('');
  const [tonoNotificacion, setTonoNotificacion] = useState<NotificationSound>('carillon_suave');
  const [habitacionOCama, setHabitacionOCama] = useState('');

  const activePatients = patients.filter(p => p.activo);
  const filtered = activePatients.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.cuidadorResponsable || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.alergias || []).some(a => a.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenAdd = () => {
    setEditingPatient(null);
    setNombre('');
    setFechaNacimiento('1955-06-15');
    setSexo('M');
    setFotoUrl(PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)]);
    setAlergiasInput('');
    setPadecimientosInput('');
    setContactoNombre('');
    setContactoTelefono('');
    setContactoParentesco('Familiar');
    setCuidadorResponsable('Familiar principal');
    setTonoNotificacion('carillon_suave');
    setHabitacionOCama('');
    setShowModal(true);
  };

  const handleOpenEdit = (p: Patient) => {
    setEditingPatient(p);
    setNombre(p.nombre);
    setFechaNacimiento(p.fechaNacimiento);
    setSexo(p.sexo);
    setFotoUrl(p.fotoUrl || PRESET_AVATARS[0]);
    setAlergiasInput((p.alergias || []).join(', '));
    setPadecimientosInput((p.padecimientosCronicos || []).join(', '));
    setContactoNombre(p.contactoEmergencia?.nombre || '');
    setContactoTelefono(p.contactoEmergencia?.telefono || '');
    setContactoParentesco(p.contactoEmergencia?.parentesco || '');
    setCuidadorResponsable(p.cuidadorResponsable || '');
    setTonoNotificacion(p.tonoNotificacion || 'carillon_suave');
    setHabitacionOCama(p.habitacionOCama || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const alergias = alergiasInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const padecimientos = padecimientosInput
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingPatient) {
      const updated: Patient = {
        ...editingPatient,
        nombre: nombre.trim(),
        fechaNacimiento,
        sexo,
        fotoUrl,
        alergias,
        padecimientosCronicos: padecimientos,
        contactoEmergencia: {
          nombre: contactoNombre.trim(),
          telefono: contactoTelefono.trim(),
          parentesco: contactoParentesco.trim()
        },
        cuidadorResponsable: cuidadorResponsable.trim(),
        tonoNotificacion,
        habitacionOCama: habitacionOCama.trim() || undefined
      };
      onUpdatePatient(updated);
    } else {
      const newPatient: Patient = {
        id: `pat-${Date.now()}`,
        nombre: nombre.trim(),
        fechaNacimiento,
        sexo,
        fotoUrl,
        alergias,
        padecimientosCronicos: padecimientos,
        contactoEmergencia: {
          nombre: contactoNombre.trim(),
          telefono: contactoTelefono.trim(),
          parentesco: contactoParentesco.trim()
        },
        cuidadorResponsable: cuidadorResponsable.trim(),
        tonoNotificacion,
        habitacionOCama: habitacionOCama.trim() || undefined,
        activo: true,
        creadoEn: new Date().toISOString()
      };
      onAddPatient(newPatient);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-coffee-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-terracotta-400" />
            Gestión de Pacientes
          </h2>
          <p className="text-xs text-coffee-500">
            Administra los perfiles de pacientes, cuidadores, contactos de emergencia y tonos de alerta
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white font-black text-xs hover:opacity-95 transition-opacity shadow-lg shadow-terracotta-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Añadir Paciente</span>
        </button>
      </div>

      {/* Search bar */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar paciente por nombre, alergia o cuidador..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100 border border-cream-200 text-coffee-900 text-xs placeholder:text-coffee-400 focus:outline-none focus:border-terracotta-500"
        />
        <Search className="w-4 h-4 text-coffee-500 absolute left-3.5 top-3" />
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((patient) => {
          const isActive = patient.id === activePatientId;
          const age = calculateAge(patient.fechaNacimiento);

          return (
            <div
              key={patient.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                isActive
                  ? 'bg-terracotta-100/20 border-terracotta-500/50 shadow-lg shadow-terracotta-100/30'
                  : 'bg-cream-100 border-cream-200 hover:border-coffee-200'
              }`}
            >
              <div className="flex items-start gap-4">
                <img
                  src={patient.fotoUrl || PRESET_AVATARS[0]}
                  alt={patient.nombre}
                  className="w-16 h-16 rounded-2xl object-cover ring-2 ring-coffee-200 shrink-0"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-coffee-900 truncate">{patient.nombre}</h3>
                    {isActive && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-terracotta-500/20 text-terracotta-800 font-bold border border-terracotta-500/30">
                        Activo
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-coffee-500">
                    <span>{age} años ({patient.fechaNacimiento})</span>
                    <span>•</span>
                    <span>Sexo: {patient.sexo}</span>
                    {patient.habitacionOCama && (
                      <span className="text-amber-400 font-medium">📍 {patient.habitacionOCama}</span>
                    )}
                  </div>

                  <p className="text-xs text-coffee-600">
                    Cuidador: <span className="text-coffee-900 font-medium">{patient.cuidadorResponsable}</span>
                  </p>

                  <div className="flex items-center gap-1.5 text-xs text-rose-700">
                    <Phone className="w-3.5 h-3.5 text-rose-400" />
                    <span>SOS: {patient.contactoEmergencia.nombre} ({patient.contactoEmergencia.telefono})</span>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap items-center gap-1 pt-1">
                    {(patient.alergias || []).map((al, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-800 border border-rose-500/20 flex items-center gap-1">
                        <AlertTriangle className="w-2.5 h-2.5" />
                        {al}
                      </span>
                    ))}
                    {(patient.padecimientosCronicos || []).map((pad, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-cream-200 text-coffee-600 border border-coffee-200">
                        {pad}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => audioService.playTone(patient.tonoNotificacion)}
                  className="flex items-center gap-1 text-xs text-coffee-500 hover:text-terracotta-400 transition-colors"
                  title="Probar tono de notificación"
                >
                  <Volume2 className="w-3.5 h-3.5 text-terracotta-400" />
                  <span>Tono: {patient.tonoNotificacion.replace('_', ' ')}</span>
                </button>

                <div className="flex items-center gap-2">
                  {!isActive && (
                    <button
                      onClick={() => onSelectActivePatient(patient.id)}
                      className="px-3 py-1.5 rounded-lg bg-cream-200 hover:bg-terracotta-500 hover:text-white text-coffee-700 text-xs font-bold transition-colors"
                    >
                      Poner Activo
                    </button>
                  )}
                  <button
                    onClick={() => handleOpenEdit(patient)}
                    className="p-1.5 rounded-lg bg-cream-200 hover:bg-coffee-200 text-coffee-600 hover:text-coffee-900 transition-colors"
                    title="Editar paciente"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {patients.length > 1 && (
                    <button
                      onClick={() => {
                        if (confirm(`¿Estás seguro de dar de baja a ${patient.nombre}?`)) {
                          onDeletePatient(patient.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-cream-200 hover:bg-rose-950 text-coffee-500 hover:text-rose-400 transition-colors"
                      title="Dar de baja"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Patient Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-cream-100 border border-cream-200 rounded-3xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-100/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-terracotta-500/10 text-terracotta-400 border border-terracotta-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-coffee-900">
                  {editingPatient ? 'Editar Paciente' : 'Registrar Nuevo Paciente'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-coffee-500 hover:text-coffee-900 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-xs font-semibold text-coffee-600 mb-1">
                  Nombre Completo del Paciente *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Don Roberto Garza Morales"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Sexo
                  </label>
                  <select
                    value={sexo}
                    onChange={(e) => setSexo(e.target.value as 'M' | 'F' | 'Otro')}
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  >
                    <option value="M">Masculino</option>
                    <option value="F">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-coffee-600 mb-1.5">
                  Foto o Avatar de Perfil
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {PRESET_AVATARS.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt="avatar"
                      onClick={() => setFotoUrl(url)}
                      className={`w-11 h-11 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                        fotoUrl === url ? 'border-terracotta-500 ring-2 ring-terracotta-500/40' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Allergies & Chronic */}
              <div>
                <label className="block text-xs font-semibold text-coffee-600 mb-1">
                  Alergias Conocidas (separadas por comas)
                </label>
                <input
                  type="text"
                  value={alergiasInput}
                  onChange={(e) => setAlergiasInput(e.target.value)}
                  placeholder="Ej. Penicilina, AINES, Sulfitos, Látex"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-coffee-600 mb-1">
                  Padecimientos Crónicos / Diagnósticos (separados por comas)
                </label>
                <input
                  type="text"
                  value={padecimientosInput}
                  onChange={(e) => setPadecimientosInput(e.target.value)}
                  placeholder="Ej. Hipertensión Arterial, Diabetes Tipo 2, Asma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                />
              </div>

              {/* Emergency Contact */}
              <div className="p-3.5 rounded-2xl bg-cream-200/40 border border-cream-200 space-y-3">
                <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-rose-400" />
                  Contacto de Emergencia SOS
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    required
                    value={contactoNombre}
                    onChange={(e) => setContactoNombre(e.target.value)}
                    placeholder="Nombre contacto"
                    className="px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  />
                  <input
                    type="tel"
                    required
                    value={contactoTelefono}
                    onChange={(e) => setContactoTelefono(e.target.value)}
                    placeholder="Teléfono móvil"
                    className="px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  />
                  <input
                    type="text"
                    value={contactoParentesco}
                    onChange={(e) => setContactoParentesco(e.target.value)}
                    placeholder="Parentesco (Hija, etc.)"
                    className="px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  />
                </div>
              </div>

              {/* Caregiver & Clinic Room */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Cuidador Responsable
                  </label>
                  <input
                    type="text"
                    value={cuidadorResponsable}
                    onChange={(e) => setCuidadorResponsable(e.target.value)}
                    placeholder="Ej. María Mendoza"
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Habitación / Cama (Clínica)
                  </label>
                  <input
                    type="text"
                    value={habitacionOCama}
                    onChange={(e) => setHabitacionOCama(e.target.value)}
                    placeholder="Ej. Hab. 204-A"
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  />
                </div>
              </div>

              {/* Custom Notification Tone Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-coffee-600">
                    Tono de Notificación Personalizado
                  </label>
                  <button
                    type="button"
                    onClick={() => audioService.playTone(tonoNotificacion)}
                    className="flex items-center gap-1 text-[11px] text-terracotta-400 hover:text-terracotta-700 font-bold"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Probar tono ahora
                  </button>
                </div>
                <select
                  value={tonoNotificacion}
                  onChange={(e) => {
                    const t = e.target.value as NotificationSound;
                    setTonoNotificacion(t);
                    audioService.playTone(t);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                >
                  {TONES_LIST.map((tone) => (
                    <option key={tone.id} value={tone.id}>
                      {tone.name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-coffee-500 mt-1">
                  Permite identificar de quién es la toma solo por el sonido cuando atiendes a varios pacientes.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-coffee-500 hover:text-coffee-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-400 text-white text-xs font-black transition-colors shadow-lg shadow-terracotta-500/20"
                >
                  {editingPatient ? 'Guardar Cambios' : 'Registrar Paciente'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
