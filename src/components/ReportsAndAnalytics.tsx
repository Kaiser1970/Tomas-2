import React, { useState } from 'react';
import { 
  Patient, 
  Medicine, 
  DoseRecord, 
  VitalSign 
} from '../types';
import { storageService } from '../services/storageService';
import { calculateAge, getTodayDateString } from '../services/scheduleEngine';
import { 
  FileSpreadsheet, 
  Printer, 
  Sparkles, 
  TrendingUp, 
  AlertOctagon, 
  Activity, 
  Heart, 
  Calendar, 
  Download, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  User, 
  Bot,
  FileText,
  FileJson,
  RotateCcw,
  ShieldCheck,
  Copy,
  Check
} from 'lucide-react';
import { PROMPT_FINAL_TEXT } from '../services/promptContent';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  LineChart, 
  Line 
} from 'recharts';

interface ReportsAndAnalyticsProps {
  activePatient: Patient;
  patients: Patient[];
  medicines: Medicine[];
  onSelectPatient: (id: string) => void;
}

export const ReportsAndAnalytics: React.FC<ReportsAndAnalyticsProps> = ({
  activePatient,
  patients,
  medicines,
  onSelectPatient
}) => {
  const [dateRange, setDateRange] = useState<'7d' | '14d' | '30d'>('7d');
  const [vitalSigns, setVitalSigns] = useState<VitalSign[]>(storageService.getVitalSigns(activePatient.id));
  const [showVitalModal, setShowVitalModal] = useState(false);
  
  // Vital Form State
  const [sistolica, setSistolica] = useState(120);
  const [diastolica, setDiastolica] = useState(80);
  const [frecuenciaCardiaca, setFrecuenciaCardiaca] = useState(72);
  const [glucosa, setGlucosa] = useState(95);
  const [saturacionO2, setSaturacionO2] = useState(98);
  const [temperatura, setTemperatura] = useState(36.5);
  const [observacionesVital, setObservacionesVital] = useState('');

  // AI Summary State
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Prompt View & Download State
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const handleDownloadPromptDirectly = () => {
    try {
      const blob = new Blob([PROMPT_FINAL_TEXT], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'medicontrol_prompt_final.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      console.warn('Blob download error, trying data URI fallback:', e);
      try {
        const a = document.createElement('a');
        a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(PROMPT_FINAL_TEXT);
        a.download = 'medicontrol_prompt_final.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } catch (e2) {
        console.error('All download methods failed:', e2);
      }
    }
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(PROMPT_FINAL_TEXT);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Dose records for this patient
  const records = storageService.getDoseRecords().filter(r => r.pacienteId === activePatient.id);

  // Compute dates for the selected range
  const daysCount = dateRange === '7d' ? 7 : dateRange === '14d' ? 14 : 30;
  const daysArray: string[] = [];
  for (let i = daysCount - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    daysArray.push(d.toISOString().split('T')[0]);
  }

  // Build daily adherence stats for the chart
  const chartData = daysArray.map(day => {
    const dayRecords = records.filter(r => r.fecha === day);
    const taken = dayRecords.filter(r => r.estado === 'tomada').length;
    const omitted = dayRecords.filter(r => r.estado === 'omitida').length;
    const total = taken + omitted;
    const percent = total > 0 ? Math.round((taken / total) * 100) : 100;

    return {
      day: day.slice(5), // MM-DD
      fullDate: day,
      tomadas: taken,
      omitidas: omitted,
      adherencia: percent
    };
  });

  // Calculate totals
  const totalTakenInPeriod = chartData.reduce((acc, c) => acc + c.tomadas, 0);
  const totalOmittedInPeriod = chartData.reduce((acc, c) => acc + c.omitidas, 0);
  const totalDosesInPeriod = totalTakenInPeriod + totalOmittedInPeriod;
  const overallAdherence = totalDosesInPeriod > 0
    ? Math.round((totalTakenInPeriod / totalDosesInPeriod) * 100)
    : 100;

  // Omission List
  const omittedRecords = records
    .filter(r => r.estado === 'omitida')
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

  // Handle adding vital signs
  const handleAddVitalSign = (e: React.FormEvent) => {
    e.preventDefault();
    const now = new Date();
    const newVital: VitalSign = {
      id: `vit-${Date.now()}`,
      pacienteId: activePatient.id,
      fecha: now.toISOString().split('T')[0],
      hora: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      presionArterialSistolica: Number(sistolica),
      presionArterialDiastolica: Number(diastolica),
      frecuenciaCardiaca: Number(frecuenciaCardiaca),
      glucosaMgDl: Number(glucosa),
      saturacionOxigeno: Number(saturacionO2),
      temperatura: Number(temperatura),
      observaciones: observacionesVital.trim() || undefined
    };

    storageService.saveVitalSign(newVital);
    setVitalSigns(storageService.getVitalSigns(activePatient.id));
    setShowVitalModal(false);
  };

  // Resumen clínico de adherencia generado 100% en el dispositivo (sin internet, sin IA externa)
  const handleGenerateAiSummary = () => {
    setIsAiLoading(true);
    setAiSummary(null);

    const nivel =
      overallAdherence >= 90 ? 'óptimo' : overallAdherence >= 75 ? 'aceptable' : overallAdherence >= 50 ? 'bajo' : 'crítico';

    // Motivos de omisión más frecuentes
    const motivos = new Map<string, number>();
    omittedRecords.forEach(r => {
      const m = (r.motivoOmision || 'Sin motivo registrado').trim();
      motivos.set(m, (motivos.get(m) || 0) + 1);
    });
    const topMotivos = Array.from(motivos.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([m, n]) => `${m} (${n})`)
      .join('; ');

    // Promedios de signos vitales recientes
    const recientes = vitalSigns.slice(-5);
    const prom = (vals: (number | undefined)[]) => {
      const v = vals.filter((x): x is number => typeof x === 'number' && !isNaN(x) && x > 0);
      return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : null;
    };
    const sis = prom(recientes.map(v => v.presionArterialSistolica ?? v.presionSistolica));
    const dia = prom(recientes.map(v => v.presionArterialDiastolica ?? v.presionDiastolica));
    const glu = prom(recientes.map(v => v.glucosaMgDl ?? v.glucosa));
    const fc = prom(recientes.map(v => v.frecuenciaCardiaca));
    const sat = prom(recientes.map(v => v.saturacionOxigeno));

    const vitales: string[] = [];
    if (sis && dia) vitales.push(`presión arterial promedio ${sis}/${dia} mmHg`);
    if (glu) vitales.push(`glucosa promedio ${glu} mg/dL`);
    if (fc) vitales.push(`frecuencia cardíaca promedio ${fc} lpm`);
    if (sat) vitales.push(`saturación de oxígeno promedio ${sat}%`);

    const alertas: string[] = [];
    if (sis && (sis >= 140 || (dia ?? 0) >= 90)) alertas.push('presión arterial por arriba de lo esperado');
    if (glu && glu >= 180) alertas.push('glucosa elevada');
    if (sat && sat < 92) alertas.push('saturación de oxígeno baja');

    const lineas = [
      `**Resumen de adherencia de ${activePatient.nombre}** (últimos ${daysCount} días, generado en el dispositivo):`,
      '',
      `• **Adherencia:** ${overallAdherence}% (${nivel}) con ${totalTakenInPeriod} tomas confirmadas y ${totalOmittedInPeriod} omitidas.`,
      totalOmittedInPeriod > 0
        ? `• **Omisiones:** ${topMotivos || 'sin motivos registrados'}.`
        : '• **Omisiones:** ninguna registrada en el periodo.',
      vitales.length
        ? `• **Signos vitales recientes:** ${vitales.join('; ')}.`
        : '• **Signos vitales recientes:** sin registros en el periodo.',
      alertas.length
        ? `• **Atención:** ${alertas.join('; ')}. Comentar con el médico tratante.`
        : '• **Atención:** sin valores fuera de rango en los registros recientes.',
      overallAdherence < 75
        ? '• **Sugerencia:** revisar horarios y motivos de omisión con el paciente o cuidador para mejorar el apego.'
        : '• **Sugerencia:** mantener el esquema actual y vigilar el resurtido oportuno de los medicamentos.',
      '',
      '_Resumen informativo automático. No sustituye la valoración de un médico._'
    ];

    setAiSummary(lineas.join('\n'));
    setIsAiLoading(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Fecha', 'Hora Programada', 'Hora Real', 'Medicamento ID', 'Estado', 'Motivo Omision', 'Observaciones'],
      ...records.map(r => [
        r.fecha,
        r.horaProgramada,
        r.horaReal || '',
        r.medicamentoId,
        r.estado,
        r.motivoOmision || '',
        r.observaciones || ''
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `reporte_tomas_${activePatient.nombre.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Trigger browser print
  const handlePrint = () => {
    window.print();
  };

  const age = calculateAge(activePatient.fechaNacimiento);

  return (
    <div className="space-y-6">
      {/* Printable Official Header (Shown during window.print) */}
      <div className="hidden print:block space-y-4 mb-6 border-b-2 border-cream-100 pb-4 text-black">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black">MEDICONTROL • REPORTE CLÍNICO DE ADHERENCIA</h1>
            <p className="text-xs text-coffee-300">Generado el {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase">Expediente Clínico</span>
            <p className="text-sm font-mono font-black">PAC-{activePatient.id.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs bg-coffee-800 p-3 rounded-xl">
          <div>
            <strong>Paciente:</strong> {activePatient.nombre} ({age} años) - Sexo: {activePatient.sexo}
            <br />
            <strong>Alergias:</strong> {activePatient.alergias.join(', ') || 'Ninguna conocida'}
          </div>
          <div>
            <strong>Cuidador:</strong> {activePatient.cuidadorResponsable}
            <br />
            <strong>Contacto SOS:</strong> {activePatient.contactoEmergencia.nombre} ({activePatient.contactoEmergencia.telefono})
          </div>
        </div>
      </div>

      {/* Screen Header (Hidden on Print) */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-coffee-900 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-terracotta-400" />
            Reportes Clínicos y Adherencia Terapéutica
          </h2>
          <p className="text-xs text-coffee-500">
            Métricas de cumplimiento, registro de signos vitales y resúmenes para el médico tratante
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-600 text-xs font-semibold border border-coffee-200 transition-colors"
          >
            <Download className="w-4 h-4 text-terracotta-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cream-200 hover:bg-coffee-200 text-coffee-700 text-xs font-bold border border-coffee-200 transition-colors"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Imprimir Reporte</span>
          </button>

          <button
            onClick={handleGenerateAiSummary}
            disabled={isAiLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-coffee-900 font-bold text-xs transition-all shadow-lg shadow-purple-600/20 disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-amber-700" />
            <span>{isAiLoading ? 'Generando resumen...' : 'Resumen de Adherencia'}</span>
          </button>
        </div>
      </div>

      {/* Patient & Range Selector */}
      <div className="print:hidden flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-cream-100 border border-cream-200">
        <div className="flex items-center gap-2">
          <User className="w-4 h-4 text-terracotta-400" />
          <span className="text-xs text-coffee-500 font-semibold">Paciente:</span>
          <select
            value={activePatient.id}
            onChange={(e) => onSelectPatient(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 text-xs font-semibold focus:outline-none focus:border-terracotta-500"
          >
            {patients.filter(p => p.activo).map(p => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1.5 bg-cream-200/80 p-1 rounded-xl border border-coffee-200">
          {(['7d', '14d', '30d'] as const).map(range => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                dateRange === range
                  ? 'bg-terracotta-500 text-white shadow-sm'
                  : 'text-coffee-500 hover:text-coffee-900'
              }`}
            >
              {range === '7d' ? '7 Días' : range === '14d' ? '14 Días' : '30 Días'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200">
          <span className="text-xs text-coffee-500 font-semibold">Adherencia General</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400 font-mono">{overallAdherence}%</span>
          </div>
          <p className="text-[11px] text-coffee-400 mt-1">En {daysCount} días evaluados</p>
        </div>

        <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200">
          <span className="text-xs text-coffee-500 font-semibold">Tomas Confirmadas</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-coffee-900 font-mono">{totalTakenInPeriod}</span>
            <span className="text-xs text-emerald-400 font-bold">dosis</span>
          </div>
          <p className="text-[11px] text-coffee-400 mt-1">Cumplidas a tiempo</p>
        </div>

        <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200">
          <span className="text-xs text-coffee-500 font-semibold">Tomas Omitidas</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400 font-mono">{totalOmittedInPeriod}</span>
            <span className="text-xs text-rose-700 font-bold">dosis</span>
          </div>
          <p className="text-[11px] text-coffee-400 mt-1">Con causa documentada</p>
        </div>

        <div className="p-4 rounded-2xl bg-cream-100 border border-cream-200">
          <span className="text-xs text-coffee-500 font-semibold">Registro Signos Vitales</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-blue-400 font-mono">{vitalSigns.length}</span>
            <span className="text-xs text-blue-700 font-bold">tomas</span>
          </div>
          <p className="text-[11px] text-coffee-400 mt-1">Presión, glucosa y SpO2</p>
        </div>
      </div>

      {/* AI Clinical Summary Banner (if generated) */}
      {aiSummary && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/40 via-indigo-950/30 to-cream-100 border border-purple-500/30 space-y-3 animate-in fade-in">
          <div className="flex items-center gap-2 text-purple-700 text-sm font-bold">
            <Bot className="w-5 h-5 text-purple-400" />
            <span>Resumen de Adherencia del Paciente</span>
          </div>
          <div className="text-xs sm:text-sm text-coffee-700 leading-relaxed whitespace-pre-line bg-cream-50/40 p-4 rounded-2xl border border-purple-500/20">
            {aiSummary}
          </div>
        </div>
      )}

      {/* Adherence Chart */}
      <div className="p-5 rounded-3xl bg-cream-100 border border-cream-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-coffee-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-terracotta-400" />
            Tendencia de Adherencia Diaria (%)
          </h3>
          <span className="text-xs text-coffee-500 font-mono">Últimos {daysCount} días</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#DCC79A" opacity={0.6} />
              <XAxis dataKey="day" stroke="#7C5C3B" fontSize={11} />
              <YAxis stroke="#7C5C3B" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#F8F1E1', borderColor: '#DCC79A', borderRadius: '12px', color: '#2A1D13', fontSize: '12px' }}
              />
              <Bar dataKey="adherencia" name="% Adherencia" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Vital Signs Section */}
      <div className="p-5 rounded-3xl bg-cream-100 border border-cream-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            <h3 className="text-sm font-bold text-coffee-900">Signos Vitales y Parámetros Clínicos</h3>
          </div>

          <button
            onClick={() => setShowVitalModal(true)}
            className="print:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Registrar Signos</span>
          </button>
        </div>

        {vitalSigns.length === 0 ? (
          <p className="text-xs text-coffee-400 py-4 text-center">No hay signos vitales registrados para este paciente.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {vitalSigns.slice(-6).map((v) => (
              <div key={v.id} className="p-3.5 rounded-2xl bg-cream-200/50 border border-cream-200 space-y-2 text-xs">
                <div className="flex items-center justify-between text-coffee-500 text-[11px]">
                  <span>{v.fecha} • {v.hora}</span>
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <div>
                    <span className="text-[10px] text-coffee-500 block">P. Arterial</span>
                    <strong className="text-coffee-900 text-sm">{v.presionArterialSistolica}/{v.presionArterialDiastolica} <span className="text-[10px] font-normal text-coffee-500">mmHg</span></strong>
                  </div>
                  {v.glucosaMgDl && (
                    <div>
                      <span className="text-[10px] text-coffee-500 block">Glucosa</span>
                      <strong className="text-coffee-900 text-sm">{v.glucosaMgDl} <span className="text-[10px] font-normal text-coffee-500">mg/dL</span></strong>
                    </div>
                  )}
                  {v.frecuenciaCardiaca && (
                    <div>
                      <span className="text-[10px] text-coffee-500 block">Pulso</span>
                      <strong className="text-coffee-900 text-sm">{v.frecuenciaCardiaca} <span className="text-[10px] font-normal text-coffee-500">lpm</span></strong>
                    </div>
                  )}
                  {v.saturacionOxigeno && (
                    <div>
                      <span className="text-[10px] text-coffee-500 block">SpO2</span>
                      <strong className="text-emerald-400 text-sm">{v.saturacionOxigeno}%</strong>
                    </div>
                  )}
                </div>
                {v.observaciones && (
                  <p className="text-[11px] text-coffee-500 italic pt-1 border-t border-cream-200">
                    "{v.observaciones}"
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Omissions Audit Log */}
      <div className="p-5 rounded-3xl bg-cream-100 border border-cream-200 space-y-4">
        <div className="flex items-center gap-2">
          <AlertOctagon className="w-5 h-5 text-rose-400" />
          <h3 className="text-sm font-bold text-coffee-900">Bitácora de Tomas Omitidas y Motivos</h3>
        </div>

        {omittedRecords.length === 0 ? (
          <p className="text-xs text-coffee-500 py-3 text-center">¡Excelente! No hay omisiones registradas en el periodo.</p>
        ) : (
          <div className="space-y-2">
            {omittedRecords.slice(0, 10).map((om) => {
              const med = medicines.find(m => m.id === om.medicamentoId);

              return (
                <div key={om.id} className="p-3 rounded-xl bg-cream-200/40 border border-cream-200 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-coffee-900">{med?.nombreComercial || 'Medicamento'}</strong>
                      <span className="text-[10px] text-coffee-500 font-mono">{om.fecha} {om.horaProgramada}</span>
                    </div>
                    <p className="text-rose-700 text-[11px] mt-0.5">
                      Motivo: {om.motivoOmision || 'Sin especificar'}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-800 font-bold text-[10px] uppercase">
                    Omitida
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Respaldo y Prompt Técnico del Sistema */}
      <div className="p-5 rounded-3xl bg-cream-100 border border-cream-200 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-terracotta-400" />
            <div>
              <h3 className="text-sm font-bold text-coffee-900">Prompt Técnico & Especificación del Sistema</h3>
              <p className="text-xs text-coffee-500">Descarga directa o visualización del prompt clínico de la aplicación</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Card Descarga Inmediata */}
          <div className="p-4 rounded-2xl bg-terracotta-100/20 border border-terracotta-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-terracotta-500/10 text-terracotta-400 border border-terracotta-500/20">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs text-coffee-900 block">Descarga Directa (.txt)</strong>
                <span className="text-[11px] text-coffee-500">Generado en memoria (sin errores)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDownloadPromptDirectly}
              className="px-3 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
          </div>

          {/* Card Ver y Copiar Texto */}
          <div className="p-4 rounded-2xl bg-cream-200/50 border border-coffee-200/80 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <strong className="text-xs text-coffee-900 block">Ver en Pantalla / Copiar</strong>
                <span className="text-[11px] text-coffee-500">Lectura o copiado directo</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowPromptModal(true)}
              className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-md cursor-pointer"
            >
              <span>Ver Prompt</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal to register vital signs */}
      {showVitalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-cream-100 border border-cream-200 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200">
              <div className="flex items-center gap-2.5">
                <Activity className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-coffee-900">Registrar Signos Vitales</h3>
              </div>
              <button onClick={() => setShowVitalModal(false)} className="text-coffee-500 hover:text-coffee-900">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddVitalSign} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-coffee-600 font-semibold mb-1">Presión Sistólica (mmHg)</label>
                  <input
                    type="number"
                    value={sistolica}
                    onChange={(e) => setSistolica(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-coffee-600 font-semibold mb-1">Presión Diastólica (mmHg)</label>
                  <input
                    type="number"
                    value={diastolica}
                    onChange={(e) => setDiastolica(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-coffee-600 font-semibold mb-1">Glucosa (mg/dL)</label>
                  <input
                    type="number"
                    value={glucosa}
                    onChange={(e) => setGlucosa(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-coffee-600 font-semibold mb-1">Frec. Cardíaca (lpm)</label>
                  <input
                    type="number"
                    value={frecuenciaCardiaca}
                    onChange={(e) => setFrecuenciaCardiaca(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-coffee-600 font-semibold mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    value={saturacionO2}
                    onChange={(e) => setSaturacionO2(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-coffee-600 font-semibold mb-1">Temperatura (°C)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={temperatura}
                    onChange={(e) => setTemperatura(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-coffee-600 font-semibold mb-1">Observaciones</label>
                <input
                  type="text"
                  value={observacionesVital}
                  onChange={(e) => setObservacionesVital(e.target.value)}
                  placeholder="Ej. Medido después del desayuno..."
                  className="w-full px-3 py-2 rounded-xl bg-cream-200 border border-coffee-200 text-coffee-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-cream-200">
                <button
                  type="button"
                  onClick={() => setShowVitalModal(false)}
                  className="px-4 py-2 rounded-xl text-coffee-500 hover:text-coffee-900 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Guardar Signos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal to view and copy Prompt */}
      {showPromptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in">
          <div className="bg-cream-100 border border-cream-200 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-cream-200 bg-cream-100/90">
              <div className="flex items-center gap-2.5">
                <FileText className="w-5 h-5 text-terracotta-400" />
                <div>
                  <h3 className="text-base font-bold text-coffee-900">Prompt Técnico del Sistema (.txt)</h3>
                  <p className="text-[11px] text-coffee-500">Especificación clínica, modelos y reglas de cálculo</p>
                </div>
              </div>
              <button onClick={() => setShowPromptModal(false)} className="text-coffee-500 hover:text-coffee-900">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 flex-1 overflow-y-auto bg-cream-50/70">
              <pre className="text-[11px] font-mono text-coffee-600 whitespace-pre-wrap leading-relaxed select-all">
                {PROMPT_FINAL_TEXT}
              </pre>
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-t border-cream-200 bg-cream-100">
              <span className="text-xs text-coffee-500">235 líneas de especificación clínica</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyPrompt}
                  className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                    copiedPrompt 
                      ? 'bg-terracotta-500 text-white' 
                      : 'bg-cream-200 hover:bg-coffee-200 text-coffee-900'
                  }`}
                >
                  {copiedPrompt ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPrompt ? '¡Copiado!' : 'Copiar Todo'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPromptDirectly}
                  className="px-4 py-2 rounded-xl bg-terracotta-500 hover:bg-terracotta-400 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Archivo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
