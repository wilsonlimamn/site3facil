import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Car, 
  MaintenanceRule, 
  MaintenanceRecord, 
  FuelRecord, 
  ExpenseRecord, 
  KmLog, 
  MaintenanceAlert, 
  GoogleUserProfile, 
  DriveSyncState 
} from '../types/car';
import { 
  DEFAULT_MAINTENANCE_TEMPLATES, 
  INITIAL_USER_CARS, 
  INITIAL_RULES_CIVIC, 
  INITIAL_MAINTENANCE_RECORDS, 
  INITIAL_FUEL_RECORDS, 
  INITIAL_EXPENSE_RECORDS 
} from '../data/defaultMaintenanceRules';
import { 
  DatabaseState, 
  loadLocalDatabase, 
  saveLocalDatabase, 
  generateSqlDump, 
  exportFileDownload 
} from '../services/sqliteStorage';
import { 
  initAuth, 
  signInWithGoogle, 
  signOutUser, 
  getCachedAccessToken 
} from '../services/auth';
import { 
  findDriveDatabaseFile, 
  saveDatabaseToDrive, 
  downloadDatabaseFromDrive 
} from '../services/googleDrive';

interface CarContextType {
  cars: Car[];
  selectedCar: Car | null;
  selectedCarId: string;
  setSelectedCarId: (id: string) => void;
  
  rules: MaintenanceRule[];
  currentCarRules: MaintenanceRule[];
  maintenanceRecords: MaintenanceRecord[];
  currentCarMaintenance: MaintenanceRecord[];
  fuelRecords: FuelRecord[];
  currentCarFuel: FuelRecord[];
  expenseRecords: ExpenseRecord[];
  currentCarExpenses: ExpenseRecord[];
  kmLogs: KmLog[];
  
  // Alertas e Notificações
  alerts: MaintenanceAlert[];
  currentCarAlerts: MaintenanceAlert[];
  criticalAlertsCount: number;
  warningAlertsCount: number;
  
  // Google Drive & Auth
  user: GoogleUserProfile | null;
  driveSync: DriveSyncState;
  loginGoogle: () => Promise<void>;
  logoutGoogle: () => Promise<void>;
  syncWithGoogleDrive: () => Promise<void>;
  restoreFromGoogleDrive: () => Promise<void>;
  
  // Car Actions
  addCar: (carData: Omit<Car, 'id' | 'criadoEm' | 'dataUltimaAtualizacaoKm'>) => string;
  updateCar: (car: Car) => void;
  deleteCar: (carId: string) => void;
  updateCarKm: (carId: string, newKm: number, note?: string) => void;
  
  // Maintenance Actions
  addMaintenanceRecord: (data: Omit<MaintenanceRecord, 'id' | 'criadoEm'>) => void;
  addMaintenanceRule: (data: Omit<MaintenanceRule, 'id'>) => void;
  updateMaintenanceRule: (rule: MaintenanceRule) => void;
  deleteMaintenanceRule: (ruleId: string) => void;
  resetDefaultRulesForCar: (carId: string) => void;
  
  // Fuel & Expense Actions
  addFuelRecord: (data: Omit<FuelRecord, 'id' | 'criadoEm'>) => void;
  deleteFuelRecord: (id: string) => void;
  addExpenseRecord: (data: Omit<ExpenseRecord, 'id' | 'criadoEm'>) => void;
  deleteExpenseRecord: (id: string) => void;
  
  // Backup & SQLite
  exportSqlite: () => void;
  exportJson: () => void;
  importJson: (jsonData: any) => boolean;
  resetDemoData: () => void;
  
  // Browser notifications
  notificationsEnabled: boolean;
  requestNotificationPermission: () => Promise<boolean>;
}

const CarContext = createContext<CarContextType | undefined>(undefined);

