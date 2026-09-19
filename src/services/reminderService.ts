import { Capacitor, registerPlugin } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { LocalNotifications, LocalNotificationSchema } from '@capacitor/local-notifications';
import { storageService } from './storageService';
import { getDosesForPatientAndDate, formatDate } from './scheduleEngine';
import { NotificationSound } from '../types';

/**
 * Recordatorios de dosis con notificaciones LOCALES del sistema operativo (Android).
 * Se programan con AlarmManager, por eso suenan con la app cerrada y sin internet.
 *
 * Estrategia: se programan las próximas dosis pendientes (ventana limitada) y se
 * reprograma todo cada vez que cambian los datos o se abre la app.
 */

interface SystemSettingsPlugin {
  isIgnoringBatteryOptimizations(): Promise<{ value: boolean }>;
  openBatterySettings(): Promise<void>;
  openNotificationSettings(): Promise<void>;
  openAppDetails(): Promise<void>;
}

const SystemSettings = registerPlugin<SystemSettingsPlugin>('SystemSettings');

export const isNativeApp = (): boolean => Capacitor.isNativePlatform();

const TONES: { id: NotificationSound; label: string; file: string }[] = [
  { id: 'campana_zen', label: 'Campana Zen', file: 'campana_zen.wav' },
  { id: 'pulso_clinico', label: 'Pulso Clínico', file: 'pulso_clinico.wav' },
  { id: 'carillon_suave', label: 'Carillón Suave', file: 'carillon_suave.wav' },
  { id: 'melodia_alerta', label: 'Melodía Alerta', file: 'melodia_alerta.wav' },
  { id: 'bip_digital', label: 'Bip Digital', file: 'bip_digital.wav' },
  { id: 'flauta_calma', label: 'Flauta Calma', file: 'flauta_calma.wav' },
];

const CHANNEL_PREFIX = 'dosis_';
const MAX_MAIN_REMINDERS = 120; // avisos de hora de toma programados por adelantado
const MAX_FOLLOWUPS = 60; // avisos de refuerzo (dosis sin confirmar)
const FOLLOWUP_MINUTES = 10;
const HORIZON_DAYS = 14;
const RENEW_NOTICE_ID = 1; // aviso para reabrir la app cuando se acaba la ventana programada

const channelFor = (tone: NotificationSound | undefined): string =>
  CHANNEL_PREFIX + (TONES.some(t => t.id === tone) ? tone : 'carillon_suave');

// Id numérico estable (positivo, cabe en Int de Java) a partir de un texto.
function stableId(text: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  const id = (h >>> 0) & 0x7fffffff;
  return id <= RENEW_NOTICE_ID ? id + 2 : id;
}

let channelsReady = false;
async function ensureChannels(): Promise<void> {
  if (channelsReady) return;
  for (const t of TONES) {
    await LocalNotifications.createChannel({
      id: CHANNEL_PREFIX + t.id,
      name: `Recordatorio de dosis - ${t.label}`,
      description: 'Avisos de hora de toma de medicamentos',
      sound: t.file,
      importance: 5,
      visibility: 0,
      vibration: true,
      lights: true,
    });
  }
  channelsReady = true;
}

export async function requestReminderPermissions(): Promise<boolean> {
  if (!isNativeApp()) return false;
  try {
    let perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') {
      perm = await LocalNotifications.requestPermissions();
    }
    return perm.display === 'granted';
  } catch {
    return false;
  }
}

function toDate(fecha: string, hora: string): Date {
  const [y, m, d] = fecha.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
}

interface Group {
  key: string;
  at: Date;
  patientId: string;
  patientName: string;
  tone: NotificationSound;
  fecha: string;
  hora: string;
  lines: string[];
}

function collectUpcomingGroups(now: Date): Group[] {
  const patients = storageService.getPatients().filter(p => p.activo);
  const groups = new Map<string, Group>();

  for (let offset = 0; offset < HORIZON_DAYS; offset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset);
    const fecha = formatDate(day);

    for (const patient of patients) {
      let doses;
      try {
        doses = getDosesForPatientAndDate(patient.id, fecha);
      } catch {
        continue;
      }
      for (const dose of doses) {
        if (dose.tipo !== 'programada') continue;
        if (dose.estado !== 'pendiente' && dose.estado !== 'atrasada') continue;

        // Si la dosis fue pospuesta, el aviso va a la hora nueva.
        const hora = dose.pospuestoHasta || dose.horaProgramada;
        const at = toDate(fecha, hora);
        if (at.getTime() <= now.getTime() + 5000) continue;

        const key = `${patient.id}|${fecha}|${hora}`;
        const med = dose.medicamento;
        const line = `${med.nombreComercial}${med.concentracion ? ' ' + med.concentracion : ''} - ${dose.dosisCantidad} ${dose.unidadDosis}`;
        const existing = groups.get(key);
        if (existing) {
          existing.lines.push(line);
        } else {
          groups.set(key, {
            key,
            at,
            patientId: patient.id,
            patientName: patient.nombre,
            tone: patient.tonoNotificacion,
            fecha,
            hora,
            lines: [line],
          });
        }
      }
    }
  }

  return Array.from(groups.values()).sort((a, b) => a.at.getTime() - b.at.getTime());
}

let scheduling = false;
let scheduleAgain = false;

