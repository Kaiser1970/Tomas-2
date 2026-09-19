import { Medicine, MedicinePresentation } from '../types';

/**
 * Catálogo de 100 medicamentos de uso ambulatorio frecuente, tomados del
 * Cuadro Básico y Catálogo de Medicamentos del Sector Salud (IMSS, cuadros básicos por grupo).
 *
 * Fuente: https://www.imss.gob.mx/profesionales-salud/cuadros-basicos/medicamentos
 *
 * IMPORTANTE:
 * - Las claves (010.000.xxxx.xx / 040.000.xxxx.xx) se capturaron de los PDF de cada grupo.
 *   Cuatro medicamentos se marcan con clave vacía ('') porque su clave no se pudo verificar;
 *   deben confirmarse en el cuadro básico vigente antes de usarse como referencia oficial.
 * - Este catálogo es solo de consulta para registrar tomas; no sustituye el criterio médico.
 */

type Row = [
  clave: string,
  sustancia: string,
  concentracion: string,
  forma: string,
  presentacion: MedicinePresentation,
  grupo: string,
  unidad: string
];

const ANALGESIA = 'Analgesia';
const CARDIO = 'Cardiología';
const HEMA = 'Hematología';
const ENDO = 'Endocrinología y Metabolismo';
const REUMA = 'Reumatología y Traumatología';
const INFEC = 'Enfermedades Infecciosas y Parasitarias';
const GASTRO = 'Gastroenterología';
const NEUMO = 'Neumología';
const ALERGIA = 'Enfermedades Inmunoalérgicas';
const NEURO = 'Neurología';
const PSIQ = 'Psiquiatría';
const NEFRO = 'Nefrología y Urología';

