import React, { useState } from 'react';
import { Patient, UserRole, Medicine, AppTab } from '../types';
import { calculateAge } from '../services/scheduleEngine';
import { 
  Pill, 
  Users, 
  UserRound, 
  Stethoscope, 
  FileText, 
  BarChart3, 
  Volume2, 
  Eye, 
  AlertCircle, 
  ChevronDown, 
  RefreshCw,
  Bell
} from 'lucide-react';

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  activePatient: Patient | undefined;
  onOpenPatientSwitcher: () => void;
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  accessibilityMode: boolean;
  onToggleAccessibility: () => void;
  lowStockCount?: number;
  lowStockMedicines?: Medicine[];
  onReadTodayDosesVoice?: () => void;
  onOpenPromptModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  activePatient,
  onOpenPatientSwitcher,
  userRole,
  onRoleChange,
  accessibilityMode,
  onToggleAccessibility,
  lowStockCount = 0,
  lowStockMedicines = [],
  onReadTodayDosesVoice,
  onOpenPromptModal
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showStockMenu, setShowStockMenu] = useState(false);

  const age = activePatient?.fechaNacimiento ? calculateAge(activePatient.fechaNacimiento) : 0;
  const alertCount = lowStockCount || (lowStockMedicines || []).length;

  const navItems: { id: AppTab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Tomas de Hoy', icon: Pill },
    { id: 'recetas', label: 'Recetas', icon: FileText },
    { id: 'medicamentos', label: 'Medicamentos', icon: Pill },
    { id: 'pacientes', label: 'Pacientes', icon: Users },
    { id: 'doctores', label: 'Doctores', icon: Stethoscope },
    { id: 'reportes', label: 'Historial & Reportes', icon: BarChart3 },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0c121e]/90 backdrop-blur-md border-b border-slate-800/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Brand + Active Patient Switcher + Controls */}
        <div className="flex items-center justify-between py-3 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
              <Pill className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-white flex items-center gap-1.5">
                  MediControl
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                    PRO
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Control de Medicamentos y Adherencia
              </p>
            </div>
          </div>

          {/* Active Patient Switcher Pill */}
          {activePatient && (
            <button
              onClick={onOpenPatientSwitcher}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 hover:border-emerald-500/50 transition-all shadow-md group"
              title="Cambiar de paciente activo"
            >
              <div className="relative">
                <img
                  src={activePatient.fotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                  alt={activePatient.nombre}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/60"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900 animate-pulse" />
              </div>

              <div className="text-left hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white group-hover:text-emerald-300 transition-colors max-w-[140px] truncate">
                    {activePatient.nombre}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-semibold">
                    {age}a
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>Tono: {activePatient.tonoNotificacion ? activePatient.tonoNotificacion.replace('_', ' ') : 'Estándar'}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                </span>
              </div>

              <div className="p-1 rounded-lg bg-slate-700/60 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </div>
            </button>
          )}

          {/* Right Tools: Voice, Stock Alert, Accessibility, Role Selector */}
          <div className="flex items-center gap-2">
            {/* Voice Assistant button */}
            {onReadTodayDosesVoice && (
              <button
                onClick={onReadTodayDosesVoice}
                className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-emerald-400 border border-slate-700 transition-colors"
                title="Leer tomas del día en voz alta (Asistente de voz)"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}

            {/* Low stock alert badge */}
            <div className="relative">
              <button
                onClick={() => {
                  if (lowStockMedicines && lowStockMedicines.length > 0) {
                    setShowStockMenu(!showStockMenu);
                  } else {
                    onTabChange('medicamentos');
                  }
                }}
                className={`p-2 rounded-xl border transition-colors relative ${
                  alertCount > 0
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                    : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
                title="Alertas de Inventario / Resurtido"
              >
                <Bell className="w-4 h-4" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full flex items-center justify-center ring-2 ring-slate-900">
                    {alertCount}
                  </span>
                )}
              </button>

              {/* Stock dropdown */}
              {showStockMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-xs font-bold text-white flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Resurtido de Farmacia ({alertCount})
                    </span>
                    <button
                      onClick={() => setShowStockMenu(false)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {lowStockMedicines.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-2">Stock en niveles óptimos 👍</p>
                    ) : (
                      lowStockMedicines.map(med => (
                        <div key={med.id} className="p-2 rounded-lg bg-amber-950/30 border border-amber-500/20 text-xs">
                          <div className="flex items-center justify-between font-semibold text-slate-200">
                            <span>{med.nombreComercial}</span>
                            <span className="text-rose-400">{med.stockActual} {med.unidadMedida}</span>
                          </div>
                          <p className="text-[10px] text-slate-400">Mínimo sugerido: {med.stockMinimoAlerta} {med.unidadMedida}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowStockMenu(false);
                      onTabChange('medicamentos');
                    }}
                    className="w-full mt-2 py-1.5 text-center text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 rounded-lg transition-colors"
                  >
                    Gestionar Inventario
                  </button>
                </div>
              )}
            </div>

            {/* Accessibility / Senior Mode toggle */}
            <button
              onClick={onToggleAccessibility}
              className={`p-2 rounded-xl border transition-colors ${
                accessibilityMode
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/20'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border-slate-700'
              }`}
              title={accessibilityMode ? 'Modo Accesibilidad Senior (Activo)' : 'Activar Modo Accesibilidad Senior (Texto grande / Alto contraste)'}
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Prompt Download & Spec button */}
            {onOpenPromptModal && (
              <button
                onClick={onOpenPromptModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 transition-colors text-xs font-semibold cursor-pointer shadow-sm"
                title="Ver y Descargar Prompt Técnico / Especificación del Sistema"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Prompt .TXT</span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                <UserRound className="w-3.5 h-3.5 text-emerald-400" />
                <span className="capitalize hidden xl:inline">{userRole.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Modo de Uso
                  </div>
                  {[
                    { role: 'cuidador', label: 'Cuidador Familiar' },
                    { role: 'paciente', label: 'Modo Paciente' },
                    { role: 'enfermero', label: 'Enfermero / Piso' },
                    { role: 'clinica_admin', label: 'Admin Institucional' },
                  ].map(item => (
                    <button
                      key={item.role}
                      onClick={() => {
                        onRoleChange(item.role as UserRole);
                        setShowRoleMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-between ${
                        userRole === item.role
                          ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <span>{item.label}</span>
                      {userRole === item.role && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-slate-800/60">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