export const CarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database States
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [rules, setRules] = useState<MaintenanceRule[]>([]);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [fuelRecords, setFuelRecords] = useState<FuelRecord[]>([]);
  const [expenseRecords, setExpenseRecords] = useState<ExpenseRecord[]>([]);
  const [kmLogs, setKmLogs] = useState<KmLog[]>([]);

  // User & Drive state
  const [user, setUser] = useState<GoogleUserProfile | null>(null);
  const [driveSync, setDriveSync] = useState<DriveSyncState>({
    isConnected: false,
    isSyncing: false,
    lastSyncedAt: null,
    fileId: null,
    fileName: 'carcontrole_database.json',
    error: null,
    autoSync: true,
  });

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // 1. Initial Load from LocalStorage or Demo Data
  useEffect(() => {
    const localDb = loadLocalDatabase();
    if (localDb && localDb.cars && localDb.cars.length > 0) {
      setCars(localDb.cars);
      setSelectedCarId(localDb.cars[0]?.id || '');
      setRules(localDb.rules || []);
      setMaintenanceRecords(localDb.maintenanceRecords || []);
      setFuelRecords(localDb.fuelRecords || []);
      setExpenseRecords(localDb.expenseRecords || []);
      setKmLogs(localDb.kmLogs || []);
    } else {
      // Seed Demo Data
      setCars(INITIAL_USER_CARS);
      setSelectedCarId(INITIAL_USER_CARS[0].id);
      setRules(INITIAL_RULES_CIVIC);
      setMaintenanceRecords(INITIAL_MAINTENANCE_RECORDS);
      setFuelRecords(INITIAL_FUEL_RECORDS);
      setExpenseRecords(INITIAL_EXPENSE_RECORDS);
      setKmLogs([
        { id: 'km-1', carId: 'car-1', km: 48250, data: new Date().toISOString(), origem: 'manual', observacao: 'Leitura inicial do painel' }
      ]);
    }
    setIsLoaded(true);

    // Check browser notification permission
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // 2. Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (firebaseUser, token) => {
        if (firebaseUser) {
          const profile: GoogleUserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || 'Condutor',
            photoURL: firebaseUser.photoURL || undefined,
          };
          setUser(profile);
          setDriveSync(prev => ({ ...prev, isConnected: !!token }));
          
          // Check for drive file
          if (token) {
            findDriveDatabaseFile(token)
              .then(file => {
                if (file) {
                  setDriveSync(prev => ({
                    ...prev,
                    fileId: file.id,
                    lastSyncedAt: file.modifiedTime,
                    isConnected: true
                  }));
                }
              })
              .catch(err => console.warn('Drive check on load:', err));
          }
        }
      },
      () => {
        setUser(null);
        setDriveSync(prev => ({ ...prev, isConnected: false, fileId: null }));
      }
    );
    return () => unsubscribe();
  }, []);

  // 3. Save to local storage whenever data changes
  useEffect(() => {
    if (!isLoaded) return;
    const dbState: DatabaseState = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      cars,
      rules,
      maintenanceRecords,
      fuelRecords,
      expenseRecords,
      kmLogs,
    };
    saveLocalDatabase(dbState);
  }, [cars, rules, maintenanceRecords, fuelRecords, expenseRecords, kmLogs, isLoaded]);

  // Current selected car
  const selectedCar = useMemo(() => {
    return cars.find(c => c.id === selectedCarId) || cars[0] || null;
  }, [cars, selectedCarId]);

  // Filtered lists for current car
  const currentCarRules = useMemo(() => {
    if (!selectedCar) return [];
    return rules.filter(r => r.carId === selectedCar.id);
  }, [rules, selectedCar]);

  const currentCarMaintenance = useMemo(() => {
    if (!selectedCar) return [];
    return maintenanceRecords
      .filter(m => m.carId === selectedCar.id)
      .sort((a, b) => new Date(b.dataRealizada).getTime() - new Date(a.dataRealizada).getTime());
  }, [maintenanceRecords, selectedCar]);

  const currentCarFuel = useMemo(() => {
    if (!selectedCar) return [];
    return fuelRecords
      .filter(f => f.carId === selectedCar.id)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [fuelRecords, selectedCar]);

  const currentCarExpenses = useMemo(() => {
    if (!selectedCar) return [];
    return expenseRecords
      .filter(e => e.carId === selectedCar.id)
      .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
  }, [expenseRecords, selectedCar]);

  // Calculate Maintenance Alerts
  const alerts: MaintenanceAlert[] = useMemo(() => {
    const list: MaintenanceAlert[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const car of cars) {
      const carRules = rules.filter(r => r.carId === car.id);

      for (const rule of carRules) {
        let isKmExpired = false;
        let isKmWarning = false;
        let isDateExpired = false;
        let isDateWarning = false;

        let kmRestante: number | undefined = undefined;
        let diasRestantes: number | undefined = undefined;
        let dataEstimadaVencimento: string | undefined = undefined;

        // KM Check
        if (rule.proximoKmLimite) {
          kmRestante = rule.proximoKmLimite - car.kmAtual;
          const warningThreshold = rule.alertaKmAntecedencia || 800;

          if (kmRestante <= 0) {
            isKmExpired = true;
          } else if (kmRestante <= warningThreshold) {
            isKmWarning = true;
          }

          // Estimate date based on monthly KM average
          if (car.kmMediaMensal > 0 && kmRestante > 0) {
            const dailyKm = car.kmMediaMensal / 30;
            const daysToKm = Math.round(kmRestante / dailyKm);
            const estDate = new Date();
            estDate.setDate(estDate.getDate() + daysToKm);
            dataEstimadaVencimento = estDate.toISOString().split('T')[0];
          }
        }

        // Date Check
        if (rule.proximaDataLimite) {
          const limitDate = new Date(rule.proximaDataLimite);
          limitDate.setHours(0, 0, 0, 0);
          const diffTime = limitDate.getTime() - today.getTime();
          diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const warningDaysThreshold = rule.alertaDiasAntecedencia || 15;

          if (diasRestantes <= 0) {
            isDateExpired = true;
          } else if (diasRestantes <= warningDaysThreshold) {
            isDateWarning = true;
          }
        }

        // Determine Status
        if (isKmExpired || isDateExpired) {
          let motivo: 'km_vencido' | 'data_vencida' | 'ambos_vencidos' = 'km_vencido';
          if (isKmExpired && isDateExpired) motivo = 'ambos_vencidos';
          else if (isDateExpired) motivo = 'data_vencida';

          let desc = '';
          if (isKmExpired && kmRestante !== undefined) {
            desc = `Ultrapassou em ${Math.abs(kmRestante).toLocaleString('pt-BR')} km do limite de ${rule.proximoKmLimite?.toLocaleString('pt-BR')} km.`;
          }
          if (isDateExpired && diasRestantes !== undefined) {
            desc += ` Venceu há ${Math.abs(diasRestantes)} dia(s) (${rule.proximaDataLimite}).`;
          }

          list.push({
            id: `alert-${rule.id}`,
            carId: car.id,
            carApelido: car.apelido,
            ruleId: rule.id,
            titulo: rule.titulo,
            status: 'vencido',
            motivo,
            kmAtual: car.kmAtual,
            kmLimite: rule.proximoKmLimite,
            kmRestante,
            dataLimite: rule.proximaDataLimite,
            diasRestantes,
            dataEstimadaVencimento,
            descricao: desc || 'Manutenção com prazo vencido.',
          });
        } else if (isKmWarning || isDateWarning) {
          let motivo: 'km_proximo' | 'data_proxima' = isKmWarning ? 'km_proximo' : 'data_proxima';
          let desc = '';
          if (isKmWarning && kmRestante !== undefined) {
            desc = `Faltam apenas ${kmRestante.toLocaleString('pt-BR')} km para a revisão.`;
          }
          if (isDateWarning && diasRestantes !== undefined) {
            desc += ` Prazo vence em ${diasRestantes} dia(s) (${rule.proximaDataLimite}).`;
          }

          list.push({
            id: `alert-${rule.id}`,
            carId: car.id,
            carApelido: car.apelido,
            ruleId: rule.id,
            titulo: rule.titulo,
            status: 'atencao',
            motivo,
            kmAtual: car.kmAtual,
            kmLimite: rule.proximoKmLimite,
            kmRestante,
            dataLimite: rule.proximaDataLimite,
            diasRestantes,
            dataEstimadaVencimento,
            descricao: desc || 'Manutenção próxima do vencimento.',
          });
        }
      }
    }

    return list;
  }, [cars, rules]);

  const currentCarAlerts = useMemo(() => {
    if (!selectedCar) return [];
    return alerts.filter(a => a.carId === selectedCar.id);
  }, [alerts, selectedCar]);

  const criticalAlertsCount = useMemo(() => {
    return alerts.filter(a => a.status === 'vencido').length;
  }, [alerts]);

  const warningAlertsCount = useMemo(() => {
    return alerts.filter(a => a.status === 'atencao').length;
  }, [alerts]);

  // Request browser notifications
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    const isGranted = permission === 'granted';
    setNotificationsEnabled(isGranted);
    if (isGranted) {
      new Notification('CarControle - Notificações Ativadas', {
        body: 'Você receberá alertas inteligentes sobre as revisões e manutenções do seu carro.',
        icon: '/favicon.ico',
      });
    }
    return isGranted;
  };

  // Google Login / Logout
  const loginGoogle = async () => {
    try {
      const { user: u, accessToken } = await signInWithGoogle();
      setUser(u);
      setDriveSync(prev => ({ ...prev, isConnected: true, error: null }));
      
      // Auto search file or prompt to sync
      const file = await findDriveDatabaseFile(accessToken).catch(() => null);
      if (file) {
        setDriveSync(prev => ({
          ...prev,
          fileId: file.id,
          lastSyncedAt: file.modifiedTime
        }));
      }
    } catch (err: any) {
      setDriveSync(prev => ({ ...prev, error: err.message || 'Erro ao conectar ao Google' }));
      throw err;
    }
  };

  const logoutGoogle = async () => {
    await signOutUser();
    setUser(null);
    setDriveSync(prev => ({ ...prev, isConnected: false, fileId: null, lastSyncedAt: null }));
  };

  // Sync to Google Drive
  const syncWithGoogleDrive = async () => {
    setDriveSync(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      const dbState: DatabaseState = {
        version: 1,
        lastUpdated: new Date().toISOString(),
        cars,
        rules,
        maintenanceRecords,
        fuelRecords,
        expenseRecords,
        kmLogs,
      };

      const fileInfo = await saveDatabaseToDrive(dbState);
      setDriveSync(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncedAt: fileInfo.modifiedTime,
        fileId: fileInfo.id,
        error: null,
      }));
    } catch (err: any) {
      setDriveSync(prev => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Falha ao salvar no Google Drive',
      }));
      throw err;
    }
  };

  // Restore from Google Drive
  const restoreFromGoogleDrive = async () => {
    setDriveSync(prev => ({ ...prev, isSyncing: true, error: null }));
    try {
      let fileId = driveSync.fileId;
      if (!fileId) {
        const file = await findDriveDatabaseFile();
        if (!file) {
          throw new Error('Nenhum backup do CarControle encontrado no seu Google Drive.');
        }
        fileId = file.id;
      }

      const rawData = await downloadDatabaseFromDrive(fileId);
      if (rawData && rawData.cars) {
        setCars(rawData.cars || []);
        if (rawData.cars.length > 0) {
          setSelectedCarId(rawData.cars[0].id);
        }
        setRules(rawData.rules || []);
        setMaintenanceRecords(rawData.maintenanceRecords || []);
        setFuelRecords(rawData.fuelRecords || []);
        setExpenseRecords(rawData.expenseRecords || []);
        setKmLogs(rawData.kmLogs || []);

        setDriveSync(prev => ({
          ...prev,
          isSyncing: false,
          lastSyncedAt: new Date().toISOString(),
          error: null,
        }));
      } else {
        throw new Error('Formato do arquivo de banco no Drive é inválido.');
      }
    } catch (err: any) {
      setDriveSync(prev => ({
        ...prev,
        isSyncing: false,
        error: err.message || 'Falha ao restaurar do Google Drive',
      }));
      throw err;
    }
  };

  // Helper to add default templates for a new car
  const createDefaultRulesForCar = (carId: string, currentKm: number): MaintenanceRule[] => {
    return DEFAULT_MAINTENANCE_TEMPLATES.map((tmpl, idx) => {
      const proximoKm = tmpl.intervaloKm ? currentKm + tmpl.intervaloKm : undefined;
      let proximaData: string | undefined = undefined;
      if (tmpl.intervaloMeses) {
        const d = new Date();
        d.setMonth(d.getMonth() + tmpl.intervaloMeses);
        proximaData = d.toISOString().split('T')[0];
      }

      return {
        id: `rule-${carId}-${idx + 1}-${Date.now()}`,
        carId,
        titulo: tmpl.titulo,
        categoria: tmpl.categoria,
        descricao: tmpl.descricao,
        intervaloKm: tmpl.intervaloKm,
        intervaloMeses: tmpl.intervaloMeses,
        ultimoKmRealizado: currentKm,
        ultimaDataRealizada: new Date().toISOString().split('T')[0],
        proximoKmLimite: proximoKm,
        proximaDataLimite: proximaData,
        alertaKmAntecedencia: tmpl.alertaKmAntecedencia || 800,
        alertaDiasAntecedencia: tmpl.alertaDiasAntecedencia || 15,
        obrigatorio: tmpl.obrigatorio,
      };
    });
  };

  // Add Car
  const addCar = (carData: Omit<Car, 'id' | 'criadoEm' | 'dataUltimaAtualizacaoKm'>): string => {
    const newCarId = `car-${Date.now()}`;
    const newCar: Car = {
      ...carData,
      id: newCarId,
      criadoEm: new Date().toISOString(),
      dataUltimaAtualizacaoKm: new Date().toISOString().split('T')[0],
    };

    const initialRules = createDefaultRulesForCar(newCarId, newCar.kmAtual);
    
    setCars(prev => [...prev, newCar]);
    setRules(prev => [...prev, ...initialRules]);
    setSelectedCarId(newCarId);

    // Add initial KM log
    setKmLogs(prev => [
      ...prev,
      {
        id: `kmlog-${Date.now()}`,
        carId: newCarId,
        km: newCar.kmAtual,
        data: new Date().toISOString(),
        origem: 'manual',
        observacao: 'Cadastro inicial do veículo',
      },
    ]);

    return newCarId;
  };

  const updateCar = (updated: Car) => {
    setCars(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const deleteCar = (carId: string) => {
    setCars(prev => prev.filter(c => c.id !== carId));
    setRules(prev => prev.filter(r => r.carId !== carId));
    setMaintenanceRecords(prev => prev.filter(m => m.carId !== carId));
    setFuelRecords(prev => prev.filter(f => f.carId !== carId));
    setExpenseRecords(prev => prev.filter(e => e.carId !== carId));
    setKmLogs(prev => prev.filter(k => k.carId !== carId));

    if (selectedCarId === carId) {
      const remaining = cars.filter(c => c.id !== carId);
      if (remaining.length > 0) {
        setSelectedCarId(remaining[0].id);
      }
    }
  };

  // Update Car KM & recalculate alerts and log
  const updateCarKm = (carId: string, newKm: number, note?: string) => {
    const targetCar = cars.find(c => c.id === carId);
    if (!targetCar) return;

    setCars(prev =>
      prev.map(c =>
        c.id === carId
          ? {
              ...c,
              kmAtual: newKm,
              dataUltimaAtualizacaoKm: new Date().toISOString().split('T')[0],
            }
          : c
      )
    );

    setKmLogs(prev => [
      ...prev,
      {
        id: `kmlog-${Date.now()}`,
        carId,
        km: newKm,
        data: new Date().toISOString(),
        origem: 'manual',
        observacao: note || 'Atualização de hodômetro',
      },
    ]);
  };

  // Maintenance Record (and automatically advance corresponding rule's next KM / date)
  const addMaintenanceRecord = (data: Omit<MaintenanceRecord, 'id' | 'criadoEm'>) => {
    const newRecordId = `mrec-${Date.now()}`;
    const newRecord: MaintenanceRecord = {
      ...data,
      id: newRecordId,
      criadoEm: new Date().toISOString(),
    };

    setMaintenanceRecords(prev => [newRecord, ...prev]);

    // If linked to a rule or matches a rule title, update the rule's last and next limit
    if (data.ruleId) {
      setRules(prev =>
        prev.map(r => {
          if (r.id === data.ruleId) {
            const nextKm = r.intervaloKm ? data.kmRealizado + r.intervaloKm : undefined;
            let nextDate: string | undefined = undefined;
            if (r.intervaloMeses) {
              const d = new Date(data.dataRealizada);
              d.setMonth(d.getMonth() + r.intervaloMeses);
              nextDate = d.toISOString().split('T')[0];
            }
            return {
              ...r,
              ultimoKmRealizado: data.kmRealizado,
              ultimaDataRealizada: data.dataRealizada,
              proximoKmLimite: data.proximoKmRecomendado || nextKm,
              proximaDataLimite: data.proximaDataRecomendada || nextDate,
            };
          }
          return r;
        })
      );
    }

    // Also update car's KM if record KM is higher
    const car = cars.find(c => c.id === data.carId);
    if (car && data.kmRealizado > car.kmAtual) {
      updateCarKm(car.id, data.kmRealizado, `Manutenção realizada: ${data.titulo}`);
    }
  };

  const addMaintenanceRule = (data: Omit<MaintenanceRule, 'id'>) => {
    const newRule: MaintenanceRule = {
      ...data,
      id: `rule-${data.carId}-${Date.now()}`,
    };
    setRules(prev => [...prev, newRule]);
  };

  const updateMaintenanceRule = (rule: MaintenanceRule) => {
    setRules(prev => prev.map(r => r.id === rule.id ? rule : r));
  };

  const deleteMaintenanceRule = (ruleId: string) => {
    setRules(prev => prev.filter(r => r.id !== ruleId));
  };

  const resetDefaultRulesForCar = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;
    const defaultRules = createDefaultRulesForCar(carId, car.kmAtual);
    setRules(prev => [...prev.filter(r => r.carId !== carId), ...defaultRules]);
  };

  // Fuel Records
  const addFuelRecord = (data: Omit<FuelRecord, 'id' | 'criadoEm'>) => {
    // Calculate Km/L if previous full tank exists
    let kmPorLitro: number | undefined = undefined;
    let custoKm: number | undefined = undefined;

    const previousFuelings = fuelRecords
      .filter(f => f.carId === data.carId && f.kmMomento < data.kmMomento)
      .sort((a, b) => b.kmMomento - a.kmMomento);

    if (previousFuelings.length > 0) {
      const prev = previousFuelings[0];
      const kmDelta = data.kmMomento - prev.kmMomento;
      if (kmDelta > 0 && data.litros > 0) {
        kmPorLitro = Number((kmDelta / data.litros).toFixed(2));
        custoKm = Number((data.valorTotal / kmDelta).toFixed(2));
      }
    }

    const newRecord: FuelRecord = {
      ...data,
      id: `fuel-${Date.now()}`,
      kmPorLitroCalculado: kmPorLitro,
      custoPorKm: custoKm,
      criadoEm: new Date().toISOString(),
    };

    setFuelRecords(prev => [newRecord, ...prev]);

    // Update car KM if higher
    const car = cars.find(c => c.id === data.carId);
    if (car && data.kmMomento > car.kmAtual) {
      updateCarKm(car.id, data.kmMomento, `Abastecimento em ${data.posto || 'Posto'}`);
    }
  };

  const deleteFuelRecord = (id: string) => {
    setFuelRecords(prev => prev.filter(f => f.id !== id));
  };

  // Expense Records
  const addExpenseRecord = (data: Omit<ExpenseRecord, 'id' | 'criadoEm'>) => {
    const newRecord: ExpenseRecord = {
      ...data,
      id: `exp-${Date.now()}`,
      criadoEm: new Date().toISOString(),
    };
    setExpenseRecords(prev => [newRecord, ...prev]);
  };

  const deleteExpenseRecord = (id: string) => {
    setExpenseRecords(prev => prev.filter(e => e.id !== id));
  };

  // Export / Import
  const exportSqlite = () => {
    const dbState: DatabaseState = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      cars,
      rules,
      maintenanceRecords,
      fuelRecords,
      expenseRecords,
      kmLogs,
    };
    const sql = generateSqlDump(dbState);
    exportFileDownload(sql, `carcontrole_schema_dump_${new Date().toISOString().split('T')[0]}.sql`, 'text/plain');
  };

  const exportJson = () => {
    const dbState: DatabaseState = {
      version: 1,
      lastUpdated: new Date().toISOString(),
      cars,
      rules,
      maintenanceRecords,
      fuelRecords,
      expenseRecords,
      kmLogs,
    };
    exportFileDownload(JSON.stringify(dbState, null, 2), `carcontrole_database_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const importJson = (jsonData: any): boolean => {
    try {
      if (!jsonData || !Array.isArray(jsonData.cars)) {
        return false;
      }
      setCars(jsonData.cars || []);
      if (jsonData.cars.length > 0) {
        setSelectedCarId(jsonData.cars[0].id);
      }
      setRules(jsonData.rules || []);
      setMaintenanceRecords(jsonData.maintenanceRecords || []);
      setFuelRecords(jsonData.fuelRecords || []);
      setExpenseRecords(jsonData.expenseRecords || []);
      setKmLogs(jsonData.kmLogs || []);
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  };

  const resetDemoData = () => {
    setCars(INITIAL_USER_CARS);
    setSelectedCarId(INITIAL_USER_CARS[0].id);
    setRules(INITIAL_RULES_CIVIC);
    setMaintenanceRecords(INITIAL_MAINTENANCE_RECORDS);
    setFuelRecords(INITIAL_FUEL_RECORDS);
    setExpenseRecords(INITIAL_EXPENSE_RECORDS);
    setKmLogs([
      { id: 'km-1', carId: 'car-1', km: 48250, data: new Date().toISOString(), origem: 'manual', observacao: 'Dados de demonstração restaurados' }
    ]);
  };

  return (
    <CarContext.Provider
      value={{
        cars,
        selectedCar,
        selectedCarId,
        setSelectedCarId,
        rules,
        currentCarRules,
        maintenanceRecords,
        currentCarMaintenance,
        fuelRecords,
        currentCarFuel,
        expenseRecords,
        currentCarExpenses,
        kmLogs,
        alerts,
        currentCarAlerts,
        criticalAlertsCount,
        warningAlertsCount,
        user,
        driveSync,
        loginGoogle,
        logoutGoogle,
        syncWithGoogleDrive,
        restoreFromGoogleDrive,
        addCar,
        updateCar,
        deleteCar,
        updateCarKm,
        addMaintenanceRecord,
        addMaintenanceRule,
        updateMaintenanceRule,
        deleteMaintenanceRule,
        resetDefaultRulesForCar,
        addFuelRecord,
        deleteFuelRecord,
        addExpenseRecord,
        deleteExpenseRecord,
        exportSqlite,
        exportJson,
        importJson,
        resetDemoData,
        notificationsEnabled,
        requestNotificationPermission,
      }}
    >
      {children}
    </CarContext.Provider>
  );
};

export const useCarContext = (): CarContextType => {
  const context = useContext(CarContext);
  if (!context) {
    throw new Error('useCarContext must be used within a CarProvider');
  }
  return context;
};