const ROWS: Row[] = [
  // --- Analgesia (7) ---
  ['010.000.0103.00', 'Ácido acetilsalicílico', '300 mg', 'Tableta soluble o efervescente', 'tabletas', ANALGESIA, 'tabletas'],
  ['010.000.0104.00', 'Paracetamol', '500 mg', 'Tableta', 'tabletas', ANALGESIA, 'tabletas'],
  ['010.000.0106.00', 'Paracetamol', '100 mg/mL', 'Solución oral', 'jarabe', ANALGESIA, 'ml'],
  ['010.000.5941.00', 'Ibuprofeno', '400 mg', 'Tableta o cápsula', 'tabletas', ANALGESIA, 'tabletas'],
  ['010.000.5942.00', 'Ibuprofeno', '600 mg', 'Tableta o cápsula', 'tabletas', ANALGESIA, 'tabletas'],
  ['010.000.5944.00', 'Ibuprofeno', '40 mg/mL', 'Suspensión oral', 'jarabe', ANALGESIA, 'ml'],
  ['010.000.0108.00', 'Metamizol sódico', '500 mg', 'Comprimido', 'tabletas', ANALGESIA, 'comprimidos'],
  ['040.000.2096.00', 'Tramadol-Paracetamol', '37.5 mg / 325 mg', 'Tableta', 'tabletas', ANALGESIA, 'tabletas'],

  // --- Cardiología (20) ---
  ['010.000.6222.00', 'Ácido acetilsalicílico', '100 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.2111.00', 'Amlodipino', '5 mg', 'Tableta o cápsula', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.6257.00', 'Bisoprolol', '5 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.0574.00', 'Captopril', '25 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.2545.00', 'Carvedilol', '6.25 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.4246.01', 'Clopidogrel', '75 mg', 'Gragea o tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.0561.00', 'Clortalidona', '50 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.0502.00', 'Digoxina', '0.25 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.2501.00', 'Enalapril', '10 mg', 'Cápsula o tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.0570.00', 'Hidralazina', '10 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.0593.00', 'Dinitrato de isosorbida', '10 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.0592.00', 'Dinitrato de isosorbida', '5 mg', 'Tableta sublingual', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.2520.00', 'Losartán', '50 mg', 'Gragea o comprimido recubierto', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.2521.00', 'Losartán / Hidroclorotiazida', '50 mg / 12.5 mg', 'Gragea o comprimido recubierto', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.0566.00', 'Metildopa', '250 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.0572.00', 'Metoprolol', '100 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.0599.00', 'Nifedipino', '30 mg', 'Comprimido de liberación prolongada', 'tabletas', CARDIO, 'comprimidos'],
  ['010.000.4110.00', 'Amiodarona', '200 mg', 'Tableta', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.2112.00', 'Diltiazem', '30 mg', 'Tableta o gragea', 'tabletas', CARDIO, 'tabletas'],
  ['010.000.4117.00', 'Pentoxifilina', '400 mg', 'Tableta o gragea de liberación prolongada', 'tabletas', CARDIO, 'tabletas'],

  // --- Hematología (4) ---
  ['010.000.0624.01', 'Acenocumarol', '4 mg', 'Tableta', 'tabletas', HEMA, 'tabletas'],
  ['010.000.5732.00', 'Apixabán', '5 mg', 'Tableta', 'tabletas', HEMA, 'tabletas'],
  ['010.000.1701.00', 'Fumarato ferroso', '200 mg (65.74 mg de hierro elemental)', 'Tableta', 'tabletas', HEMA, 'tabletas'],
  ['010.000.1702.00', 'Fumarato ferroso', '29 mg/mL (9.53 mg de hierro elemental/mL)', 'Suspensión oral', 'jarabe', HEMA, 'ml'],

  // --- Endocrinología y Metabolismo (12) ---
  ['010.000.5106.00', 'Atorvastatina', '20 mg', 'Tableta', 'tabletas', ENDO, 'tabletas'],
  ['010.000.4024.04', 'Ezetimiba', '10 mg', 'Tableta', 'tabletas', ENDO, 'tabletas'],
  ['010.000.1042.00', 'Glibenclamida', '5 mg', 'Tableta', 'tabletas', ENDO, 'tabletas'],
  ['010.000.6337.01', 'Glimepirida', '2 mg', 'Tableta', 'tabletas', ENDO, 'tabletas'],
  ['010.000.6007.00', 'Dapagliflozina', '10 mg', 'Tableta', 'tabletas', ENDO, 'tabletas'],
  ['010.000.6008.00', 'Empagliflozina', '10 mg', 'Tableta', 'tabletas', ENDO, 'tabletas'],
  ['010.000.1050.00', 'Insulina humana NPH', '100 UI/mL', 'Suspensión inyectable (frasco ámpula)', 'inyeccion', ENDO, 'UI'],
  ['010.000.4158.00', 'Insulina glargina', '100 UI/mL', 'Solución inyectable (cartucho)', 'inyeccion', ENDO, 'UI'],
  ['010.000.6000.00', 'Carbonato de calcio / Vitamina D3', '600 mg / 400 UI', 'Tableta', 'tabletas', ENDO, 'tabletas'],
  ['010.000.1095.00', 'Calcitriol', '0.25 µg', 'Cápsula', 'capsulas', ENDO, 'cápsulas'],
  ['010.000.7200.00', 'Dexametasona', '4 mg', 'Tableta', 'tabletas', ENDO, 'tabletas'],
  ['', 'Metformina', '850 mg', 'Tableta', 'tabletas', ENDO, 'tabletas'],
  ['', 'Levotiroxina sódica', '100 µg', 'Tableta', 'tabletas', ENDO, 'tabletas'],

  // --- Reumatología y Traumatología (9) ---
  ['010.000.3451.00', 'Alopurinol', '300 mg', 'Tableta', 'tabletas', REUMA, 'tabletas'],
  ['010.000.2503.00', 'Alopurinol', '100 mg', 'Tableta', 'tabletas', REUMA, 'tabletas'],
  ['010.000.5506.00', 'Celecoxib', '200 mg', 'Cápsula', 'capsulas', REUMA, 'cápsulas'],
  ['010.000.3423.00', 'Meloxicam', '15 mg', 'Tableta', 'tabletas', REUMA, 'tabletas'],
  ['010.000.3407.00', 'Naproxeno', '250 mg', 'Tableta', 'tabletas', REUMA, 'tabletas'],
  ['010.000.0472.00', 'Prednisona', '5 mg', 'Tableta', 'tabletas', REUMA, 'tabletas'],
  ['010.000.3461.00', 'Azatioprina', '50 mg', 'Tableta', 'tabletas', REUMA, 'tabletas'],
  ['010.000.4514.00', 'Leflunomida', '20 mg', 'Comprimido', 'tabletas', REUMA, 'comprimidos'],
  ['010.000.5699.00', 'Etoricoxib', '90 mg', 'Comprimido', 'tabletas', REUMA, 'comprimidos'],

  // --- Enfermedades Infecciosas y Parasitarias (13) ---
  ['010.000.2128.00', 'Amoxicilina', '500 mg', 'Cápsula', 'capsulas', INFEC, 'cápsulas'],
  ['010.000.2127.00', 'Amoxicilina', '500 mg/5 mL', 'Suspensión oral', 'jarabe', INFEC, 'ml'],
  ['010.000.2230.00', 'Amoxicilina / Ácido clavulánico', '500 mg / 125 mg', 'Tableta', 'tabletas', INFEC, 'tabletas'],
  ['010.000.1929.00', 'Ampicilina', '500 mg', 'Tableta o cápsula', 'capsulas', INFEC, 'cápsulas'],
  ['010.000.1969.00', 'Azitromicina', '500 mg', 'Tableta', 'tabletas', INFEC, 'tabletas'],
  ['010.000.1939.00', 'Cefalexina', '500 mg', 'Tableta o cápsula', 'capsulas', INFEC, 'cápsulas'],
  ['010.000.4255.00', 'Ciprofloxacino', '250 mg', 'Cápsula o tableta', 'tabletas', INFEC, 'tabletas'],
  ['010.000.2132.00', 'Claritromicina', '250 mg', 'Tableta', 'tabletas', INFEC, 'tabletas'],
  ['010.000.2133.00', 'Clindamicina', '300 mg', 'Cápsula', 'capsulas', INFEC, 'cápsulas'],
  ['010.000.1926.00', 'Dicloxacilina', '500 mg', 'Cápsula o comprimido', 'capsulas', INFEC, 'cápsulas'],
  ['010.000.2126.00', 'Aciclovir', '400 mg', 'Comprimido o tableta', 'tabletas', INFEC, 'tabletas'],
  ['010.000.1344.00', 'Albendazol', '200 mg', 'Tableta', 'tabletas', INFEC, 'tabletas'],
  ['', 'Trimetoprima / Sulfametoxazol', '160 mg / 800 mg', 'Tableta', 'tabletas', INFEC, 'tabletas'],
  ['', 'Metronidazol', '500 mg', 'Tableta', 'tabletas', INFEC, 'tabletas'],

  // --- Gastroenterología (7) ---
  ['010.000.1206.00', 'Butilhioscina', '10 mg', 'Gragea o tableta', 'tabletas', GASTRO, 'tabletas'],
  ['010.000.4184.00', 'Loperamida', '2 mg', 'Comprimido, tableta o gragea', 'tabletas', GASTRO, 'tabletas'],
  ['010.000.1242.00', 'Metoclopramida', '10 mg', 'Tableta', 'tabletas', GASTRO, 'tabletas'],
  ['010.000.6099.00', 'Lactulosa', '66.70 g/100 mL', 'Jarabe', 'jarabe', GASTRO, 'ml'],
  ['010.000.5186.00', 'Pantoprazol (o Rabeprazol / Omeprazol)', '40 mg (20 mg rabeprazol u omeprazol)', 'Tableta, gragea o cápsula', 'tabletas', GASTRO, 'tabletas'],
  ['010.000.5176.00', 'Sucralfato', '1 g', 'Tableta', 'tabletas', GASTRO, 'tabletas'],
  ['010.000.1272.00', 'Senósidos A-B', '187 mg (8.6 mg normalizado)', 'Tableta', 'tabletas', GASTRO, 'tabletas'],

  // --- Neumología (7) ---
  ['010.000.0429.00', 'Salbutamol', '100 µg por disparo', 'Suspensión en aerosol', 'inhalador', NEUMO, 'disparos'],
  ['010.000.2162.00', 'Ipratropio', '20 µg por disparo', 'Suspensión en aerosol', 'inhalador', NEUMO, 'disparos'],
  ['010.000.0446.00', 'Budesonida / Formoterol', '160 µg / 4.5 µg', 'Polvo para inhalación', 'inhalador', NEUMO, 'inhalaciones'],
  ['010.000.0442.00', 'Salmeterol / Fluticasona', '50 µg / 100 µg', 'Polvo para inhalación', 'inhalador', NEUMO, 'inhalaciones'],
  ['010.000.2262.00', 'Bromuro de tiotropio', '18 µg', 'Polvo para inhalación', 'inhalador', NEUMO, 'inhalaciones'],
  ['010.000.4330.00', 'Montelukast', '10 mg', 'Comprimido recubierto', 'tabletas', NEUMO, 'comprimidos'],
  ['010.000.2462.00', 'Ambroxol', '30 mg', 'Comprimido', 'tabletas', NEUMO, 'comprimidos'],

  // --- Enfermedades Inmunoalérgicas (3) ---
  ['010.000.2144.00', 'Loratadina', '10 mg', 'Tableta o gragea', 'tabletas', ALERGIA, 'tabletas'],
  ['010.000.0402.00', 'Clorfenamina', '4 mg', 'Tableta', 'tabletas', ALERGIA, 'tabletas'],
  ['010.000.3150.00', 'Levocetirizina', '5 mg', 'Tableta', 'tabletas', ALERGIA, 'tabletas'],

  // --- Neurología (7) ---
  ['040.000.2608.00', 'Carbamazepina', '200 mg', 'Tableta', 'tabletas', NEURO, 'tabletas'],
  ['010.000.2620.00', 'Ácido valproico', '250 mg', 'Cápsula', 'capsulas', NEURO, 'cápsulas'],
  ['010.000.0525.00', 'Fenitoína', '100 mg', 'Tableta o cápsula', 'tabletas', NEURO, 'tabletas'],
  ['010.000.4359.00', 'Gabapentina', '300 mg', 'Cápsula', 'capsulas', NEURO, 'cápsulas'],
  ['010.000.2617.00', 'Levetiracetam', '500 mg', 'Tableta', 'tabletas', NEURO, 'tabletas'],
  ['040.000.2654.00', 'Levodopa / Carbidopa', '250 mg / 25 mg', 'Tableta', 'tabletas', NEURO, 'tabletas'],
  ['010.000.4364.01', 'Donepecilo', '5 mg', 'Tableta', 'tabletas', NEURO, 'tabletas'],

  // --- Psiquiatría (4) ---
  ['040.000.2612.00', 'Clonazepam', '2 mg', 'Tableta', 'tabletas', PSIQ, 'tabletas'],
  ['040.000.4484.00', 'Sertralina', '50 mg', 'Cápsula o tableta', 'tabletas', PSIQ, 'tabletas'],
  ['010.000.4483.00', 'Fluoxetina', '20 mg', 'Cápsula o tableta', 'capsulas', PSIQ, 'cápsulas'],
  ['040.000.6298.00', 'Alprazolam', '0.5 mg', 'Tableta', 'tabletas', PSIQ, 'tabletas'],

  // --- Nefrología y Urología (4) ---
  ['010.000.2307.00', 'Furosemida', '40 mg', 'Tableta', 'tabletas', NEFRO, 'tabletas'],
  ['010.000.2304.00', 'Espironolactona', '25 mg', 'Tableta', 'tabletas', NEFRO, 'tabletas'],
  ['010.000.2301.00', 'Hidroclorotiazida', '25 mg', 'Tableta', 'tabletas', NEFRO, 'tabletas'],
  ['010.000.5309.02', 'Tamsulosina', '0.4 mg', 'Cápsula de liberación prolongada', 'capsulas', NEFRO, 'cápsulas'],
];

export const IMSS_CATALOG_ID_PREFIX = 'imss-';

export const IMSS_CATALOG: Medicine[] = ROWS.map(
  ([clave, sustancia, concentracion, forma, presentacion, grupo, unidad], i) => ({
    id: `${IMSS_CATALOG_ID_PREFIX}${String(i + 1).padStart(3, '0')}`,
    nombreComercial: sustancia,
    sustanciaActiva: sustancia,
    presentacion,
    concentracion,
    stockActual: 0,
    stockMinimoAlerta: 0,
    unidadMedida: unidad,
    claveCBM: clave || undefined,
    formaFarmaceutica: forma,
    grupoTerapeutico: grupo,
    origenCatalogo: 'IMSS',
    activo: true,
    creadoEn: '2026-09-19T00:00:00Z',
  })
);
