import { hasLowStock } from '../services/stockUtils';
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Medicine } from '../types';
import { QuickAddMedicineModal } from './QuickAddMedicineModal';
import { Search, ChevronDown, Check, Pill, AlertCircle, X, PlusCircle, Sparkles, Plus } from 'lucide-react';

interface MedicineSearchSelectProps {
  medicines: Medicine[];
  selectedMedicineId: string;
  onSelectMedicine: (medicineId: string) => void;
  onAddMedicine?: (newMedicine: Medicine) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const MedicineSearchSelect: React.FC<MedicineSearchSelectProps> = ({
  medicines,
  selectedMedicineId,
  onSelectMedicine,
  onAddMedicine,
  label = 'Medicamento',
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [quickAddInitialName, setQuickAddInitialName] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active medicines sorted alphabetically A-Z
  const sortedMedicines = useMemo(() => {
    return [...medicines]
      .filter((m) => m.activo)
      .sort((a, b) =>
        a.nombreComercial.localeCompare(b.nombreComercial, 'es', { sensitivity: 'base' })
      );
  }, [medicines]);

  // Letters that actually have at least one medicine
  const availableLetters = useMemo(() => {
    const lettersSet = new Set<string>();
    sortedMedicines.forEach((m) => {
      const firstChar = m.nombreComercial.trim().charAt(0).toUpperCase();
      if (firstChar) lettersSet.add(firstChar);
    });
    return lettersSet;
  }, [sortedMedicines]);

  // Filtered medicines based on search term & selected alphabet letter
  const filteredMedicines = useMemo(() => {
    return sortedMedicines.filter((m) => {
      // Filter by letter if active
      if (selectedLetter) {
        const firstChar = m.nombreComercial.trim().charAt(0).toUpperCase();
        if (firstChar !== selectedLetter) return false;
      }

      // Filter by text search
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      return (
        m.nombreComercial.toLowerCase().includes(term) ||
        m.sustanciaActiva.toLowerCase().includes(term) ||
        m.concentracion.toLowerCase().includes(term) ||
        m.presentacion.toLowerCase().includes(term) ||
        (m.categoria && m.categoria.toLowerCase().includes(term))
      );
    });
  }, [sortedMedicines, searchTerm, selectedLetter]);

  // Currently selected medicine object
  const selectedMed = useMemo(() => {
    return sortedMedicines.find((m) => m.id === selectedMedicineId);
  }, [sortedMedicines, selectedMedicineId]);

  // Group filtered medicines by first letter for clear visual sections
  const groupedMedicines = useMemo(() => {
    const groups: { [letter: string]: Medicine[] } = {};
    filteredMedicines.forEach((m) => {
      const letter = m.nombreComercial.trim().charAt(0).toUpperCase() || '#';
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(m);
    });
    return groups;
  }, [filteredMedicines]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (medId: string) => {
    onSelectMedicine(medId);
    setIsOpen(false);
    setSearchTerm('');
    setSelectedLetter(null);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedLetter(null);
    searchInputRef.current?.focus();
  };

  const handleOpenQuickAdd = (initialName: string = '') => {
    setQuickAddInitialName(initialName);
    setShowQuickAddModal(true);
  };

  const handleMedicineCreated = (newMed: Medicine) => {
    // Notify parent if handler is supplied
    if (onAddMedicine) {
      onAddMedicine(newMed);
    }
    // Select newly created medicine
    onSelectMedicine(newMed.id);
    setIsOpen(false);
    setSearchTerm('');
    setSelectedLetter(null);
  };

  return (
    <>
      <div className="relative w-full" ref={dropdownRef}>
        {label && (
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[11px] font-semibold text-coffee-500">
              {label}
            </label>
            <button
              type="button"
              onClick={() => handleOpenQuickAdd(searchTerm)}
              className="text-[11px] font-bold text-terracotta-400 hover:text-terracotta-700 flex items-center gap-1 hover:underline transition-colors"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>+ Nuevo Medicamento</span>
            </button>
          </div>
        )}

        {/* Main Trigger Button */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full text-left px-3 py-2 rounded-xl bg-cream-200 border transition-all flex items-center justify-between gap-2 ${
            isOpen
              ? 'border-terracotta-500 ring-2 ring-terracotta-500/20 bg-cream-200/90'
              : error
              ? 'border-rose-500 bg-rose-100'
              : 'border-coffee-200 hover:border-coffee-300'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-1.5 rounded-lg bg-terracotta-500/10 text-terracotta-400 border border-terracotta-500/20 shrink-0">
              <Pill className="w-3.5 h-3.5" />
            </div>
            {selectedMed ? (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-coffee-900 truncate">
                    {selectedMed.nombreComercial}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-coffee-200 text-coffee-600 font-mono shrink-0">
                    {selectedMed.concentracion}
                  </span>
                </div>
                <p className="text-[11px] text-coffee-500 truncate">
                  {selectedMed.sustanciaActiva} • {selectedMed.presentacion}
                </p>
              </div>
            ) : (
              <span className="text-xs text-coffee-400 italic">
                Seleccionar o buscar medicamento...
              </span>
            )}
          </div>

          <ChevronDown
            className={`w-4 h-4 text-coffee-500 shrink-0 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-terracotta-400' : ''
            }`}
          />
        </button>

        {/* Dropdown Panel */}
        {isOpen && (
          <div className="absolute z-50 left-0 right-0 mt-1.5 bg-cream-100 border border-coffee-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[400px] sm:max-h-[440px] animate-in fade-in slide-in-from-top-2 duration-150">
            {/* Search Box Header */}
            <div className="p-2.5 bg-cream-100/95 border-b border-cream-200 space-y-2">
              <div className="relative flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-coffee-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar por nombre, sustancia o presentación..."
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs placeholder:text-coffee-400 focus:outline-none focus:border-terracotta-500 transition-colors"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-coffee-500 hover:text-coffee-900 p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenQuickAdd(searchTerm)}
                  className="px-2.5 py-2 rounded-xl bg-terracotta-500/15 hover:bg-terracotta-500/25 text-terracotta-800 border border-terracotta-500/30 text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
                  title="Dar de alta nuevo medicamento al instante"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span className="hidden sm:inline">Nuevo</span>
                </button>
              </div>

              {/* Alphabet Quick Filter Bar */}
              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setSelectedLetter(null)}
                  className={`px-2 py-0.5 rounded-lg text-[10px] font-bold shrink-0 transition-colors ${
                    selectedLetter === null
                      ? 'bg-terracotta-500 text-white shadow-sm shadow-terracotta-500/20'
                      : 'bg-cream-200 text-coffee-500 hover:text-coffee-900 hover:bg-coffee-200'
                  }`}
                >
                  Todos (A-Z)
                </button>
                {ALPHABET.map((char) => {
                  const hasMeds = availableLetters.has(char);
                  const isCurrent = selectedLetter === char;
                  return (
                    <button
                      key={char}
                      type="button"
                      disabled={!hasMeds}
                      onClick={() => setSelectedLetter(isCurrent ? null : char)}
                      className={`w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center shrink-0 transition-colors ${
                        isCurrent
                          ? 'bg-terracotta-500 text-white font-black'
                          : hasMeds
                          ? 'bg-cream-200 text-coffee-600 hover:bg-coffee-200 hover:text-coffee-900'
                          : 'bg-cream-200/30 text-coffee-300 cursor-not-allowed opacity-40'
                      }`}
                      title={hasMeds ? `Ver medicamentos con ${char}` : `Sin medicamentos con ${char}`}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Results Summary Bar */}
            <div className="px-3 py-1.5 bg-cream-50/70 border-b border-cream-200/80 flex items-center justify-between text-[10px] text-coffee-500">
              <span>
                Orden A-Z • {filteredMedicines.length} de {sortedMedicines.length} medicamentos
              </span>
              {(searchTerm || selectedLetter) && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="text-terracotta-400 hover:underline flex items-center gap-1 font-semibold"
                >
                  Limpiar filtros
                </button>
              )}
            </div>

            {/* Medicines List Grouped Alphabetically */}
            <div className="overflow-y-auto p-1.5 space-y-2 max-h-64 sm:max-h-72">
              {filteredMedicines.length === 0 ? (
                <div className="text-center py-6 px-4 space-y-3">
                  <div className="p-3 w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mx-auto flex items-center justify-center">
                    <Pill className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-coffee-900">
                      ¿No encuentras el medicamento?
                    </p>
                    <p className="text-[11px] text-coffee-500 mt-0.5">
                      {searchTerm
                        ? `"${searchTerm}" no existe aún en el catálogo.`
                        : 'No hay medicamentos que coincidan con el filtro.'}
                    </p>
                  </div>

                  {/* Instant Add Button when not found */}
                  <button
                    type="button"
                    onClick={() => handleOpenQuickAdd(searchTerm)}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-terracotta-500 to-terracotta-600 hover:from-terracotta-400 hover:to-terracotta-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-terracotta-500/20 transition-all"
                  >
                    <PlusCircle className="w-4 h-4 stroke-[2.5]" />
                    <span>
                      {searchTerm ? `+ Dar de alta "${searchTerm}" al instante` : '+ Registrar Nuevo Medicamento'}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={handleClearFilters}
                    className="text-[11px] text-coffee-500 hover:text-coffee-700 underline"
                  >
                    Restablecer búsqueda
                  </button>
                </div>
              ) : (
                <>
                  {/* Option to create new even if results exist if user searched */}
                  {searchTerm.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleOpenQuickAdd(searchTerm)}
                      className="w-full p-2 rounded-xl bg-terracotta-500/10 hover:bg-terracotta-500/20 border border-terracotta-500/30 text-terracotta-800 text-xs font-bold flex items-center justify-between transition-colors"
                    >
                      <span className="flex items-center gap-2 truncate">
                        <Plus className="w-3.5 h-3.5 stroke-[3]" />
                        <span>¿No está en la lista? Dar de alta <strong>"{searchTerm}"</strong></span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-terracotta-500/20 text-terracotta-200 shrink-0">
                        Crear ahora
                      </span>
                    </button>
                  )}

                  {Object.keys(groupedMedicines)
                    .sort((a, b) => a.localeCompare(b, 'es'))
                    .map((letter) => (
                      <div key={letter} className="space-y-1">
                        <div className="sticky top-0 z-10 px-2 py-0.5 bg-cream-100/90 backdrop-blur-sm text-[10px] font-black text-terracotta-400 tracking-wider flex items-center gap-1.5 border-b border-cream-200/60">
                          <span className="w-4 h-4 rounded bg-terracotta-500/20 text-terracotta-800 flex items-center justify-center">
                            {letter}
                          </span>
                          <span>({groupedMedicines[letter].length})</span>
                        </div>

                        {groupedMedicines[letter].map((med) => {
                          const isSelected = med.id === selectedMedicineId;
                          const isLowStock = hasLowStock(med);

                          return (
                            <button
                              key={med.id}
                              type="button"
                              onClick={() => handleSelect(med.id)}
                              className={`w-full text-left p-2.5 rounded-xl transition-all flex items-center justify-between gap-3 ${
                                isSelected
                                  ? 'bg-terracotta-500/15 border border-terracotta-500/40 text-coffee-900'
                                  : 'hover:bg-cream-200/80 text-coffee-700 border border-transparent'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-coffee-900 truncate">
                                    {med.nombreComercial}
                                  </span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cream-200 text-terracotta-700 font-mono font-medium border border-coffee-200">
                                    {med.concentracion}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-coffee-500 mt-0.5 truncate">
                                  <span className="truncate">{med.sustanciaActiva}</span>
                                  <span>•</span>
                                  <span className="capitalize">{med.presentacion}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0">
                                {/* Stock badge */}
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1 ${
                                    isLowStock
                                      ? 'bg-amber-500/20 text-amber-800 border border-amber-500/30'
                                      : 'bg-cream-200 text-coffee-500'
                                  }`}
                                >
                                  {isLowStock && <AlertCircle className="w-2.5 h-2.5 text-amber-400" />}
                                  Stock: {med.stockActual}
                                </span>

                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-terracotta-500 text-white flex items-center justify-center">
                                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                                  </div>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                </>
              )}
            </div>

            {/* Bottom Quick Action Footer */}
            <div className="p-2 bg-cream-50 border-t border-cream-200 flex items-center justify-between">
              <span className="text-[10px] text-coffee-500">
                ¿Falta algún medicamento en el sistema?
              </span>
              <button
                type="button"
                onClick={() => handleOpenQuickAdd(searchTerm)}
                className="px-2.5 py-1 rounded-lg bg-terracotta-500/20 hover:bg-terracotta-500/30 text-terracotta-800 text-[11px] font-bold transition-colors flex items-center gap-1 border border-terracotta-500/30"
              >
                <Plus className="w-3 h-3 stroke-[3]" />
                <span>+ Agregar al catálogo</span>
              </button>
            </div>
          </div>
        )}

        {error && <p className="text-[10px] text-rose-400 mt-1">{error}</p>}
      </div>

      {/* Quick Add Modal */}
      <QuickAddMedicineModal
        isOpen={showQuickAddModal}
        onClose={() => setShowQuickAddModal(false)}
        initialName={quickAddInitialName}
        onMedicineCreated={handleMedicineCreated}
      />
    </>
  );
};
