import { hasLowStock } from './services/stockUtils';
import React, { useState, useEffect } from 'react';
import { 
  Patient, 
  Doctor, 
  Medicine, 
  Prescription, 
  AppTab, 
  UserRole 
} from './types';
import { storageService } from './services/storageService';
import { Header } from './components/Header';
import { PatientSwitcherModal } from './components/PatientSwitcherModal';
import { Dashboard } from './components/Dashboard';
import { PatientsManagement } from './components/PatientsManagement';
import { DoctorsManagement } from './components/DoctorsManagement';
import { MedicinesManagement } from './components/MedicinesManagement';
import { PrescriptionsManagement } from './components/PrescriptionsManagement';
import { ReportsAndAnalytics } from './components/ReportsAndAnalytics';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PromptModal } from './components/PromptModal';
import { SettingsModal } from './components/SettingsModal';
import { PaymentReminderBanner } from './components/PaymentReminderBanner';
import { initReminders, isNativeApp } from './services/reminderService';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('cuidador');
  const [accessibilityMode, setAccessibilityMode] = useState(false);

  // Core domain collections
  const [patients, setPatients] = useState<Patient[]>([]);
  const [activePatientId, setActivePatientId] = useState<string>('');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  // Modals
  const [showPatientSwitcher, setShowPatientSwitcher] = useState(false);
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Load and refresh state from storageService
  const refreshAllData = () => {
    const loadedPatients = storageService.getPatients();
    setPatients(loadedPatients);
    
    const savedActiveId = storageService.getActivePatientId();
    if (savedActiveId && loadedPatients.some(p => p.id === savedActiveId)) {
      setActivePatientId(savedActiveId);
    } else if (loadedPatients.length > 0) {
      setActivePatientId(loadedPatients[0].id);
      storageService.setActivePatientId(loadedPatients[0].id);
    }

    setDoctors(storageService.getDoctors());
    setMedicines(storageService.getMedicines());
    setPrescriptions(storageService.getPrescriptions());
  };

  useEffect(() => {
    refreshAllData();
    // Recordatorios locales del sistema (solo en la app Android instalada)
    void initReminders();
  }, []);

  const activePatient = patients.find(p => p.id === activePatientId) || patients[0];

  const handleSelectPatient = (id: string) => {
    setActivePatientId(id);
    storageService.setActivePatientId(id);
  };

  // Patient CRUD
  const handleAddPatient = (newPat: Patient) => {
    storageService.savePatient(newPat);
    refreshAllData();
    handleSelectPatient(newPat.id);
  };

  const handleUpdatePatient = (updated: Patient) => {
    storageService.savePatient(updated);
    refreshAllData();
  };

  const handleDeletePatient = (id: string) => {
    storageService.deletePatient(id);
    refreshAllData();
  };

  // Doctor CRUD
  const handleAddDoctor = (newDoc: Doctor) => {
    storageService.saveDoctor(newDoc);
    refreshAllData();
  };

  const handleUpdateDoctor = (updated: Doctor) => {
    storageService.saveDoctor(updated);
    refreshAllData();
  };

  const handleDeleteDoctor = (id: string) => {
    storageService.deleteDoctor(id);
    refreshAllData();
  };

  // Medicine CRUD & Stock
  const handleAddMedicine = (newMed: Medicine) => {
    storageService.saveMedicine(newMed);
    refreshAllData();
  };

  const handleUpdateMedicine = (updated: Medicine) => {
    storageService.saveMedicine(updated);
    refreshAllData();
  };

  const handleDeleteMedicine = (id: string) => {
    storageService.deleteMedicine(id);
    refreshAllData();
  };

  const handleAdjustStock = (id: string, delta: number) => {
    storageService.adjustMedicineStock(id, delta);
    refreshAllData();
  };

  // Prescription CRUD
  const handleAddPrescription = (newPresc: Prescription) => {
    storageService.savePrescription(newPresc);
    refreshAllData();
  };

  const handleUpdatePrescription = (updated: Prescription) => {
    storageService.savePrescription(updated);
    refreshAllData();
  };

  const handleDeletePrescription = (id: string) => {
    storageService.deletePrescription(id);
    refreshAllData();
  };

  // Check low stock count
  const lowStockCount = medicines.filter(m => m.activo && hasLowStock(m)).length;

  return (
    <div className={`min-h-screen bg-cream-50 text-coffee-800 flex flex-col selection:bg-terracotta-500 selection:text-white ${
      accessibilityMode ? 'accessibility-mode' : ''
    }`}>
      {/* Top Main Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        activePatient={activePatient}
        onOpenPatientSwitcher={() => setShowPatientSwitcher(true)}
        userRole={userRole}
        onRoleChange={setUserRole}
        accessibilityMode={accessibilityMode}
        onToggleAccessibility={() => setAccessibilityMode(!accessibilityMode)}
        lowStockCount={lowStockCount}
        onOpenPromptModal={() => setShowPromptModal(true)}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Aviso de mensualidad (no bloquea la app) */}
      <PaymentReminderBanner />

      {/* Main View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activePatient ? (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                activePatient={activePatient}
                patients={patients}
                medicines={medicines}
                doctors={doctors}
                prescriptions={prescriptions}
                onRefreshData={refreshAllData}
                onOpenPatientSwitcher={() => setShowPatientSwitcher(true)}
                accessibilityMode={accessibilityMode}
              />
            )}

            {activeTab === 'recetas' && (
              <PrescriptionsManagement
                prescriptions={prescriptions}
                patients={patients}
                doctors={doctors}
                medicines={medicines}
                activePatientId={activePatient.id}
                onAddPrescription={handleAddPrescription}
                onUpdatePrescription={handleUpdatePrescription}
                onDeletePrescription={handleDeletePrescription}
                onAddMedicine={handleAddMedicine}
              />
            )}

            {activeTab === 'medicamentos' && (
              <MedicinesManagement
                medicines={medicines}
                onAddMedicine={handleAddMedicine}
                onUpdateMedicine={handleUpdateMedicine}
                onDeleteMedicine={handleDeleteMedicine}
                onAdjustStock={handleAdjustStock}
              />
            )}

            {activeTab === 'pacientes' && (
              <PatientsManagement
                patients={patients}
                activePatientId={activePatient.id}
                onSelectActivePatient={handleSelectPatient}
                onAddPatient={handleAddPatient}
                onUpdatePatient={handleUpdatePatient}
                onDeletePatient={handleDeletePatient}
              />
            )}

            {activeTab === 'doctores' && (
              <DoctorsManagement
                doctors={doctors}
                prescriptions={prescriptions}
                onAddDoctor={handleAddDoctor}
                onUpdateDoctor={handleUpdateDoctor}
                onDeleteDoctor={handleDeleteDoctor}
              />
            )}

            {activeTab === 'reportes' && (
              <ReportsAndAnalytics
                activePatient={activePatient}
                patients={patients}
                medicines={medicines}
                onSelectPatient={handleSelectPatient}
              />
            )}
          </>
        ) : (
          <div className="space-y-6">
            <div className="rounded-3xl border border-terracotta-500/30 bg-terracotta-100/20 p-6 text-center space-y-3">
              <h2 className="text-xl font-bold text-coffee-900">Bienvenido a MediControl</h2>
              <p className="text-sm text-coffee-600 max-w-xl mx-auto">
                Empieza dando de alta a tu primer paciente. Después registra su receta y la app te avisará
                a la hora de cada dosis, incluso con la aplicación cerrada.
              </p>
              <button
                type="button"
                onClick={() => {
                  storageService.loadDemoData();
                  refreshAllData();
                }}
                className="text-xs text-coffee-500 hover:text-coffee-700 underline"
              >
                Prefiero ver primero una demostración con pacientes de ejemplo
              </button>
            </div>

            <PatientsManagement
              patients={patients}
              activePatientId=""
              onSelectActivePatient={handleSelectPatient}
              onAddPatient={handleAddPatient}
              onUpdatePatient={handleUpdatePatient}
              onDeletePatient={handleDeletePatient}
            />
          </div>
        )}
      </main>

      {/* Patient Switcher Modal */}
      <PatientSwitcherModal
        isOpen={showPatientSwitcher}
        onClose={() => setShowPatientSwitcher(false)}
        patients={patients}
        activePatientId={activePatientId}
        onSelectPatient={handleSelectPatient}
        onAddNewPatient={() => {
          setShowPatientSwitcher(false);
          setActiveTab('pacientes');
        }}
      />

      {/* Offline Status Floating Indicator */}
      {!isNativeApp() && <OfflineIndicator />}

      {showSettings && (
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onDataRestored={refreshAllData}
        />
      )}

      {/* Technical Prompt and System Specification Modal */}
      <PromptModal
        isOpen={showPromptModal}
        onClose={() => setShowPromptModal(false)}
      />
    </div>
  );
}
