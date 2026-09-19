import React, { useState } from 'react';
import { 
  Smartphone, 
  Download, 
  X, 
  QrCode, 
  Share2, 
  Check, 
  Apple, 
  Chrome, 
  CheckCircle2, 
  Globe, 
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface InstallAppModalProps {
  onClose: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'qr' | 'android' | 'ios' | 'offline'>('qr');

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-pre-szfk6q53jmtnx46bgvaoqj-684523138316.us-west2.run.app';
  
  // Clean URL for sharing
  const shareableUrl = currentUrl.split('#')[0];
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(shareableUrl)}&bgcolor=090d16&color=10b981&margin=10`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleShareWhatsApp = () => {
    const text = `💊 Te comparto la aplicación MediControl para instalar en tu celular: ${shareableUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleDownloadStandalonePackage = () => {
    const content = `================================================================================
GUÍA DE INSTALACIÓN DE MEDICONTROL EN CUALQUIER CELULAR (ANDROID / IPHONE)
================================================================================

1. ENLACE DIRECTO DE LA APLICACIÓN:
   ${shareableUrl}

2. INSTALACIÓN EN ANDROID (Samsung, Xiaomi, Motorola, Huawei, Pixel, etc.):
   a) Abre el enlace anterior en el navegador Google Chrome.
   b) Aparecerá una barra inferior diciendo "Instalar MediControl" o toca los 3 puntos (⋮) arriba a la derecha.
   c) Selecciona "Instalar aplicación" o "Agregar a la pantalla principal".
   d) ¡Listo! Se creará el icono de la aplicación en tu celular y funcionará a pantalla completa como una app nativa.

3. INSTALACIÓN EN IPHONE / IPAD (iOS Safari):
   a) Abre el enlace anterior en el navegador Safari.
   b) Toca el botón central de "Compartir" (el icono de cuadro con flecha hacia arriba ⎋).
   c) Desliza hacia abajo en las opciones y presiona "Agregar a la pantalla de inicio" (➕).
   d) Presiona "Agregar" en la esquina superior derecha.
   e) ¡Listo! MediControl se abrirá como app independiente sin barra de navegación.

4. CARACTERÍSTICAS INSTALADAS:
   ✓ Funciona 100% sin conexión a internet (offline).
   ✓ Notificaciones y alarmas con sintetizador armónico.
   ✓ Asistente de voz integrado.
   ✓ Almacenamiento seguro de recetas y medicamentos en tu teléfono.
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Instalacion_MediControl_Celulares.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-6 max-h-[90vh] overflow-y-auto space-y-5">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Instalar en Celulares
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  PWA Nativa
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Compatible con Android, iPhone, iPad y tablets sin descargas pesadas
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Device Fast Install Action Banner */}
        {isInstallable && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-slate-900 border border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 font-bold shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs sm:text-sm text-white block">¿Instalar en este celular ahora?</strong>
                <p className="text-[11px] text-slate-300">Añade el icono directamente a tu pantalla de inicio</p>
              </div>
            </div>
            <button
              type="button"
              onClick={install}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition-colors shadow-md"
            >
              <Download className="w-4 h-4" />
              <span>Instalar en este teléfono</span>
            </button>
          </div>
        )}

        {isInstalled && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Esta aplicación ya está instalada y activa en modo app en este dispositivo.</span>
          </div>
        )}

        {/* Tab Selection */}
        <div className="flex p-1 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'qr' ? 'bg-emerald-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Código QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'android' ? 'bg-emerald-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Chrome className="w-3.5 h-3.5" />
            <span>Android</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ios' ? 'bg-emerald-500 text-slate-950 font-bold shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iPhone / iPad</span>
          </button>
        </div>

        {/* Tab 1: QR Code & Sharing for other phones */}
        {activeTab === 'qr' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold text-white">Escanea para abrir en otro celular</span>
              <p className="text-[11px] text-slate-400">Apunta con la cámara de cualquier teléfono Android o iPhone</p>
            </div>

            <div className="flex justify-center">
              <div className="p-3 bg-[#090d16] border-2 border-emerald-500/40 rounded-3xl shadow-xl flex flex-col items-center">
                <img 
                  src={qrCodeUrl} 
                  alt="QR Code MediControl" 
                  className="w-48 h-48 sm:w-52 sm:h-52 rounded-2xl"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] text-emerald-400/80 font-mono mt-2">Escaneo directo y seguro</span>
              </div>
            </div>

            {/* URL Link and Actions */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-slate-300 block">Enlace directo de instalación:</label>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={shareableUrl}
                  className="w-full bg-transparent text-xs text-slate-300 focus:outline-none font-mono truncate"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                  <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-md"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Enviar por WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadStandalonePackage}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>Guía en Archivo (.txt)</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Android Step-by-Step */}
        {activeTab === 'android' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <Chrome className="w-4 h-4" />
                <span>Instrucciones para Android (Chrome, Edge, Samsung)</span>
              </div>
              <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside">
                <li className="leading-relaxed">
                  Abre el enlace en <strong>Google Chrome</strong> en el celular.
                </li>
                <li className="leading-relaxed">
                  Toca el menú de opciones (los <strong>tres puntos ⋮</strong> en la esquina superior derecha).
                </li>
                <li className="leading-relaxed">
                  Selecciona la opción <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.
                </li>
                <li className="leading-relaxed">
                  Confirma tocando <strong>"Instalar"</strong>.
                </li>
              </ol>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Una vez instalada, la app tendrá su propio icono en el cajón de aplicaciones de Android, funcionará sin conexión a internet y enviará recordatorios sonoros.
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: iOS Step-by-Step */}
        {activeTab === 'ios' && (
          <div className="space-y-4 animate-in fade-in">
            <div className="p-3 rounded-2xl bg-slate-800/40 border border-slate-700 space-y-3">
              <div className="flex items-center gap-2 text-sky-400 text-xs font-bold">
                <Apple className="w-4 h-4" />
                <span>Instrucciones para iPhone e iPad (Safari)</span>
              </div>
              <ol className="space-y-2.5 text-xs text-slate-300 list-decimal list-inside">
                <li className="leading-relaxed">
                  Abre el enlace en el navegador <strong>Safari</strong> de tu iPhone.
                </li>
                <li className="leading-relaxed">
                  Toca el botón central de <strong>Compartir</strong> (el icono de cuadro con flecha hacia arriba <strong>⎋</strong> en la barra inferior).
                </li>
                <li className="leading-relaxed">
                  Desliza hacia abajo en el menú y presiona <strong>"Agregar a la pantalla de inicio" (➕)</strong>.
                </li>
                <li className="leading-relaxed">
                  Presiona <strong>"Agregar"</strong> en la esquina superior derecha.
                </li>
              </ol>
            </div>

            <div className="p-3 rounded-2xl bg-sky-950/20 border border-sky-500/20 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-300 leading-relaxed">
                En iPhone, la app se iniciará como una aplicación nativa a pantalla completa sin la barra de direcciones de Safari.
              </p>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>No requiere Google Play ni App Store</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
