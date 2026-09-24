import { avatarFromName } from '../services/avatarService';
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
  Bell,
  Settings
} from 'lucide-react';
import { isNativeApp } from '../services/reminderService';

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
  onOpenSettings?: () => void;
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
  onOpenPromptModal,
  onOpenSettings
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
    <header className="sticky top-0 z-40 bg-[#F8F1E1]/95 backdrop-blur-md border-b border-cream-300/80 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top bar: Brand + Active Patient Switcher + Controls */}
        <div className="flex items-center justify-between py-3 gap-3">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-terracotta-400 to-terracotta-700 flex items-center justify-center text-white font-black shadow-lg shadow-terracotta-500/20">
              <Pill className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-coffee-900 flex items-center gap-1.5">
                  MediControl
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-terracotta-500/20 text-terracotta-800 font-bold border border-terracotta-500/30">
                    PRO
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-coffee-500 font-medium hidden sm:block">
                Control de Medicamentos y Adherencia
              </p>
            </div>
          </div>

          {/* Active Patient Switcher Pill */}
          {activePatient && (
            <button
              onClick={onOpenPatientSwitcher}
              className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-cream-200/80 hover:bg-cream-200 border border-coffee-200/80 hover:border-terracotta-500/50 transition-all shadow-md group"
              title="Cambiar de paciente activo"
            >
              <div className="relative">
                <img
                  src={activePatient.fotoUrl || avatarFromName(activePatient.nombre)}
                  alt={activePatient.nombre}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-terracotta-500/60"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-terracotta-400 rounded-full ring-2 ring-cream-100 animate-pulse" />
              </div>

              <div className="text-left hidden xs:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-coffee-900 group-hover:text-terracotta-700 transition-colors max-w-[140px] truncate">
                    {activePatient.nombre}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-coffee-200 text-coffee-600 font-semibold">
                    {age}a
                  </span>
                </div>
                <span className="text-[10px] text-coffee-500 flex items-center gap-1">
                  <span>Tono: {activePatient.tonoNotificacion ? activePatient.tonoNotificacion.replace('_', ' ') : 'Estándar'}</span>
                  <ChevronDown className="w-3 h-3 text-coffee-500 group-hover:text-terracotta-400 transition-colors" />
                </span>
              </div>

              <div className="p-1 rounded-lg bg-coffee-200/60 text-terracotta-400 group-hover:bg-terracotta-500/20 transition-colors">
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
                className="p-2 rounded-xl bg-cream-200/80 hover:bg-cream-200 text-coffee-600 hover:text-terracotta-400 border border-coffee-200 transition-colors"
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
                    : 'bg-cream-200/80 border-coffee-200 text-coffee-500 hover:text-coffee-700'
                }`}
                title="Alertas de Inventario / Resurtido"
              >
                <Bell className="w-4 h-4" />
                {alertCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white font-black text-[9px] rounded-full flex items-center justify-center ring-2 ring-cream-100">
                    {alertCount}
                  </span>
                )}
              </button>

              {/* Stock dropdown */}
              {showStockMenu && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-cream-100 border border-cream-200 shadow-2xl p-3 z-50 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-cream-200">
                    <span className="text-xs font-bold text-coffee-900 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      Resurtido de Farmacia ({alertCount})
                    </span>
                    <button
                      onClick={() => setShowStockMenu(false)}
                      className="text-[10px] text-coffee-500 hover:text-coffee-900"
                    >
                      Cerrar
                    </button>
                  </div>
                  <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                    {lowStockMedicines.length === 0 ? (
                      <p className="text-xs text-coffee-500 text-center py-2">Stock en niveles óptimos 👍</p>
                    ) : (
                      lowStockMedicines.map(med => (
                        <div key={med.id} className="p-2 rounded-lg bg-amber-100 border border-amber-500/20 text-xs">
                          <div className="flex items-center justify-between font-semibold text-coffee-700">
                            <span>{med.nombreComercial}</span>
                            <span className="text-rose-400">{med.stockActual} {med.unidadMedida}</span>
                          </div>
                          <p className="text-[10px] text-coffee-500">Mínimo sugerido: {med.stockMinimoAlerta} {med.unidadMedida}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setShowStockMenu(false);
                      onTabChange('medicamentos');
                    }}
                    className="w-full mt-2 py-1.5 text-center text-xs font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 rounded-lg transition-colors"
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
                  : 'bg-cream-200/80 text-coffee-500 hover:text-coffee-700 border-coffee-200'
              }`}
              title={accessibilityMode ? 'Modo Accesibilidad Senior (Activo)' : 'Activar Modo Accesibilidad Senior (Texto grande / Alto contraste)'}
            >
              <Eye className="w-4 h-4" />
            </button>

            {/* Settings (recordatorios, respaldo, mensualidad) */}
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 rounded-xl border bg-cream-200/80 text-coffee-600 hover:text-coffee-900 border-coffee-200 transition-colors"
                title="Configuración: recordatorios, respaldo y mensualidad"
                aria-label="Configuración"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {/* Prompt Download & Spec button */}
            {onOpenPromptModal && !isNativeApp() && (
              <button
                onClick={onOpenPromptModal}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-terracotta-500/10 hover:bg-terracotta-500/20 border border-terracotta-500/30 text-terracotta-800 transition-colors text-xs font-semibold cursor-pointer shadow-sm"
                title="Ver y Descargar Prompt Técnico / Especificación del Sistema"
              >
                <FileText className="w-3.5 h-3.5 text-terracotta-400" />
                <span className="hidden sm:inline">Prompt .TXT</span>
              </button>
            )}

            {/* Role Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cream-200/80 hover:bg-cream-200 border border-coffee-200 text-xs font-medium text-coffee-600 transition-colors"
              >
                <UserRound className="w-3.5 h-3.5 text-terracotta-400" />
                <span className="capitalize hidden xl:inline">{userRole.replace('_', ' ')}</span>
                <ChevronDown className="w-3 h-3 text-coffee-500" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-cream-100 border border-cream-200 shadow-2xl p-1 z-50">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-coffee-500 uppercase tracking-wider">
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
                          ? 'bg-terracotta-500/10 text-terracotta-400 font-bold'
                          : 'text-coffee-600 hover:bg-cream-200 hover:text-coffee-900'
                      }`}
                    >
                      <span>{item.label}</span>
                      {userRole === item.role && <span className="w-1.5 h-1.5 rounded-full bg-terracotta-400" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-2 border-t border-cream-200/60">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white shadow-md shadow-terracotta-500/20'
                    : 'text-coffee-500 hover:text-coffee-700 hover:bg-cream-200/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-coffee-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
