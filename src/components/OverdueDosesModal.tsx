import React from 'react';
import { ComputedDose } from '../services/scheduleEngine';
import { X, AlertTriangle, CheckCircle2, XCircle, Clock, Calendar } from 'lucide-react';

interface OverdueDosesModalProps {
  isOpen: boolean;
  onClose: () => void;
  overdueDoses: ComputedDose[];
  patientName: string;
  onMarkDose: (dose: ComputedDose, action: 'tomada' | 'omitida') => void;
  onBulkResolve: (action: 'tomada' | 'omitida') => void;
}

export const OverdueDosesModal: React.FC<OverdueDosesModalProps> = ({
  isOpen,
  onClose,
  overdueDoses,
  patientName,
  onMarkDose,
  onBulkResolve
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-amber-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Tomas Atrasadas de Días Anteriores
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                  {overdueDoses.length} pendientes
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Paciente: <span className="text-slate-200 font-semibold">{patientName}</span>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-3">
          {overdueDoses.length === 0 ? (
            <div className="text-center py-10">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
              <h4 className="text-sm font-bold text-white">¡No hay tomas atrasadas pendientes!</h4>
              <p className="text-xs text-slate-400 mt-1">El historial médico de este paciente se encuentra al día.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs">
                <span className="text-slate-300">Regularizar lote completo:</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onBulkResolve('tomada')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-500/30 transition-colors"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Marcar Todas Tomadas
                  </button>
                  <button
                    onClick={() => onBulkResolve('omitida')}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold border border-rose-500/30 transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    Marcar Todas Omitidas
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {overdueDoses.map((dose) => (
                  <div
                    key={dose.uniqueId}
                    className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{dose.medicamento.nombreComercial}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-medium">
                          {dose.dosisCantidad} {dose.unidadDosis}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <span className="flex items-center gap-1 text-amber-300 font-medium">
                          <Calendar className="w-3.5 h-3.5" />
                          {dose.fecha}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {dose.horaProgramada}
                        </span>
                      </div>
                      {dose.indicaciones && (
                        <p className="text-[11px] text-slate-400 italic">"{dose.indicaciones}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => onMarkDose(dose, 'tomada')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Tomada
                      </button>
                      <button
                        onClick={() => onMarkDose(dose, 'omitida')}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-slate-700 text-xs font-medium transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Omitida
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
};
