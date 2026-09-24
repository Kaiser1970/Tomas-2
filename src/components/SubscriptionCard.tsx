import React, { useState } from 'react';
import { CalendarClock, MessageCircle } from 'lucide-react';
import {
  formatDMY,
  getSubscriptionStatus,
  markAsPaid,
  sendPaymentDone,
  sendRenewalRequest,
  setAccountName,
} from '../services/subscriptionService';

export const SubscriptionCard: React.FC = () => {
  const [status, setStatus] = useState(getSubscriptionStatus());
  const [name, setName] = useState(status.state.cuenta);
  const refresh = () => setStatus(getSubscriptionStatus());

  const { state, diasRestantes, vencido } = status;

  return (
    <div className="space-y-3">
      <h4 className="text-xs font-bold text-coffee-500 uppercase tracking-wider flex items-center gap-1.5">
        <CalendarClock className="w-4 h-4 text-terracotta-400" />
        Mensualidad
      </h4>

      <div className="p-3 rounded-xl bg-cream-200/50 border border-coffee-200/70 space-y-2">
        <label className="block text-[11px] text-coffee-500">Tu nombre o clínica</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          onBlur={() => {
            setAccountName(name);
            refresh();
          }}
          placeholder="Ej. Enf. Ana López"
          className="w-full rounded-lg bg-cream-100 border border-coffee-200 px-3 py-2 text-sm text-coffee-900 placeholder:text-coffee-400"
        />
        <p className={`text-xs ${vencido ? 'text-amber-700' : 'text-coffee-600'}`}>
          {vencido
            ? `Venció el ${formatDMY(state.venceEl)} (hace ${Math.abs(diasRestantes)} ${Math.abs(diasRestantes) === 1 ? 'día' : 'días'}).`
            : `Próximo pago: ${formatDMY(state.venceEl)} (en ${diasRestantes} ${diasRestantes === 1 ? 'día' : 'días'}).`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={async () => {
            setAccountName(name);
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
            setAccountName(name);
            await sendPaymentDone();
            markAsPaid();
            refresh();
          }}
          className="px-3 py-2 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-800 font-semibold text-xs border border-coffee-300"
        >
          Ya pagué
        </button>
      </div>
      <p className="text-[11px] text-coffee-400">La app nunca se bloquea por falta de pago.</p>
    </div>
  );
};