export async function rescheduleReminders(): Promise<number> {
  if (!isNativeApp()) return 0;
  if (scheduling) {
    scheduleAgain = true;
    return 0;
  }
  scheduling = true;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display !== 'granted') return 0;

    await ensureChannels();

    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) });
    }

    const now = new Date();
    const groups = collectUpcomingGroups(now).slice(0, MAX_MAIN_REMINDERS);
    const notifications: LocalNotificationSchema[] = [];

    groups.forEach((g, index) => {
      notifications.push({
        id: stableId(g.key),
        title: `Hora de medicamento: ${g.patientName}`,
        body: g.lines.join('\n'),
        largeBody: g.lines.join('\n'),
        summaryText: g.hora,
        channelId: channelFor(g.tone),
        schedule: { at: g.at, allowWhileIdle: true },
        extra: { patientId: g.patientId, fecha: g.fecha, hora: g.hora, tipo: 'dosis' },
      });

      if (index < MAX_FOLLOWUPS) {
        const followAt = new Date(g.at.getTime() + FOLLOWUP_MINUTES * 60000);
        notifications.push({
          id: stableId(g.key + '#refuerzo'),
          title: `Pendiente de confirmar: ${g.patientName}`,
          body: `Aún no se registra la toma de las ${g.hora}.\n${g.lines.join('\n')}`,
          largeBody: `Aún no se registra la toma de las ${g.hora}.\n${g.lines.join('\n')}`,
          channelId: channelFor(g.tone),
          schedule: { at: followAt, allowWhileIdle: true },
          extra: { patientId: g.patientId, fecha: g.fecha, hora: g.hora, tipo: 'refuerzo' },
        });
      }
    });

    // Si la ventana programada termina, avisa para que se abra la app y se renueve.
    if (groups.length >= MAX_MAIN_REMINDERS) {
      const last = groups[groups.length - 1];
      notifications.push({
        id: RENEW_NOTICE_ID,
        title: 'MediControl: abre la app',
        body: 'Abre la aplicación para renovar los recordatorios de las próximas dosis.',
        channelId: channelFor('campana_zen'),
        schedule: { at: new Date(last.at.getTime() + 60 * 60000), allowWhileIdle: true },
        extra: { tipo: 'renovar' },
      });
    }

    if (notifications.length > 0) {
      await LocalNotifications.schedule({ notifications });
    }
    return notifications.length;
  } catch (e) {
    console.warn('No se pudieron programar los recordatorios:', e);
    return 0;
  } finally {
    scheduling = false;
    if (scheduleAgain) {
      scheduleAgain = false;
      void rescheduleReminders();
    }
  }
}

let debounceTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSoon() {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => void rescheduleReminders(), 1500);
}

let started = false;
export async function initReminders(): Promise<void> {
  if (!isNativeApp() || started) return;
  started = true;

  await requestReminderPermissions();
  await rescheduleReminders();

  // Cada cambio en pacientes, recetas, tomas o medicamentos reprograma los avisos.
  window.addEventListener('medicontrol:data-changed', scheduleSoon);

  // Al volver a abrir la app se renueva la ventana de recordatorios.
  await CapApp.addListener('appStateChange', ({ isActive }) => {
    if (isActive) scheduleSoon();
  });
}

// ---- Estado y utilidades para la pantalla de configuración ----

export interface ReminderStatus {
  native: boolean;
  notifications: 'granted' | 'denied' | 'prompt' | 'n/a';
  exactAlarms: 'granted' | 'denied' | 'n/a';
  batteryUnrestricted: boolean | null;
  pendingCount: number;
}

export async function getReminderStatus(): Promise<ReminderStatus> {
  if (!isNativeApp()) {
    return { native: false, notifications: 'n/a', exactAlarms: 'n/a', batteryUnrestricted: null, pendingCount: 0 };
  }
  const status: ReminderStatus = {
    native: true,
    notifications: 'prompt',
    exactAlarms: 'n/a',
    batteryUnrestricted: null,
    pendingCount: 0,
  };
  try {
    const perm = await LocalNotifications.checkPermissions();
    status.notifications = perm.display === 'granted' ? 'granted' : perm.display === 'denied' ? 'denied' : 'prompt';
  } catch { /* ignorar */ }
  try {
    const exact = await LocalNotifications.checkExactNotificationSetting();
    status.exactAlarms = exact.exact_alarm === 'granted' ? 'granted' : 'denied';
  } catch { /* ignorar */ }
  try {
    status.batteryUnrestricted = (await SystemSettings.isIgnoringBatteryOptimizations()).value;
  } catch { /* ignorar */ }
  try {
    status.pendingCount = (await LocalNotifications.getPending()).notifications.length;
  } catch { /* ignorar */ }
  return status;
}

export async function sendTestReminder(tone: NotificationSound | undefined): Promise<boolean> {
  if (!isNativeApp()) return false;
  const granted = await requestReminderPermissions();
  if (!granted) return false;
  await ensureChannels();
  await LocalNotifications.schedule({
    notifications: [
      {
        id: stableId('prueba-' + Date.now()),
        title: 'Prueba de recordatorio',
        body: 'Así sonará el aviso de una dosis. Cierra la app y espera unos segundos.',
        channelId: channelFor(tone),
        schedule: { at: new Date(Date.now() + 8000), allowWhileIdle: true },
        extra: { tipo: 'prueba' },
      },
    ],
  });
  return true;
}

export const openBatterySettings = () => SystemSettings.openBatterySettings();
export const openNotificationSettings = () => SystemSettings.openNotificationSettings();
export const openAppDetails = () => SystemSettings.openAppDetails();
export const openExactAlarmSettings = async () => {
  try {
    await LocalNotifications.changeExactNotificationSetting();
  } catch {
    await SystemSettings.openAppDetails();
  }
};
