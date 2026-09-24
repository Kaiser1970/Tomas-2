import React, { useState } from 'react';
import { Medicine } from '../types';
import { X, QrCode, Search, Check, Sparkles, AlertCircle } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  medicines: Medicine[];
  onSelectMedicine: (medicine: Medicine) => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  medicines,
  onSelectMedicine
}) => {
  if (!isOpen) return null;

  const [code, setCode] = useState('');
  const [matchedMed, setMatchedMed] = useState<Medicine | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleSearchCode = (inputCode: string) => {
    setCode(inputCode);
    const found = medicines.find(
      m => m.codigoBarras === inputCode.trim() || 
           m.id.toLowerCase() === inputCode.toLowerCase() ||
           m.nombreComercial.toLowerCase().includes(inputCode.toLowerCase())
    );
    setMatchedMed(found || null);
  };

  const handleSimulateScan = (sampleCode: string) => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      handleSearchCode(sampleCode);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-cream-100 border border-cream-200 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-100/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-terracotta-500/10 text-terracotta-400 border border-terracotta-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-coffee-900">Escáner de Código de Barras / QR</h3>
              <p className="text-xs text-coffee-500">Identificación rápida de medicamentos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-coffee-500 hover:text-coffee-900 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Simulated Scanner viewfinder */}
          <div className="relative aspect-video rounded-2xl bg-cream-50 border-2 border-dashed border-terracotta-500/50 flex flex-col items-center justify-center overflow-hidden">
            {isScanning ? (
              <div className="flex flex-col items-center gap-2 text-terracotta-400 animate-pulse">
                <QrCode className="w-12 h-12" />
                <span className="text-xs font-mono font-bold tracking-widest">DECODIFICANDO CÓDIGO...</span>
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-terracotta-400 shadow-[0_0_15px_#D68A54] animate-bounce" />
              </div>
            ) : (
              <div className="text-center p-4 space-y-2">
                <QrCode className="w-10 h-10 text-coffee-300 mx-auto" />
                <p className="text-xs text-coffee-500">
                  Alinea el código de barras o QR de la caja del medicamento
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cream-200 text-coffee-600 font-mono">
                  Lector Óptico Listo
                </span>
              </div>
            )}
          </div>

          {/* Quick presets for realistic testing */}
          <div>
            <span className="text-xs font-semibold text-coffee-500 block mb-2">
              Códigos de prueba registrados en catálogo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {medicines.filter(m => m.codigoBarras).map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSimulateScan(m.codigoBarras!)}
                  className="px-2.5 py-1.5 rounded-lg bg-cream-200 hover:bg-coffee-200 text-coffee-600 text-xs border border-coffee-200 font-mono transition-colors"
                >
                  ⚡ {m.nombreComercial} ({m.codigoBarras})
                </button>
              ))}
            </div>
          </div>

          {/* Manual Input */}
          <div className="relative">
            <input
              type="text"
              value={code}
              onChange={(e) => handleSearchCode(e.target.value)}
              placeholder="O ingresa el código numérico manualmente..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs placeholder:text-coffee-400 font-mono focus:outline-none focus:border-terracotta-500"
            />
            <Search className="w-4 h-4 text-coffee-500 absolute left-3 top-3" />
          </div>

          {/* Match preview */}
          {matchedMed ? (
            <div className="p-3.5 rounded-xl bg-terracotta-100/30 border border-terracotta-500/40 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-terracotta-700 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-terracotta-400" />
                  Medicamento Identificado
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-terracotta-500/20 text-terracotta-800 font-mono">
                  Stock: {matchedMed.stockActual} {matchedMed.unidadMedida}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-coffee-900">{matchedMed.nombreComercial}</h4>
                <p className="text-xs text-coffee-500">
                  {matchedMed.sustanciaActiva} • {matchedMed.concentracion} ({matchedMed.presentacion})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectMedicine(matchedMed);
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-400 text-white text-xs font-bold transition-colors shadow-lg shadow-terracotta-500/20"
              >
                Seleccionar {matchedMed.nombreComercial}
              </button>
            </div>
          ) : code ? (
            <div className="p-3 rounded-xl bg-cream-200/60 border border-coffee-200 text-center text-xs text-coffee-500 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>No se encontró ningún medicamento con el código ingresado.</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
