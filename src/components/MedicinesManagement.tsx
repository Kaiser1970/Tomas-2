import { hasLowStock } from '../services/stockUtils';
import React, { useState } from 'react';
import { Medicine, MedicinePresentation } from '../types';
import { 
  Pill, 
  Plus, 
  Edit, 
  Trash2, 
  Star, 
  QrCode, 
  Search, 
  AlertCircle, 
  Check, 
  X, 
  RefreshCw,
  SlidersHorizontal,
  PackageCheck
} from 'lucide-react';
import { BarcodeScannerModal } from './BarcodeScannerModal';

interface MedicinesManagementProps {
  medicines: Medicine[];
  onAddMedicine: (medicine: Medicine) => void;
  onUpdateMedicine: (medicine: Medicine) => void;
  onDeleteMedicine: (id: string) => void;
  onAdjustStock: (id: string, delta: number) => void;
}

const PRESENTATIONS: { id: MedicinePresentation; name: string; icon: string }[] = [
  { id: 'tabletas', name: 'Tabletas / Comprimidos', icon: '💊' },
  { id: 'capsulas', name: 'Cápsulas', icon: '💊' },
  { id: 'jarabe', name: 'Jarabe / Solución', icon: '🧪' },
  { id: 'inyeccion', name: 'Inyectable (Ampolleta)', icon: '💉' },
  { id: 'gotas', name: 'Gotas (Oftálmicas / Orales)', icon: '💧' },
  { id: 'inhalador', name: 'Inhalador / Aerosol', icon: '💨' },
  { id: 'pomada', name: 'Pomada / Crema / Gel', icon: '🧴' },
  { id: 'parche', name: 'Parche Transdérmico', icon: '🩹' },
  { id: 'supositorio', name: 'Supositorio', icon: '💊' },
  { id: 'sobre_polvo', name: 'Sobre en Polvo', icon: '🧂' },
];

