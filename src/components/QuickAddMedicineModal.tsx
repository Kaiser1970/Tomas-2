import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Medicine, MedicinePresentation } from '../types';
import { storageService } from '../services/storageService';
import { Pill, X, Plus } from 'lucide-react';

interface QuickAddMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialName?: string;
  onMedicineCreated: (newMedicine: Medicine) => void;
}

const PRESENTATIONS: { id: MedicinePresentation; name: string; defaultUnit: string }[] = [
  { id: 'tabletas', name: 'Tabletas / Comprimidos', defaultUnit: 'tabletas' },
  { id: 'capsulas', name: 'Cápsulas', defaultUnit: 'cápsulas' },
  { id: 'jarabe', name: 'Jarabe / Solución', defaultUnit: 'ml' },
  { id: 'inyeccion', name: 'Inyección / Ampolleta', defaultUnit: 'ampolletas' },
  { id: 'gotas', name: 'Gotas Oftálmicas / Óticas', defaultUnit: 'gotas' },
  { id: 'inhalador', name: 'Inhalador / Aerosol', defaultUnit: 'dosis/puff' },
  { id: 'pomada', name: 'Pomada / Gel / Crema', defaultUnit: 'aplicaciones' },
  { id: 'parche', name: 'Parche Transdérmico', defaultUnit: 'parches' },
  { id: 'supositorio', name: 'Supositorio / Óvulo', defaultUnit: 'piezas' },
  { id: 'sobre_polvo', name: 'Polvo / Sobres', defaultUnit: 'sobres' },
];

export const QuickAddMedicineModal: React.FC<QuickAddMedicineModalProps> = ({
  isOpen,
  onClose,
  initialName = '',
  onMedicineCreated,
}) => {
  const [nombreComercial, setNombreComercial] = useState(initialName);
  const [sustanciaActiva, setSustanciaActiva] = useState('');
  const [presentacion, setPresentacion] = useState<MedicinePresentation>('tabletas');
  const [concentracion, setConcentracion] = useState('');
  const [stockActual, setStockActual] = useState(30);
  const [stockMinimoAlerta, setStockMinimoAlerta] = useState(5);
  const [unidadMedida, setUnidadMedida] = useState('tabletas');
  const [laboratorio, setLaboratorio] = useState('');
  const [instruccionesGenerales, setInstruccionesGenerales] = useState('');
  const [validationError, setValidationError] = useState('');

  // Update name when initialName changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setNombreComercial(initialName);
      setValidationError('');
      if (!concentracion) {
        setConcentracion('500 mg');
      }
    }
  }, [isOpen, initialName]);

  // Sync unit when presentation changes
  const handlePresentationChange = (pres: MedicinePresentation) => {
    setPresentacion(pres);
    const matched = PRESENTATIONS.find((p) => p.id === pres);
    if (matched) {
      setUnidadMedida(matched.defaultUnit);
    }
  };

  if (!isOpen) return null;

  const handleSave = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!nombreComercial.trim()) {
      setValidationError('Por favor ingresa el nombre comercial del medicamento.');
      return;
    }

    const newMed: Medicine = {
      id: `med-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      nombreComercial: nombreComercial.trim(),
      sustanciaActiva: sustanciaActiva.trim() || nombreComercial.trim(),
      presentacion,
      concentracion: concentracion.trim() || 'Estándar',
      stockActual: Number(stockActual) || 0,
      stockMinimoAlerta: Number(stockMinimoAlerta) || 5,
      unidadMedida: unidadMedida.trim() || 'unidades',
      laboratorio: laboratorio.trim() || undefined,
      instruccionesGenerales: instruccionesGenerales.trim() || undefined,
      esFavorito: false,
      activo: true,
      creadoEn: new Date().toISOString(),
    };

    // Save directly to storage first
    storageService.saveMedicine(newMed);

    // Notify callback to update app state and select it
    onMedicineCreated(newMed);

    // Reset & close
    setNombreComercial('');
    setSustanciaActiva('');
    setConcentracion('');
    setLaboratorio('');
    setInstruccionesGenerales('');
    setValidationError('');
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
      e.preventDefault();
      e.stopPropagation();
      handleSave(e);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      onClose();
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          e.stopPropagation();
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-lg max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <Pill className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Alta Rápida de Medicamento</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                  Al instante
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Se agregará al catálogo general y se seleccionará en tu receta
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body (No nested form to prevent bubbling issues) */}
        <div className="p-6 overflow-y-auto space-y-4">
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold">
              {validationError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre Comercial *
              </label>
              <input
                type="text"
                required
                autoFocus
                value={nombreComercial}
                onChange={(e) => {
                  setNombreComercial(e.target.value);
                  if (validationError) setValidationError('');
                }}
                placeholder="Ej. Tempra, Losartán, Amoxicilina"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Sustancia Activa (Genérico)
              </label>
              <input
                type="text"
                value={sustanciaActiva}
                onChange={(e) => setSustanciaActiva(e.target.value)}
                placeholder="Ej. Paracetamol, Losartán Potásico"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Presentación Farmacéutica *
              </label>
              <select
                value={presentacion}
                onChange={(e) => handlePresentationChange(e.target.value as MedicinePresentation)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {PRESENTATIONS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Concentración *
              </label>
              <input
                type="text"
                required
                value={concentracion}
                onChange={(e) => setConcentracion(e.target.value)}
                placeholder="Ej. 500 mg, 10 mg/5 ml, 100 mcg"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Stock Inicial
              </label>
              <input
                type="number"
                min="0"
                value={stockActual}
                onChange={(e) => setStockActual(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Alerta Mínimo
              </label>
              <input
                type="number"
                min="1"
                value={stockMinimoAlerta}
                onChange={(e) => setStockMinimoAlerta(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Unidad
              </label>
              <input
                type="text"
                value={unidadMedida}
                onChange={(e) => setUnidadMedida(e.target.value)}
                placeholder="tabletas, ml"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Laboratorio / Marca (Opcional)
              </label>
              <input
                type="text"
                value={laboratorio}
                onChange={(e) => setLaboratorio(e.target.value)}
                placeholder="Ej. Bayer, Pfizer, Genérico"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Indicaciones Generales (Opcional)
              </label>
              <input
                type="text"
                value={instruccionesGenerales}
                onChange={(e) => setInstruccionesGenerales(e.target.value)}
                placeholder="Ej. Tomar con abundante agua"
                className="w-full px-3.5 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800 mt-4">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={(e) => handleSave(e)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Guardar y Seleccionar</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
