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
import { ReminderSettingsCard } from './ReminderSettingsCard';
import { SubscriptionCard } from './SubscriptionCard';
import { saveAndShareTextFile } from '../services/fileService';
import { isNativeApp } from '../services/reminderService';

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

  const handleExportBackup = async () => {
    try {
      const jsonStr = storageService.exportFullBackupJSON();
      await saveAndShareTextFile(`medicontrol_respaldo_${new Date().toISOString().slice(0, 10)}.json`, jsonStr, 'application/json');
      setRestoreStatus('¡Respaldo generado! Guárdalo en un lugar seguro (Drive, correo o WhatsApp).');
      setTimeout(() => setRestoreStatus(null), 4000);
    } catch {
      setRestoreStatus('Error al generar el respaldo.');
    }
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
    if (confirm('Esto reemplaza TODOS tus datos por pacientes y recetas de ejemplo. ¿Continuar?')) {
      storageService.resetToInitialData();
      onDataRestored();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-cream-100 border border-cream-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-100/90">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cream-200 text-coffee-600 border border-coffee-200">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-coffee-900">Configuración del Sistema</h3>
              <p className="text-xs text-coffee-500">Copias de seguridad, tonos de alerta y datos</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-coffee-500 hover:text-coffee-900 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {restoreStatus && (
            <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
              restoreStatus.startsWith('¡') ? 'bg-terracotta-100/40 text-terracotta-700 border border-terracotta-500/30' : 'bg-rose-100 text-rose-700 border border-rose-500/30'
            }`}>
              <CheckCircle2 className="w-4 h-4" />
              <span>{restoreStatus}</span>
            </div>
          )}

          <ReminderSettingsCard />

          <div className="pt-3 border-t border-cream-200">
            <SubscriptionCard />
          </div>

          {/* Mobile Installation Action */}
          {onOpenInstall && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-terracotta-100/50 via-teal-950/30 to-cream-100 border border-terracotta-500/40 flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-terracotta-500 text-white font-bold shrink-0">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="text-xs font-bold text-coffee-900 block">Instalar en otros Celulares</strong>
                  <p className="text-[11px] text-coffee-600">Genera código QR o enlace para Android e iPhone</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstall();
                }}
                className="px-3.5 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-400 text-white font-bold text-xs shrink-0 transition-colors shadow-sm"
              >
                Abrir QR
              </button>
            </div>
          )}

          {/* Backup & Restore */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-coffee-500 uppercase tracking-wider flex items-center gap-1.5">
              <FileJson className="w-4 h-4 text-terracotta-400" />
              Respaldo y Portabilidad de Datos
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-cream-200/60 hover:bg-cream-200 border border-coffee-200 text-coffee-700 transition-colors text-xs font-semibold"
              >
                <Download className="w-5 h-5 text-terracotta-400" />
                <span>Exportar JSON</span>
              </button>

              <label className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-cream-200/60 hover:bg-cream-200 border border-coffee-200 text-coffee-700 transition-colors text-xs font-semibold cursor-pointer">
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
            {!isNativeApp() && (
            <div className="p-3.5 rounded-2xl bg-terracotta-100/20 border border-terracotta-500/30 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-terracotta-500/10 text-terracotta-400 border border-terracotta-500/20">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-coffee-900 block">Prompt Final del Sistema (.txt)</span>
                  <p className="text-[11px] text-coffee-500">Especificación técnica y funcional completa para desarrollo</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadPrompt}
                className="px-3 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-400 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-lg shadow-terracotta-100/40"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>
            </div>
            )}
            
            <p className="text-[11px] text-coffee-400">
              Guarda un archivo de respaldo con pacientes, recetas, historial de tomas y catálogo de medicamentos.
            </p>
          </div>

          {/* Audio Synthesizer Test */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-coffee-500 uppercase tracking-wider flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-terracotta-400" />
              Prueba de Tonos de Notificación
            </h4>

            <div className="grid grid-cols-2 gap-2">
              {TONES_LIST.map((tone) => (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => audioService.playTone(tone.id)}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-600 hover:text-coffee-900 border border-coffee-200/80 text-xs transition-colors text-left"
                >
                  <Volume2 className="w-3.5 h-3.5 text-terracotta-400 shrink-0" />
                  <span className="truncate">{tone.name.split('(')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Reset Factory Data */}
          <div className="pt-3 border-t border-cream-200 space-y-2">
            <h4 className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              Datos de Demostración
            </h4>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-coffee-500">
                Reemplaza tus datos por pacientes, recetas y tomas de ejemplo. Haz un respaldo antes.
              </p>
              <button
                type="button"
                onClick={handleResetData}
                className="px-3 py-1.5 rounded-xl bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-500/30 text-xs font-bold transition-colors"
              >
                Cargar demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
