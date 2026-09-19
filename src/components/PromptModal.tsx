import React, { useState } from 'react';
import { FileText, Download, Copy, Check, ExternalLink, X, AlertCircle } from 'lucide-react';
import { PROMPT_FINAL_TEXT } from '../services/promptContent';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PromptModal: React.FC<PromptModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_FINAL_TEXT);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error('Error copying text:', e);
    }
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([PROMPT_FINAL_TEXT], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medicontrol_prompt_final.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(null), 3000);
    } catch (err) {
      console.warn('Direct blob download failed, falling back to data URI:', err);
      try {
        const a = document.createElement('a');
        a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(PROMPT_FINAL_TEXT);
        a.download = 'medicontrol_prompt_final.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setDownloadSuccess(true);
        setTimeout(() => setDownloadSuccess(null), 3000);
      } catch (e2) {
        console.error('Download failed:', e2);
        setDownloadSuccess(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Prompt Técnico del Sistema (.txt)</h3>
              <p className="text-xs text-slate-400">Especificación clínica, arquitectura, reglas de negocio y esquemas</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tip banner for iframes */}
        <div className="px-6 py-2.5 bg-emerald-950/40 border-b border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
          <span className="text-emerald-300 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Si el navegador bloquea la descarga por estar en un visor, usa <strong>"Copiar Todo"</strong> o <strong>"Abrir en pestaña"</strong>.</span>
          </span>
          <a
            href="/prompt_final_aplicacion.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold text-[11px] shrink-0 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Abrir archivo</span>
          </a>
        </div>

        {/* Prompt Content Preview */}
        <div className="p-5 flex-1 overflow-y-auto bg-slate-950/80">
          <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed select-all">
            {PROMPT_FINAL_TEXT}
          </pre>
        </div>

        {/* Actions Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-slate-800 bg-slate-900">
          <span className="text-xs text-slate-400 font-medium">
            235 líneas • Archivo de texto plano UTF-8
          </span>

          <div className="flex items-center gap-2.5">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                copied 
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20' 
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Texto Copiado!' : 'Copiar Todo'}</span>
            </button>

            {/* Direct download button */}
            <button
              type="button"
              onClick={handleDownload}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" />
              <span>{downloadSuccess ? '¡Descargado!' : 'Descargar .TXT'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
