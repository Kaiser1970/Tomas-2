import React, { useState } from 'react';
import { CalendarClock, MessageCircle, CheckCircle2, X } from 'lucide-react';
import {
  formatDMY,
  getSubscriptionStatus,
  markAsPaid,
  postponeReminder,
  sendPaymentDone,
  sendRenewalRequest,
  setAccountName,
} from '../services/subscriptionService';

/** Aviso de mensualidad. No bloquea la app en ningún caso. */
export const PaymentReminderBanner: React.FC = () => {
  const [status, setStatus] = useState(getSubscriptionStatus());
  const [name, setName] = useState(status.state.cuenta);
  const refresh = () => setStatus(getSubscriptionStatus());

  if (!status.mostrarAviso) return null;

  const { diasRestantes, vencido, state } = status;
  const mensaje = vencido
    ? `Tu mensualidad de MediControl venció el ${formatDMY(state.venceEl)}. La app sigue funcionando; por favor confirma tu pago.`
    : diasRestantes === 0
      ? 'Tu mensualidad de MediControl vence hoy.'
      : `Tu mensualidad de MediControl vence el ${formatDMY(state.venceEl)} (en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}).`;

  const saveNameIfNeeded = () => {
    if (name.trim() && name.trim() !== state.cuenta) setAccountName(name);
  };

  return (
    <div
      role="status"
      className={`mx-auto max-w-6xl mt-3 px-4 py-3 rounded-2xl border flex flex-col gap-3 ${
        vencido ? 'bg-amber-100 border-amber-500/40' : 'bg-sky-100 border-sky-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <CalendarClock className={`w-5 h-5 mt-0.5 shrink-0 ${vencido ? 'text-amber-700' : 'text-sky-700'}`} />
        <p className="text-sm text-coffee-800 flex-1">{mensaje}</p>
        <button
          type="button"
          aria-label="Recordar mañana"
          title="Recordar mañana"
          onClick={() => {
            postponeReminder(1);
            refresh();
          }}
          className="p-1 text-coffee-500 hover:text-coffee-900"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!state.cuenta && (
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre o el de tu clínica (para avisarte por WhatsApp)"
          className="w-full rounded-xl bg-cream-100 border border-coffee-200 px-3 py-2 text-sm text-coffee-900 placeholder:text-coffee-400"
        />
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            saveNameIfNeeded();
            await sendRenewalRequest();
          }}
          className="px-3 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-400 text-white font-bold text-xs flex items-center gap-1.5"
        >
          <MessageCircle className="w-4 h-4" />
          Avisar por WhatsApp
        </button>
        <button
          type="button"
          onClick={async () => {
            saveNameIfNeeded();
            await sendPaymentDone();
            markAsPaid();
            refresh();
          }}
          className="px-3 py-2 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-800 font-semibold text-xs border border-coffee-300 flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4 text-terracotta-400" />
          Ya pagué
        </button>
        <button
          type="button"
          onClick={() => {
            postponeReminder(1);
            refresh();
          }}
          className="px-3 py-2 rounded-xl text-coffee-600 hover:text-coffee-900 text-xs"
        >
          Recordar mañana
        </button>
      </div>
    </div>
  );
};
