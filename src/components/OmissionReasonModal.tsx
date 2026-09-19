import React, { useState } from 'react';
import { ComputedDose } from '../services/scheduleEngine';
import { X, AlertOctagon } from 'lucide-react';

interface OmissionReasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  dose: ComputedDose | null;
  onConfirmOmission: (dose: ComputedDose, reason: string) => void;
}

const COMMON_REASONS = [
  'Paciente con náuseas / vómito',
  'Indicación médica de suspender toma',
  'Paciente dormido / No despertó a tiempo',
  'Medicamento no disponible temporalmente',
  'Olvido del paciente o cuidador',
  'Paciente se negó a tomar la dosis',
  'En ayunas por estudios de laboratorio',
  'Efecto adverso previo presentado'
];

export const OmissionReasonModal: React.FC<OmissionReasonModalProps> = ({
  isOpen,
  onClose,
  dose,
  onConfirmOmission
}) => {
  if (!isOpen || !dose) return null;

  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customReason, setCustomReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = customReason.trim() || selectedReason;
    onConfirmOmission(dose, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertOctagon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registrar Omisión de Toma</h3>
              <p className="text-xs text-slate-400">
                {dose.medicamento.nombreComercial} ({dose.horaProgramada})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-xs text-slate-300">
            Selecciona o describe el motivo por el cual no se administró esta dosis programada:
          </p>

          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {COMMON_REASONS.map((reason, idx) => (
              <label
                key={idx}
                className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                  selectedReason === reason && !customReason
                    ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                    : 'bg-slate-800/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <input
                  type="radio"
                  name="omissionReason"
                  checked={selectedReason === reason && !customReason}
                  onChange={() => {
                    setSelectedReason(reason);
                    setCustomReason('');
                  }}
                  className="text-rose-500 focus:ring-rose-500 bg-slate-800 border-slate-700"
                />
                <span>{reason}</span>
              </label>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1">
              Otro motivo específico (opcional):
            </label>
            <input
              type="text"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              placeholder="Escribe el motivo detallado..."
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors shadow-lg shadow-rose-600/20"
            >
              Confirmar Omisión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
