import {
  OWNER_BUSINESS_NAME,
  OWNER_WHATSAPP,
  PAYMENT_REMINDER_DAYS_BEFORE,
  SUBSCRIPTION_PERIOD_DAYS,
} from '../config';
import { formatDate, parseDate } from './scheduleEngine';
import { openExternalUrl } from './fileService';

/**
 * Recordatorio de pago mensual. NUNCA bloquea ni desactiva la app:
 * solo avisa al usuario y le permite mandar un WhatsApp al dueño para renovar.
 */

const KEY = 'medicontrol_subscription_v1';

export interface SubscriptionState {
  cuenta: string; // nombre del enfermero/doctor/clínica
  venceEl: string; // YYYY-MM-DD
  posponerHasta?: string; // YYYY-MM-DD: no mostrar el aviso hasta esa fecha
}

export interface SubscriptionStatus {
  state: SubscriptionState;
  diasRestantes: number; // negativo si ya venció
  mostrarAviso: boolean;
  vencido: boolean;
}

const today = () => formatDate(new Date());

function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function daysBetween(fromStr: string, toStr: string): number {
  return Math.round((parseDate(toStr).getTime() - parseDate(fromStr).getTime()) / 86400000);
}

export function getSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as SubscriptionState;
  } catch { /* usa el valor por defecto */ }
  const initial: SubscriptionState = { cuenta: '', venceEl: addDays(today(), SUBSCRIPTION_PERIOD_DAYS) };
  saveSubscription(initial);
  return initial;
}

export function saveSubscription(state: SubscriptionState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch { /* sin espacio o bloqueado: se ignora */ }
}

export function getSubscriptionStatus(): SubscriptionStatus {
  const state = getSubscription();
  const diasRestantes = daysBetween(today(), state.venceEl);
  const posponido = !!state.posponerHasta && state.posponerHasta > today();
  return {
    state,
    diasRestantes,
    vencido: diasRestantes < 0,
    mostrarAviso: diasRestantes <= PAYMENT_REMINDER_DAYS_BEFORE && !posponido,
  };
}

export function postponeReminder(days = 1): void {
  const state = getSubscription();
  saveSubscription({ ...state, posponerHasta: addDays(today(), days) });
}

export function setAccountName(cuenta: string): void {
  saveSubscription({ ...getSubscription(), cuenta: cuenta.trim() });
}

/** Marca el pago como realizado: el siguiente vencimiento se calcula desde el vencimiento anterior (o desde hoy si ya venció). */
export function markAsPaid(): SubscriptionState {
  const state = getSubscription();
  const base = state.venceEl > today() ? state.venceEl : today();
  const next: SubscriptionState = { ...state, venceEl: addDays(base, SUBSCRIPTION_PERIOD_DAYS), posponerHasta: undefined };
  saveSubscription(next);
  return next;
}

export function formatDMY(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function whatsappUrl(text: string): string {
  return `https://wa.me/${OWNER_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

function who(state: SubscriptionState): string {
  return state.cuenta ? state.cuenta : 'un usuario de MediControl';
}

export async function sendRenewalRequest(): Promise<void> {
  const s = getSubscription();
  const estado = daysBetween(today(), s.venceEl) < 0 ? `venció el ${formatDMY(s.venceEl)}` : `vence el ${formatDMY(s.venceEl)}`;
  await openExternalUrl(
    whatsappUrl(`Hola ${OWNER_BUSINESS_NAME}, soy ${who(s)}. Mi mensualidad de MediControl ${estado}. Quiero renovar, ¿cuál es la forma de pago?`)
  );
}

export async function sendPaymentDone(): Promise<void> {
  const s = getSubscription();
  await openExternalUrl(
    whatsappUrl(`Hola ${OWNER_BUSINESS_NAME}, soy ${who(s)}. Ya realicé el pago de mi mensualidad de MediControl (vencimiento: ${formatDMY(s.venceEl)}). Envío mi comprobante.`)
  );
}
