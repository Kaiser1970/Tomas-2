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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Escáner de Código de Barras / QR</h3>
              <p className="text-xs text-slate-400">Identificación rápida de medicamentos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Simulated Scanner viewfinder */}
          <div className="relative aspect-video rounded-2xl bg-slate-950 border-2 border-dashed border-emerald-500/50 flex flex-col items-center justify-center overflow-hidden">
            {isScanning ? (
              <div className="flex flex-col items-center gap-2 text-emerald-400 animate-pulse">
                <QrCode className="w-12 h-12" />
                <span className="text-xs font-mono font-bold tracking-widest">DECODIFICANDO CÓDIGO...</span>
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce" />
              </div>
            ) : (
              <div className="text-center p-4 space-y-2">
                <QrCode className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Alinea el código de barras o QR de la caja del medicamento
                </p>
                <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                  Lector Óptico Listo
                </span>
              </div>
            )}
          </div>

          {/* Quick presets for realistic testing */}
          <div>
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              Códigos de prueba registrados en catálogo:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {medicines.filter(m => m.codigoBarras).map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleSimulateScan(m.codigoBarras!)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs border border-slate-700 font-mono transition-colors"
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
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs placeholder:text-slate-500 font-mono focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </div>

          {/* Match preview */}
          {matchedMed ? (
            <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Medicamento Identificado
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  Stock: {matchedMed.stockActual} {matchedMed.unidadMedida}
                </span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{matchedMed.nombreComercial}</h4>
                <p className="text-xs text-slate-400">
                  {matchedMed.sustanciaActiva} • {matchedMed.concentracion} ({matchedMed.presentacion})
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onSelectMedicine(matchedMed);
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors shadow-lg shadow-emerald-500/20"
              >
                Seleccionar {matchedMed.nombreComercial}
              </button>
            </div>
          ) : code ? (
            <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>No se encontró ningún medicamento con el código ingresado.</span>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
