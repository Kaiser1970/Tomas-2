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
        vencido ? 'bg-amber-950/40 border-amber-500/40' : 'bg-sky-950/40 border-sky-500/30'
      }`}
    >
      <div className="flex items-start gap-3">
        <CalendarClock className={`w-5 h-5 mt-0.5 shrink-0 ${vencido ? 'text-amber-300' : 'text-sky-300'}`} />
        <p className="text-sm text-slate-100 flex-1">{mensaje}</p>
        <button
          type="button"
          aria-label="Recordar mañana"
          title="Recordar mañana"
          onClick={() => {
            postponeReminder(1);
            refresh();
          }}
          className="p-1 text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {!state.cuenta && (
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Tu nombre o el de tu clínica (para avisarte por WhatsApp)"
          className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white placeholder:text-slate-500"
        />
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            saveNameIfNeeded();
            await sendRenewalRequest();
          }}
          className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5"
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
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs border border-slate-600 flex items-center gap-1.5"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Ya pagué
        </button>
        <button
          type="button"
          onClick={() => {
            postponeReminder(1);
            refresh();
          }}
          className="px-3 py-2 rounded-xl text-slate-300 hover:text-white text-xs"
        >
          Recordar mañana
        </button>
      </div>
    </div>
  );
};
