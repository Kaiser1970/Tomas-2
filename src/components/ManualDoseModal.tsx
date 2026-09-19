import React, { useState, useMemo } from 'react';
import { Medicine } from '../types';
import { MedicineSearchSelect } from './MedicineSearchSelect';
import { X, PlusCircle, Clock, AlertCircle } from 'lucide-react';

interface ManualDoseModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  patientId: string;
  medicines: Medicine[];
  onAddMedicine?: (newMed: Medicine) => void;
  onSaveManualDose: (data: {
    medicamentoId: string;
    hora: string;
    fecha: string;
    observaciones: string;
    descontarStock: boolean;
  }) => void;
}

export const ManualDoseModal: React.FC<ManualDoseModalProps> = ({
  isOpen,
  onClose,
  patientName,
  medicines,
  onAddMedicine,
  onSaveManualDose
}) => {
  if (!isOpen) return null;

  const sortedMedicines = useMemo(() => {
    return [...medicines]
      .filter((m) => m.activo)
      .sort((a, b) =>
        a.nombreComercial.localeCompare(b.nombreComercial, 'es', { sensitivity: 'base' })
      );
  }, [medicines]);

  const now = new Date();
  const currentHour = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const currentDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [selectedMedId, setSelectedMedId] = useState(sortedMedicines[0]?.id || medicines[0]?.id || '');
  const [time, setTime] = useState(currentHour);
  const [date, setDate] = useState(currentDate);
  const [observaciones, setObservaciones] = useState('');
  const [descontarStock, setDescontarStock] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMedId) return;

    onSaveManualDose({
      medicamentoId: selectedMedId,
      hora: time,
      fecha: date,
      observaciones: observaciones || 'Toma adicional no programada / Rescate',
      descontarStock
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Registrar Toma Extra / Manual</h3>
              <p className="text-xs text-slate-400">Paciente: <span className="text-slate-200 font-semibold">{patientName}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            <span>
              Esta acción registrará una dosis fuera de los horarios automáticos (ej. toma de rescate o dolor) y quedará etiquetada como manual en el historial.
            </span>
          </div>

          <div>
            <MedicineSearchSelect
              medicines={medicines}
              selectedMedicineId={selectedMedId}
              onSelectMedicine={(id) => setSelectedMedId(id)}
              onAddMedicine={onAddMedicine}
              label="Medicamento administrado (Búsqueda Alfabética A-Z)"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Hora de la toma
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Fecha
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:border-emerald-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Motivo u Observaciones
            </label>
            <textarea
              rows={2}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              placeholder="Ej. Dolor de cabeza súbito, rescate por disnea, crisis de tos..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="descontarStockManual"
              checked={descontarStock}
              onChange={(e) => setDescontarStock(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
            />
            <label htmlFor="descontarStockManual" className="text-xs text-slate-300">
              Descontar 1 unidad del inventario de farmacia
            </label>
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
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-lg shadow-blue-600/20"
            >
              Confirmar Toma Extra
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
