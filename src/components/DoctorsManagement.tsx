import React, { useState } from 'react';
import { Doctor, Prescription } from '../types';
import { 
  Stethoscope, 
  UserPlus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  Building, 
  Award, 
  FileText, 
  Search, 
  X 
} from 'lucide-react';

interface DoctorsManagementProps {
  doctors: Doctor[];
  prescriptions: Prescription[];
  onAddDoctor: (doctor: Doctor) => void;
  onUpdateDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (id: string) => void;
}

export const DoctorsManagement: React.FC<DoctorsManagementProps> = ({
  doctors,
  prescriptions,
  onAddDoctor,
  onUpdateDoctor,
  onDeleteDoctor
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [cedula, setCedula] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [consultorio, setConsultorio] = useState('');

  const activeDoctors = doctors.filter(d => d.activo);
  const filtered = activeDoctors.filter(d =>
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.consultorio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.cedula.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingDoctor(null);
    setNombre('');
    setEspecialidad('Medicina General y Familiar');
    setCedula('');
    setTelefono('');
    setCorreo('');
    setConsultorio('');
    setShowModal(true);
  };

  const handleOpenEdit = (doc: Doctor) => {
    setEditingDoctor(doc);
    setNombre(doc.nombre);
    setEspecialidad(doc.especialidad);
    setCedula(doc.cedula);
    setTelefono(doc.telefono);
    setCorreo(doc.correo);
    setConsultorio(doc.consultorio);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    if (editingDoctor) {
      const updated: Doctor = {
        ...editingDoctor,
        nombre: nombre.trim(),
        especialidad: especialidad.trim(),
        cedula: cedula.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        consultorio: consultorio.trim()
      };
      onUpdateDoctor(updated);
    } else {
      const newDoc: Doctor = {
        id: `doc-${Date.now()}`,
        nombre: nombre.trim(),
        especialidad: especialidad.trim(),
        cedula: cedula.trim(),
        telefono: telefono.trim(),
        correo: correo.trim(),
        consultorio: consultorio.trim(),
        activo: true,
        creadoEn: new Date().toISOString()
      };
      onAddDoctor(newDoc);
    }

    setShowModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Stethoscope className="w-6 h-6 text-emerald-400" />
            Gestión de Médicos y Especialistas
          </h2>
          <p className="text-xs text-slate-400">
            Catálogo de doctores tratantes, cédulas profesionales y consultorios vinculados a recetas
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs hover:opacity-95 transition-opacity shadow-lg shadow-emerald-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Añadir Doctor</span>
        </button>
      </div>

      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar doctor por nombre, especialidad, consultorio o cédula..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doctor) => {
          const linkedPrescriptions = prescriptions.filter(p => p.doctorId === doctor.id && p.activo);

          return (
            <div
              key={doctor.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{doctor.nombre}</h3>
                    <p className="text-xs text-emerald-400 font-semibold">{doctor.especialidad}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-800 text-slate-400">
                    <Stethoscope className="w-4 h-4 text-emerald-400" />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300">
                  {doctor.cedula && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Cédula: <strong className="text-slate-200">{doctor.cedula}</strong></span>
                    </div>
                  )}

                  {doctor.consultorio && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Building className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span>{doctor.consultorio}</span>
                    </div>
                  )}

                  {doctor.telefono && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <a href={`tel:${doctor.telefono}`} className="text-emerald-400 hover:underline">
                        {doctor.telefono}
                      </a>
                    </div>
                  )}

                  {doctor.correo && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <a href={`mailto:${doctor.correo}`} className="text-slate-300 hover:underline truncate">
                        {doctor.correo}
                      </a>
                    </div>
                  )}
                </div>

                <div className="p-2 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-blue-400" />
                    Recetas emitidas:
                  </span>
                  <span className="font-bold text-white font-mono">{linkedPrescriptions.length}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => handleOpenEdit(doctor)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Editar doctor"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {doctors.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`¿Estás seguro de eliminar a ${doctor.nombre}?`)) {
                        onDeleteDoctor(doctor.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Eliminar doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add/Edit Doctor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">
                  {editingDoctor ? 'Editar Doctor' : 'Registrar Nuevo Doctor'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nombre Completo del Doctor *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Dra. Patricia Valenzuela Ramos"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Especialidad *
                  </label>
                  <input
                    type="text"
                    required
                    value={especialidad}
                    onChange={(e) => setEspecialidad(e.target.value)}
                    placeholder="Ej. Cardiología, Geriatría"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cédula Profesional
                  </label>
                  <input
                    type="text"
                    value={cedula}
                    onChange={(e) => setCedula(e.target.value)}
                    placeholder="Ej. CP-8921345"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Consultorio / Hospital / Institución
                </label>
                <input
                  type="text"
                  value={consultorio}
                  onChange={(e) => setConsultorio(e.target.value)}
                  placeholder="Ej. Hospital San José, Consultorio 412"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. +52 81 8345 6789"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    placeholder="Ej. doctor@hospital.com"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
                  {editingDoctor ? 'Guardar Cambios' : 'Registrar Doctor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
