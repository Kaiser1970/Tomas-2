import React, { useCallback, useEffect, useState } from 'react';
import { BellRing, BatteryCharging, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { storageService } from '../services/storageService';
import {
  ReminderStatus,
  getReminderStatus,
  isNativeApp,
  openBatterySettings,
  openExactAlarmSettings,
  openNotificationSettings,
  requestReminderPermissions,
  rescheduleReminders,
  sendTestReminder,
} from '../services/reminderService';

const Row: React.FC<{ ok: boolean | null; label: string; children?: React.ReactNode }> = ({ ok, label, children }) => (
  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700/70">
    <div className="flex items-center gap-2 min-w-0">
      {ok === null ? (
        <span className="w-4 h-4 rounded-full bg-slate-600 shrink-0" />
      ) : ok ? (
        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      )}
      <span className="text-xs text-slate-200">{label}</span>
    </div>
    {children}
  </div>
);

const ActionButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    type="button"
    {...props}
    className="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-100 text-[11px] font-semibold shrink-0"
  >
    {children}
  </button>
);

export const ReminderSettingsCard: React.FC = () => {
  const [status, setStatus] = useState<ReminderStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => setStatus(await getReminderStatus()), []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!isNativeApp()) {
    return (
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <BellRing className="w-4 h-4 text-emerald-400" />
          Recordatorios de dosis
        </h4>
        <p className="text-[11px] text-slate-400">
          Los avisos con la app cerrada solo funcionan en la aplicación instalada en el celular Android.
        </p>
      </div>
    );
  }

  const handleTest = async () => {
    const patient = storageService.getPatients().find(p => p.id === storageService.getActivePatientId());
    const ok = await sendTestReminder(patient?.tonoNotificacion);
    setMessage(
      ok
        ? 'Listo: en unos 8 segundos llegará un aviso de prueba. Cierra la app para comprobar que suena.'
        : 'No se pudo enviar. Activa el permiso de notificaciones.'
    );
  };

  const handleResync = async () => {
    const count = await rescheduleReminders();
    await refresh();
    setMessage(`Recordatorios actualizados (${count} avisos programados).`);
  };

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
        <BellRing className="w-4 h-4 text-emerald-400" />
        Recordatorios de dosis (con la app cerrada)
      </h4>

      <div className="space-y-2">
        <Row ok={status ? status.notifications === 'granted' : null} label="Permiso de notificaciones">
          {status && status.notifications !== 'granted' && (
            <ActionButton
              onClick={async () => {
                const granted = await requestReminderPermissions();
                if (!granted) await openNotificationSettings();
                await refresh();
              }}
            >
              Activar
            </ActionButton>
          )}
        </Row>

        <Row ok={status ? status.exactAlarms !== 'denied' : null} label="Alarmas a la hora exacta">
          {status && status.exactAlarms === 'denied' && (
            <ActionButton onClick={() => void openExactAlarmSettings()}>Permitir</ActionButton>
          )}
        </Row>

        <Row ok={status ? status.batteryUnrestricted !== false : null} label="Sin restricción de batería">
          {status && status.batteryUnrestricted === false && (
            <ActionButton onClick={() => void openBatterySettings()}>Configurar</ActionButton>
          )}
        </Row>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed">
        <BatteryCharging className="w-3.5 h-3.5 inline mr-1 text-amber-400" />
        Para que los avisos no se pierdan, permite que MediControl funcione sin restricción de batería (en Xiaomi,
        Huawei, Samsung u otras marcas también activa "Inicio automático" o "Permitir actividad en segundo plano").
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleTest}
          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
        >
          Enviar aviso de prueba
        </button>
        <button
          type="button"
          onClick={handleResync}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-600 flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Actualizar recordatorios
        </button>
      </div>

      {status && (
        <p className="text-[11px] text-slate-500">Avisos programados ahora: {status.pendingCount}</p>
      )}
      {message && <p className="text-[11px] text-emerald-300">{message}</p>}
    </div>
  );
};
