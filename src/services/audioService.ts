import { NotificationSound } from '../types';

class AudioService {
  private ctx: AudioContext | null = null;

  private getAudioContext(): AudioContext | null {
    try {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  public playTone(sound: NotificationSound = 'carillon_suave'): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    switch (sound) {
      case 'campana_zen': {
        // Warm resonant bell
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(1046.5, now); // C6 overtone

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.8);
        osc2.stop(now + 1.8);
        break;
      }

      case 'pulso_clinico': {
        // Modern 2-tone hospital soft pulse
        [659.25, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.14;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.25, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 0.3);
        });
        break;
      }

      case 'carillon_suave': {
        // Pentatonic 3-note melody
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.12;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 0.8);
        });
        break;
      }

      case 'melodia_alerta': {
        // Distinct alert chime (E5 -> G#5 -> B5)
        const notes = [659.25, 830.61, 987.77];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.15;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.25, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 0.4);
        });
        break;
      }

      case 'bip_digital': {
        // Crisp double beep
        [800, 800].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.1;

          osc.type = 'square';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.12, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.06);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 0.06);
        });
        break;
      }

      case 'flauta_calma':
      default: {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.5);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.25, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);
        break;
      }
    }
  }

  public speak(text: string): void {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Try to find a Spanish voice
      const voices = window.speechSynthesis.getVoices();
      const spanishVoice = voices.find(v => v.lang.startsWith('es'));
      if (spanishVoice) {
        utterance.voice = spanishVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis not available:', e);
    }
  }

  public speakDoseReminder(patientName: string, medicineName: string, dose: string, instructions?: string): void {
    let msg = `Recordatorio para ${patientName}: es hora de tomar ${medicineName}, dosis: ${dose}.`;
    if (instructions) {
      msg += ` Indicación: ${instructions}.`;
    }
    this.speak(msg);
  }
}

export const audioService = new AudioService();
