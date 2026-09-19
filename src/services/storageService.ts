import { Patient, Doctor, Medicine, Prescription, DoseRecord, VitalSign, UserRole } from '../types';
import { INITIAL_PATIENTS, INITIAL_DOCTORS, INITIAL_MEDICINES, INITIAL_PRESCRIPTIONS, INITIAL_VITAL_SIGNS } from '../data/initialData';

const STORAGE_KEYS = {
  PATIENTS: 'medicontrol_patients_v1',
  DOCTORS: 'medicontrol_doctors_v1',
  MEDICINES: 'medicontrol_medicines_v1',
  PRESCRIPTIONS: 'medicontrol_prescriptions_v1',
  DOSE_RECORDS: 'medicontrol_dose_records_v1',
  VITAL_SIGNS: 'medicontrol_vital_signs_v1',
  ACTIVE_PATIENT_ID: 'medicontrol_active_patient_id_v1',
  USER_ROLE: 'medicontrol_user_role_v1',
  ACCESSIBILITY_MODE: 'medicontrol_accessibility_mode_v1',
};

class StorageService {
  // --- Initialization ---
  public initialize(): void {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      this.savePatients(INITIAL_PATIENTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOCTORS)) {
      this.saveDoctors(INITIAL_DOCTORS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
      this.saveMedicines(INITIAL_MEDICINES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS)) {
      this.savePrescriptions(INITIAL_PRESCRIPTIONS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.VITAL_SIGNS)) {
      this.saveVitalSigns(INITIAL_VITAL_SIGNS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT_ID)) {
      this.setActivePatientId('pat-1');
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_ROLE)) {
      this.setUserRole('cuidador');
    }
    if (!localStorage.getItem(STORAGE_KEYS.DOSE_RECORDS)) {
      // Seed some past dose records for demonstration of adherence and backlog
      const pastRecords: DoseRecord[] = [
        {
          id: 'dose-past-1',
          pacienteId: 'pat-1',
          recetaId: 'rec-1',
          prescripcionItemId: 'rec-med-4', // Omeprazol
          medicamentoId: 'med-6',
          fecha: '2026-09-01',
          horaProgramada: '07:30',
          horaReal: '07:35:12',
          estado: 'tomada',
          tipo: 'programada',
          stockDescontado: true
        },
        {
          id: 'dose-past-2',
          pacienteId: 'pat-1',
          recetaId: 'rec-1',
          prescripcionItemId: 'rec-med-1', // Losartan
          medicamentoId: 'med-1',
          fecha: '2026-09-01',
          horaProgramada: '08:00',
          horaReal: '08:02:40',
          estado: 'tomada',
          tipo: 'programada',
          stockDescontado: true
        },
        {
          id: 'dose-past-3',
          pacienteId: 'pat-1',
          recetaId: 'rec-1',
          prescripcionItemId: 'rec-med-2', // Metformina
          medicamentoId: 'med-2',
          fecha: '2026-09-01',
          horaProgramada: '14:30',
          horaReal: '14:45:00',
          estado: 'tomada',
          tipo: 'programada',
          stockDescontado: true
        },
        {
          id: 'dose-past-4',
          pacienteId: 'pat-1',
          recetaId: 'rec-1',
          prescripcionItemId: 'rec-med-2', // Metformina noche - omitida
          medicamentoId: 'med-2',
          fecha: '2026-09-01',
          horaProgramada: '20:30',
          estado: 'omitida',
          tipo: 'programada',
          motivoOmision: 'Paciente con malestar estomacal leve'
        },
        {
          id: 'dose-past-5',
          pacienteId: 'pat-1',
          recetaId: 'rec-1',
          prescripcionItemId: 'rec-med-3', // Atorvastatina
          medicamentoId: 'med-3',
          fecha: '2026-09-01',
          horaProgramada: '22:00',
          horaReal: '22:05:00',
          estado: 'tomada',
          tipo: 'programada',
          stockDescontado: true
        }
      ];
      this.saveDoseRecords(pastRecords);
    }
  }

  // --- Patients ---
  public getPatients(): Patient[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
      return data ? JSON.parse(data) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  }

  public savePatients(patients: Patient[]): void {
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
  }

  public savePatient(patient: Patient): void {
    const list = this.getPatients();
    const idx = list.findIndex(p => p.id === patient.id);
    if (idx >= 0) {
      list[idx] = patient;
    } else {
      list.push(patient);
    }
    this.savePatients(list);
  }

  public addPatient(patient: Patient): void {
    const list = this.getPatients();
    list.push(patient);
    this.savePatients(list);
  }

  public updatePatient(patient: Patient): void {
    const list = this.getPatients().map(p => (p.id === patient.id ? patient : p));
    this.savePatients(list);
  }

  public deletePatient(id: string): void {
    // Logical deletion
    const list = this.getPatients().map(p => (p.id === id ? { ...p, activo: false } : p));
    this.savePatients(list);
  }

  // --- Doctors ---
  public getDoctors(): Doctor[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCTORS);
      return data ? JSON.parse(data) : INITIAL_DOCTORS;
    } catch {
      return INITIAL_DOCTORS;
    }
  }

  public saveDoctors(doctors: Doctor[]): void {
    localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
  }

  public saveDoctor(doctor: Doctor): void {
    const list = this.getDoctors();
    const idx = list.findIndex(d => d.id === doctor.id);
    if (idx >= 0) {
      list[idx] = doctor;
    } else {
      list.push(doctor);
    }
    this.saveDoctors(list);
  }

  public addDoctor(doctor: Doctor): void {
    const list = this.getDoctors();
    list.push(doctor);
    this.saveDoctors(list);
  }

  public updateDoctor(doctor: Doctor): void {
    const list = this.getDoctors().map(d => (d.id === doctor.id ? doctor : d));
    this.saveDoctors(list);
  }

  public deleteDoctor(id: string): void {
    const list = this.getDoctors().map(d => (d.id === id ? { ...d, activo: false } : d));
    this.saveDoctors(list);
  }

  // --- Medicines ---
  public getMedicines(): Medicine[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
      return data ? JSON.parse(data) : INITIAL_MEDICINES;
    } catch {
      return INITIAL_MEDICINES;
    }
  }

  public saveMedicines(medicines: Medicine[]): void {
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
  }

  public saveMedicine(medicine: Medicine): void {
    const list = this.getMedicines();
    const idx = list.findIndex(m => m.id === medicine.id);
    if (idx >= 0) {
      list[idx] = medicine;
    } else {
      list.push(medicine);
    }
    this.saveMedicines(list);
  }

  public addMedicine(medicine: Medicine): void {
    const list = this.getMedicines();
    list.push(medicine);
    this.saveMedicines(list);
  }

  public updateMedicine(medicine: Medicine): void {
    const list = this.getMedicines().map(m => (m.id === medicine.id ? medicine : m));
    this.saveMedicines(list);
  }

  public deleteMedicine(id: string): void {
    const list = this.getMedicines().map(m => (m.id === id ? { ...m, activo: false } : m));
    this.saveMedicines(list);
  }

  public adjustMedicineStock(medicineId: string, delta: number): void {
    const medicines = this.getMedicines();
    const updated = medicines.map(m => {
      if (m.id === medicineId) {
        const newStock = Math.max(0, m.stockActual + delta);
        return { ...m, stockActual: newStock };
      }
      return m;
    });
    this.saveMedicines(updated);
  }

  // --- Prescriptions ---
  public getPrescriptions(): Prescription[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
      return data ? JSON.parse(data) : INITIAL_PRESCRIPTIONS;
    } catch {
      return INITIAL_PRESCRIPTIONS;
    }
  }

  public savePrescriptions(prescriptions: Prescription[]): void {
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
  }

  public savePrescription(prescription: Prescription): void {
    const list = this.getPrescriptions();
    const idx = list.findIndex(p => p.id === prescription.id);
    if (idx >= 0) {
      list[idx] = prescription;
    } else {
      list.push(prescription);
    }
    this.savePrescriptions(list);
  }

  public addPrescription(prescription: Prescription): void {
    const list = this.getPrescriptions();
    list.push(prescription);
    this.savePrescriptions(list);
  }

  public updatePrescription(prescription: Prescription): void {
    const list = this.getPrescriptions().map(p => (p.id === prescription.id ? prescription : p));
    this.savePrescriptions(list);
  }

  public deletePrescription(id: string): void {
    const list = this.getPrescriptions().map(p => (p.id === id ? { ...p, activo: false } : p));
    this.savePrescriptions(list);
  }

  // --- Dose Records ---
  public getDoseRecords(): DoseRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOSE_RECORDS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  public saveDoseRecords(records: DoseRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.DOSE_RECORDS, JSON.stringify(records));
  }

  public recordDose(record: DoseRecord): void {
    const records = this.getDoseRecords();
    const existingIndex = records.findIndex(
      r => r.pacienteId === record.pacienteId &&
           r.fecha === record.fecha &&
           r.horaProgramada === record.horaProgramada &&
           r.prescripcionItemId === record.prescripcionItemId
    );

    if (existingIndex >= 0) {
      records[existingIndex] = record;
    } else {
      records.push(record);
    }
    this.saveDoseRecords(records);
  }

  // --- Vital Signs ---
  public getVitalSigns(patientId?: string): VitalSign[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VITAL_SIGNS);
      const list: VitalSign[] = data ? JSON.parse(data) : INITIAL_VITAL_SIGNS;
      if (patientId) {
        return list.filter(v => v.pacienteId === patientId);
      }
      return list;
    } catch {
      return INITIAL_VITAL_SIGNS;
    }
  }

  public saveVitalSigns(signs: VitalSign[]): void {
    localStorage.setItem(STORAGE_KEYS.VITAL_SIGNS, JSON.stringify(signs));
  }

  public saveVitalSign(sign: VitalSign): void {
    const list = this.getVitalSigns();
    list.unshift(sign);
    this.saveVitalSigns(list);
  }

  public addVitalSign(sign: VitalSign): void {
    this.saveVitalSign(sign);
  }

  public deleteVitalSign(id: string): void {
    const list = this.getVitalSigns().filter(s => s.id !== id);
    this.saveVitalSigns(list);
  }

  // --- Active Patient & Preferences ---
  public getActivePatientId(): string {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_PATIENT_ID) || 'pat-1';
  }

  public setActivePatientId(id: string): void {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_PATIENT_ID, id);
  }

  public getUserRole(): UserRole {
    return (localStorage.getItem(STORAGE_KEYS.USER_ROLE) as UserRole) || 'cuidador';
  }

  public setUserRole(role: UserRole): void {
    localStorage.setItem(STORAGE_KEYS.USER_ROLE, role);
  }

  public getAccessibilityMode(): boolean {
    return localStorage.getItem(STORAGE_KEYS.ACCESSIBILITY_MODE) === 'true';
  }

  public setAccessibilityMode(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.ACCESSIBILITY_MODE, String(enabled));
  }

  // --- Reset / Backup ---
  public resetToDefault(): void {
    localStorage.clear();
    this.initialize();
  }

  public resetToInitialData(): void {
    this.resetToDefault();
  }

  public exportBackup(): string {
    const backup = {
      patients: this.getPatients(),
      doctors: this.getDoctors(),
      medicines: this.getMedicines(),
      prescriptions: this.getPrescriptions(),
      doseRecords: this.getDoseRecords(),
      vitalSigns: this.getVitalSigns(),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
    return JSON.stringify(backup, null, 2);
  }

  public exportFullBackupJSON(): string {
    return this.exportBackup();
  }

  public importBackup(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.patients) this.savePatients(data.patients);
      if (data.doctors) this.saveDoctors(data.doctors);
      if (data.medicines) this.saveMedicines(data.medicines);
      if (data.prescriptions) this.savePrescriptions(data.prescriptions);
      if (data.doseRecords) this.saveDoseRecords(data.doseRecords);
      if (data.vitalSigns) this.saveVitalSigns(data.vitalSigns);
      return true;
    } catch (e) {
      console.error('Import failed:', e);
      return false;
    }
  }

  public importFullBackupJSON(jsonString: string): boolean {
    return this.importBackup(jsonString);
  }
}

export const storageService = new StorageService();
