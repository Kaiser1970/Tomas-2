import React, { useState } from 'react';
import { storageService } from '../services/storageService';
import { audioService } from '../services/audioService';
import { 
  Settings, 
  Download, 
  Upload, 
  RotateCcw, 
  Volume2, 
  ShieldCheck, 
  X, 
  FileJson, 
  FileText,
  CheckCircle2, 
  AlertTriangle,
  Smartphone
} from 'lucide-react';
import { NotificationSound } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
  onOpenInstall?: () => void;
}

const TONES_LIST: { id: NotificationSound; name: string }[] = [
  { id: 'campana_zen', name: 'Campana Zen (Campana armónica)' },
  { id: 'pulso_clinico', name: 'Pulso Clínico (2 tonos suaves)' },
  { id: 'carillon_suave', name: 'Carillón Suave (Secuencia pentatónica)' },
  { id: 'melodia_alerta', name: 'Melodía Alerta (Triple tono distintivo)' },
  { id: 'bip_digital', name: 'Bip Digital (Reloj inteligente)' },
  { id: 'flauta_calma', name: 'Flauta Calma (Tono de viento relajante)' },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onDataRestored,
  onOpenInstall
}) => {
  if (!isOpen) return null;

  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);

  const handleExportBackup = () => {
    const jsonStr = storageService.exportFullBackupJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medicontrol_respaldo_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPrompt = async () => {
    try {
      const response = await fetch('/prompt_final_aplicacion.txt');
      const text = await response.text();
      const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'medicontrol_prompt_final.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setRestoreStatus('¡Prompt descargado exitosamente como archivo de texto!');
      setTimeout(() => setRestoreStatus(null), 3000);
    } catch {
      setRestoreStatus('Error al descargar el archivo del prompt.');
    }
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = storageService.importFullBackupJSON(content);
      if (success) {
        setRestoreStatus('¡Respaldo importado correctamente!');
        setTimeout(() => {
          onDataRestored();
          onClose();
        }, 1200);
      } else {
        setRestoreStatus('Error: El archivo no tiene el formato válido de respaldo.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('¿Estás seguro de restablecer todos los datos a la configuración inicial de prueba?')) {
      storageService.resetToInitialData();
      onDataRestored();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Configuración del Sistema</h3>
              <p className="text-xs text-slate-400">Copias de seguridad, tonos de alerta y datos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {restoreStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              restoreStatus.startsWith('¡') ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{restoreStatus}</span>
            </div>
          )}

          {/* Mobile Installation Action */}
          {onOpenInstall && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/30 to-slate-900 border border-emerald-500/40 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-white block">Instalar en otros Celulares</strong>
                  <p className="text-[11px] text-slate-300">Genera código QR o enlace para Android e iPhone</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstall();
                }}
                className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 transition-colors shadow-sm"
              >
                Abrir QR
              </button>
            </div>
          )}

          {/* Backup & Restore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-emerald-400" />
              Respaldo y Portabilidad de Datos
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors text-xs font-semibold"
              >
                <Download className="w-5 h-5 text-emerald-400" />
                <span>Exportar JSON</span>
              </button>

              <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700 text-slate-200 transition-colors text-xs font-semibold cursor-pointer">
                <Upload className="w-5 h-5 text-blue-400" />
                <span>Importar JSON</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

            {/* Final Application Specification Prompt Download */}
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Prompt Final del Sistema (.txt)</span>
                  <p className="text-[11px] text-slate-400">Especificación técnica y funcional completa para desarrollo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadPrompt}
                className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-lg shadow-emerald-950/40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>
            
            <p className="text-[11px] text-slate-500">
              Guarda un archivo de respaldo con pacientes, recetas, historial de tomas y catálogo de medicamentos.
            </p>
          </div>

          {/* Audio Synthesizer Test */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              Prueba de Tonos de Notificación
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {TONES_LIST.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => audioService.playTone(tone.id)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 text-xs transition-colors text-left"
                >
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{tone.name.split('(')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Factory Data */}
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Restablecer Datos de Demostración
            </h4>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-400">
                Restaura el conjunto de pacientes, recetas y tomas predeterminadas.
              </p>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
              >
                Restablecer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
