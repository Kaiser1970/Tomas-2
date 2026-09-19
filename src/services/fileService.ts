import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { AppLauncher } from '@capacitor/app-launcher';

/** Guarda un archivo de texto: en Android abre el menú "Compartir" (WhatsApp, correo, Drive...); en web lo descarga. */
export async function saveAndShareTextFile(filename: string, content: string, mime = 'application/json'): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    const written = await Filesystem.writeFile({
      path: filename,
      data: content,
      directory: Directory.Cache,
      encoding: Encoding.UTF8,
    });
    await Share.share({
      title: filename,
      text: 'Respaldo de MediControl',
      url: written.uri,
      dialogTitle: 'Guardar o enviar respaldo',
    });
    return;
  }
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Abre una URL externa (por ejemplo WhatsApp) fuera de la app. */
export async function openExternalUrl(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      await AppLauncher.openUrl({ url });
      return;
    } catch {
      /* cae al método web */
    }
  }
  window.open(url, '_blank', 'noopener');
}
