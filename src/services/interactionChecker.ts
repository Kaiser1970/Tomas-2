import { Medicine, DrugInteractionAlert } from '../types';

interface KnownInteractionRule {
  substances: string[];
  nivelRiesgo: 'alto' | 'moderado' | 'leve';
  descripcion: string;
  recomendacion: string;
}

const KNOWN_INTERACTIONS: KnownInteractionRule[] = [
  {
    substances: ['losartán', 'ibuprofeno'],
    nivelRiesgo: 'moderado',
    descripcion: 'Los AINEs (como Ibuprofeno) pueden reducir el efecto antihipertensivo de Losartán y aumentar riesgo de daño renal.',
    recomendacion: 'Monitorear la presión arterial y considerar alternativas como Paracetamol para analgesia.'
  },
  {
    substances: ['losartán', 'aspirina'],
    nivelRiesgo: 'moderado',
    descripcion: 'Uso concomitante puede comprometer la función renal en adultos mayores deshidratados.',
    recomendacion: 'Evaluar dosis de aspirina protectora y mantener buena hidratación.'
  },
  {
    substances: ['atorvastatina', 'claritromicina'],
    nivelRiesgo: 'alto',
    descripcion: 'Inhibición del metabolismo de Atorvastatina, elevando niveles en sangre y riesgo de miopatía o rabdomiólisis.',
    recomendacion: 'Suspender temporalmente la estatina durante el tratamiento antibiótico.'
  },
  {
    substances: ['metformina', 'alcohol'],
    nivelRiesgo: 'alto',
    descripcion: 'Aumento significativo del riesgo de acidosis láctica.',
    recomendacion: 'Evitar consumo de bebidas alcohólicas.'
  }
];

export function checkInteractionsAndDuplicates(medicines: Medicine[]): DrugInteractionAlert[] {
  const alerts: DrugInteractionAlert[] = [];

  // 1. Check for Duplicate Active Substances
  const substanceMap = new Map<string, Medicine[]>();
  medicines.forEach(med => {
    const key = med.sustanciaActiva.trim().toLowerCase();
    if (!substanceMap.has(key)) {
      substanceMap.set(key, []);
    }
    substanceMap.get(key)!.push(med);
  });

  substanceMap.forEach((meds, substance) => {
    if (meds.length > 1) {
      alerts.push({
        medicamentos: meds.map(m => m.nombreComercial),
        sustancias: [substance],
        nivelRiesgo: 'alto',
        descripcion: `Duplicidad de sustancia activa: ${meds.map(m => m.nombreComercial).join(' y ')} contienen '${substance}'. Riesgo de sobredosis accidental.`,
        recomendacion: 'Verifique con el médico si se trata de un reemplazo o si una de las recetas debe suspenderse.'
      });
    }
  });

  // 2. Check Known Pairwise Interactions
  const lowerSubstances = medicines.map(m => ({
    name: m.nombreComercial,
    substance: m.sustanciaActiva.toLowerCase()
  }));

  KNOWN_INTERACTIONS.forEach(rule => {
    const matched = rule.substances.filter(sub => 
      lowerSubstances.some(item => item.substance.includes(sub) || item.name.toLowerCase().includes(sub))
    );

    if (matched.length === rule.substances.length) {
      const involvedMeds = lowerSubstances
        .filter(item => rule.substances.some(sub => item.substance.includes(sub) || item.name.toLowerCase().includes(sub)))
        .map(i => i.name);

      alerts.push({
        medicamentos: Array.from(new Set(involvedMeds)),
        sustancias: rule.substances,
        nivelRiesgo: rule.nivelRiesgo,
        descripcion: rule.descripcion,
        recomendacion: rule.recomendacion
      });
    }
  });

  return alerts;
}