export const MedicinesManagement: React.FC<MedicinesManagementProps> = ({
  medicines,
  onAddMedicine,
  onUpdateMedicine,
  onDeleteMedicine,
  onAdjustStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPresentation, setFilterPresentation] = useState<string>('all');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);
  const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
  
  const [showModal, setShowModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [editingMed, setEditingMed] = useState<Medicine | null>(null);

  // Form state
  const [nombreComercial, setNombreComercial] = useState('');
  const [sustanciaActiva, setSustanciaActiva] = useState('');
  const [presentacion, setPresentacion] = useState<MedicinePresentation>('tabletas');
  const [concentracion, setConcentracion] = useState('');
  const [laboratorio, setLaboratorio] = useState('');
  const [codigoBarras, setCodigoBarras] = useState('');
  const [stockActual, setStockActual] = useState(30);
  const [stockMinimoAlerta, setStockMinimoAlerta] = useState(10);
  const [unidadMedida, setUnidadMedida] = useState('tabletas');
  const [esFavorito, setEsFavorito] = useState(false);
  const [instruccionesGenerales, setInstruccionesGenerales] = useState('');

  const activeMedicines = medicines.filter(m => m.activo);

  const filtered = activeMedicines
    .filter(m => {
      const matchesSearch = 
        m.nombreComercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.sustanciaActiva.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.codigoBarras && m.codigoBarras.includes(searchTerm));
      
      const matchesPres = filterPresentation === 'all' || m.presentacion === filterPresentation;
      const matchesLowStock = !filterLowStockOnly || hasLowStock(m);
      const matchesFav = !filterFavoritesOnly || m.esFavorito;

      return matchesSearch && matchesPres && matchesLowStock && matchesFav;
    })
    .sort((a, b) => a.nombreComercial.localeCompare(b.nombreComercial, 'es', { sensitivity: 'base' }));

  const handleOpenAdd = () => {
    setEditingMed(null);
    setNombreComercial('');
    setSustanciaActiva('');
    setPresentacion('tabletas');
    setConcentracion('');
    setLaboratorio('');
    setCodigoBarras('');
    setStockActual(30);
    setStockMinimoAlerta(10);
    setUnidadMedida('tabletas');
    setEsFavorito(false);
    setInstruccionesGenerales('');
    setShowModal(true);
  };

  const handleOpenEdit = (med: Medicine) => {
    setEditingMed(med);
    setNombreComercial(med.nombreComercial);
    setSustanciaActiva(med.sustanciaActiva);
    setPresentacion(med.presentacion);
    setConcentracion(med.concentracion);
    setLaboratorio(med.laboratorio || '');
    setCodigoBarras(med.codigoBarras || '');
    setStockActual(med.stockActual);
    setStockMinimoAlerta(med.stockMinimoAlerta);
    setUnidadMedida(med.unidadMedida);
    setEsFavorito(!!med.esFavorito);
    setInstruccionesGenerales(med.instruccionesGenerales || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombreComercial.trim() || !sustanciaActiva.trim()) return;

    if (editingMed) {
      const updated: Medicine = {
        ...editingMed,
        nombreComercial: nombreComercial.trim(),
        sustanciaActiva: sustanciaActiva.trim(),
        presentacion,
        concentracion: concentracion.trim(),
        laboratorio: laboratorio.trim() || undefined,
        codigoBarras: codigoBarras.trim() || undefined,
        stockActual: Number(stockActual),
        stockMinimoAlerta: Number(stockMinimoAlerta),
        unidadMedida: unidadMedida.trim() || 'unidades',
        esFavorito,
        instruccionesGenerales: instruccionesGenerales.trim() || undefined
      };
      onUpdateMedicine(updated);
    } else {
      const newMed: Medicine = {
        id: `med-${Date.now()}`,
        nombreComercial: nombreComercial.trim(),
        sustanciaActiva: sustanciaActiva.trim(),
        presentacion,
        concentracion: concentracion.trim(),
        laboratorio: laboratorio.trim() || undefined,
        codigoBarras: codigoBarras.trim() || undefined,
        stockActual: Number(stockActual),
        stockMinimoAlerta: Number(stockMinimoAlerta),
        unidadMedida: unidadMedida.trim() || 'unidades',
        esFavorito,
        instruccionesGenerales: instruccionesGenerales.trim() || undefined,
        activo: true,
        creadoEn: new Date().toISOString()
      };
      onAddMedicine(newMed);
    }

    setShowModal(false);
  };

  const handleToggleFav = (med: Medicine) => {
    onUpdateMedicine({
      ...med,
      esFavorito: !med.esFavorito
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-coffee-900 flex items-center gap-2">
            <Pill className="w-6 h-6 text-terracotta-400" />
            Catálogo de Medicamentos e Inventario
          </h2>
          <p className="text-xs text-coffee-500">
            Control de sustancias activas, presentaciones, códigos de barras y alertas de resurtido
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScannerModal(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-700 border border-coffee-200 font-bold text-xs transition-colors"
          >
            <QrCode className="w-4 h-4 text-terracotta-400" />
            <span>Escanear Código</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-terracotta-500 to-terracotta-600 text-white font-black text-xs hover:opacity-95 transition-opacity shadow-lg shadow-terracotta-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Añadir Medicamento</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre comercial, sustancia activa o código de barras..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-cream-100 border border-cream-200 text-coffee-900 text-xs placeholder:text-coffee-400 focus:outline-none focus:border-terracotta-500"
          />
          <Search className="w-4 h-4 text-coffee-500 absolute left-3.5 top-3" />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <select
            value={filterPresentation}
            onChange={(e) => setFilterPresentation(e.target.value)}
            className="px-3 py-2 rounded-xl bg-cream-100 border border-cream-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
          >
            <option value="all">Todas las presentaciones</option>
            {PRESENTATIONS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-colors flex items-center gap-1.5 ${
              filterLowStockOnly
                ? 'bg-amber-500/20 text-amber-800 border-amber-500/40'
                : 'bg-cream-100 text-coffee-500 border-cream-200 hover:text-coffee-900'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Stock Bajo</span>
          </button>

          <button
            onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap border transition-colors flex items-center gap-1.5 ${
              filterFavoritesOnly
                ? 'bg-amber-500/20 text-amber-800 border-amber-500/40'
                : 'bg-cream-100 text-coffee-500 border-cream-200 hover:text-coffee-900'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>Favoritos</span>
          </button>
        </div>
      </div>

      {/* Medicines Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((med) => {
          const isLowStock = hasLowStock(med);
          const presInfo = PRESENTATIONS.find(p => p.id === med.presentacion);

          return (
            <div
              key={med.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                isLowStock
                  ? 'bg-gradient-to-b from-amber-950/20 to-cream-100 border-amber-500/40'
                  : 'bg-cream-100 border-cream-200 hover:border-coffee-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl" title={presInfo?.name}>{presInfo?.icon || '💊'}</span>
                    <div>
                      <h3 className="text-base font-bold text-coffee-900">{med.nombreComercial}</h3>
                      <p className="text-xs text-terracotta-400 font-semibold">{med.sustanciaActiva}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleFav(med)}
                    className="p-1.5 rounded-lg text-coffee-500 hover:text-amber-400 transition-colors"
                  >
                    <Star className={`w-4 h-4 ${med.esFavorito ? 'fill-amber-400 text-amber-400' : ''}`} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 text-xs text-coffee-600">
                  <span className="px-2 py-0.5 rounded bg-cream-200 text-coffee-600 font-medium border border-coffee-200">
                    {med.concentracion}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cream-200 text-coffee-500 capitalize">
                    {med.presentacion}
                  </span>
                  {med.laboratorio && (
                    <span className="text-[11px] text-coffee-400">({med.laboratorio})</span>
                  )}
                </div>

                {med.origenCatalogo === 'IMSS' && (
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-coffee-500">
                    <span className="px-1.5 py-0.5 rounded bg-terracotta-100/50 text-terracotta-800 border border-terracotta-500/20 font-semibold">
                      Cuadro Básico IMSS
                    </span>
                    {med.grupoTerapeutico && <span>{med.grupoTerapeutico}</span>}
                    {med.formaFarmaceutica && <span>· {med.formaFarmaceutica}</span>}
                    <span className="font-mono">
                      · {med.claveCBM ? `Clave ${med.claveCBM}` : 'Clave por verificar'}
                    </span>
                  </div>
                )}

                {med.codigoBarras && (
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-coffee-500 bg-cream-200/50 px-2 py-1 rounded-lg">
                    <QrCode className="w-3 h-3 text-terracotta-400" />
                    <span>Cód: {med.codigoBarras}</span>
                  </div>
                )}

                {med.instruccionesGenerales && (
                  <p className="text-[11px] text-coffee-500 italic">
                    "{med.instruccionesGenerales}"
                  </p>
                )}

                {/* Stock Widget */}
                <div className={`p-3 rounded-xl border flex items-center justify-between ${
                  isLowStock
                    ? 'bg-amber-100 border-amber-500/30 text-amber-800'
                    : 'bg-cream-200/50 border-coffee-200/60 text-coffee-600'
                }`}>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider block font-bold">
                      {isLowStock ? '⚠️ ¡Resurtido Urgente!' : 'Stock en Farmacia'}
                    </span>
                    <span className="text-sm font-black text-coffee-900 font-mono">
                      {med.stockActual} <span className="text-xs font-normal text-coffee-500">{med.unidadMedida}</span>
                    </span>
                  </div>

                  {/* Stock adjust buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onAdjustStock(med.id, -1)}
                      className="w-7 h-7 rounded-lg bg-cream-200 hover:bg-coffee-200 text-coffee-700 flex items-center justify-center font-bold text-xs"
                      title="Restar 1"
                    >
                      -1
                    </button>
                    <button
                      onClick={() => onAdjustStock(med.id, 10)}
                      className="px-2 h-7 rounded-lg bg-terracotta-500/20 hover:bg-terracotta-500/30 text-terracotta-800 flex items-center justify-center font-bold text-xs border border-terracotta-500/30"
                      title="Resurtir +10"
                    >
                      +10
                    </button>
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-cream-200">
                <button
                  onClick={() => handleOpenEdit(med)}
                  className="p-1.5 rounded-lg bg-cream-200 hover:bg-coffee-200 text-coffee-600 hover:text-coffee-900 transition-colors"
                  title="Editar medicamento"
                >
                  <Edit className="w-4 h-4" />
                </button>
                {medicines.length > 1 && (
                  <button
                    onClick={() => {
                      if (confirm(`¿Dar de baja ${med.nombreComercial}?`)) {
                        onDeleteMedicine(med.id);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-cream-200 hover:bg-rose-950 text-coffee-500 hover:text-rose-400 transition-colors"
                    title="Dar de baja"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Medicine Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-cream-100 border border-cream-200 rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-100/90">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-terracotta-500/10 text-terracotta-400 border border-terracotta-500/20">
                  <Pill className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-coffee-900">
                  {editingMed ? 'Editar Medicamento' : 'Registrar Nuevo Medicamento'}
                </h3>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-coffee-500 hover:text-coffee-900 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Nombre Comercial *
                  </label>
                  <input
                    type="text"
                    required
                    value={nombreComercial}
                    onChange={(e) => setNombreComercial(e.target.value)}
                    placeholder="Ej. Losartán, Tempra, Ventolin"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Sustancia Activa (Genérico) *
                  </label>
                  <input
                    type="text"
                    required
                    value={sustanciaActiva}
                    onChange={(e) => setSustanciaActiva(e.target.value)}
                    placeholder="Ej. Losartán Potásico, Paracetamol"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Presentación
                  </label>
                  <select
                    value={presentacion}
                    onChange={(e) => setPresentacion(e.target.value as MedicinePresentation)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  >
                    {PRESENTATIONS.map(p => (
                      <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Concentración *
                  </label>
                  <input
                    type="text"
                    required
                    value={concentracion}
                    onChange={(e) => setConcentracion(e.target.value)}
                    placeholder="Ej. 50 mg, 500 mg, 100 mcg"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Laboratorio
                  </label>
                  <input
                    type="text"
                    value={laboratorio}
                    onChange={(e) => setLaboratorio(e.target.value)}
                    placeholder="Ej. Pfizer, Silanes, Merck"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-coffee-600 mb-1">
                    Código de Barras / QR (Opcional)
                  </label>
                  <input
                    type="text"
                    value={codigoBarras}
                    onChange={(e) => setCodigoBarras(e.target.value)}
                    placeholder="Ej. 7501234567890"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs focus:outline-none focus:border-terracotta-500 font-mono"
                  />
                </div>
              </div>

              {/* Stock controls */}
              <div className="p-3.5 rounded-2xl bg-cream-200/40 border border-cream-200 space-y-3">
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1.5">
                  <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
                  Control de Inventario y Resurtido
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-coffee-500 mb-1">Stock Disponible</label>
                    <input
                      type="number"
                      min="0"
                      value={stockActual}
                      onChange={(e) => setStockActual(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-coffee-500 mb-1">Mínimo para Alerta</label>
                    <input
                      type="number"
                      min="1"
                      value={stockMinimoAlerta}
                      onChange={(e) => setStockMinimoAlerta(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-coffee-500 mb-1">Unidad Medida</label>
                    <input
                      type="text"
                      value={unidadMedida}
                      onChange={(e) => setUnidadMedida(e.target.value)}
                      placeholder="tabletas, ml..."
                      className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-coffee-600 mb-1">
                  Instrucciones Generales de Conservación / Toma
                </label>
                <textarea
                  rows={2}
                  value={instruccionesGenerales}
                  onChange={(e) => setInstruccionesGenerales(e.target.value)}
                  placeholder="Ej. Mantener en lugar fresco y seco, lejos de la luz solar..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs placeholder:text-coffee-400 focus:outline-none focus:border-terracotta-500 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="esFavoritoCheck"
                  checked={esFavorito}
                  onChange={(e) => setEsFavorito(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 bg-cream-200 border-coffee-200"
                />
                <label htmlFor="esFavoritoCheck" className="text-xs text-coffee-600 flex items-center gap-1">
                  Marcar como medicamento favorito / frecuente
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-coffee-500 hover:text-coffee-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-terracotta-500 hover:bg-terracotta-400 text-white text-xs font-black transition-colors shadow-lg shadow-terracotta-500/20"
                >
                  {editingMed ? 'Guardar Cambios' : 'Registrar Medicamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={showScannerModal}
        onClose={() => setShowScannerModal(false)}
        medicines={medicines}
        onSelectMedicine={(med) => {
          handleOpenEdit(med);
        }}
      />
    </div>
  );
};
