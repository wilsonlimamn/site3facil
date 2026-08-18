import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreProfile, StoreItem, ProposalLead, StoreType, SaaSPlanConfig, SaaSPlatformSettings } from '../types/store';
import { INITIAL_STORES, INITIAL_ITEMS, INITIAL_LEADS, DEFAULT_SAAS_PLANS, DEFAULT_PLATFORM_SETTINGS } from '../data/demoStores';

interface StoreContextType {
  stores: StoreProfile[];
  activeStore: StoreProfile;
  items: StoreItem[];
  currentStoreItems: StoreItem[];
  leads: ProposalLead[];
  currentStoreLeads: ProposalLead[];
  plans: SaaSPlanConfig[];
  platformSettings: SaaSPlatformSettings;
  
  // Ações de Loja
  selectStore: (storeId: string) => void;
  createStore: (storeData: Omit<StoreProfile, 'id' | 'createdAt'>) => string;
  updateStore: (storeData: StoreProfile) => void;
  deleteStore: (storeId: string) => void;
  resetToDefaults: () => void;

  // Ações de Gestão SaaS do 
  updateStoreSubscription: (storeId: string, data: Partial<StoreProfile>) => void;
  markPaymentReceived: (storeId: string, daysToAdd?: number) => void;
  toggleStorePublished: (storeId: string) => void;
  updatePlatformSettings: (settings: Partial<SaaSPlatformSettings>) => void;

  // Ações de Itens
  addItem: (itemData: Omit<StoreItem, 'id' | 'storeId' | 'createdAt'>) => void;
  updateItem: (item: StoreItem) => void;
  deleteItem: (itemId: string) => void;
  toggleItemFeatured: (itemId: string) => void;
  updateItemStatus: (itemId: string, status: any) => void;

  // Ações de Propostas & Leads
  submitProposal: (proposalData: Omit<ProposalLead, 'id' | 'storeId' | 'createdAt' | 'status'>) => ProposalLead;
  updateLeadStatus: (leadId: string, status: ProposalLead['status']) => void;
  deleteLead: (leadId: string) => void;

  // Import / Export Backup
  exportDataJSON: () => string;
  importDataJSON: (jsonString: string) => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEY_STORES = 'vitrinehub_stores_v3';
const STORAGE_KEY_ITEMS = 'vitrinehub_items_v3';
const STORAGE_KEY_LEADS = 'vitrinehub_leads_v3';
const STORAGE_KEY_ACTIVE_STORE = 'vitrinehub_active_store_id_v3';
const STORAGE_KEY_SETTINGS = 'vitrinehub_settings_v3';

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Estado das Lojas com enriquecimento de dados SaaS
  const [stores, setStores] = useState<StoreProfile[]>(() => {
    try {
      const savedV3 = localStorage.getItem(STORAGE_KEY_STORES);
      if (savedV3) {
        const parsed: StoreProfile[] = JSON.parse(savedV3);
        const existingIds = new Set(parsed.map((s) => s.id));
        const missingDefaults = INITIAL_STORES.filter((s) => !existingIds.has(s.id));
        const merged = [...parsed, ...missingDefaults].map((store) => {
          const defaultRef = INITIAL_STORES.find((d) => d.id === store.id);
          return {
            ...store,
            ownerName: store.ownerName || defaultRef?.ownerName || 'Cliente Lojista',
            ownerEmail: store.ownerEmail || defaultRef?.ownerEmail || store.email,
            ownerPhone: store.ownerPhone || defaultRef?.ownerPhone || store.whatsapp,
            plan: store.plan || defaultRef?.plan || 'pro',
            planName: store.planName || defaultRef?.planName || 'Plano Profissional',
            monthlyFee: store.monthlyFee !== undefined ? store.monthlyFee : (defaultRef?.monthlyFee || 99.90),
            subscriptionStatus: store.subscriptionStatus || defaultRef?.subscriptionStatus || 'ativo',
            nextDueDate: store.nextDueDate || defaultRef?.nextDueDate || '2026-09-15',
            isPublished: store.isPublished !== undefined ? store.isPublished : true,
          };
        });
        return merged;
      }

      // Migrar de v2
      const savedV2 = localStorage.getItem('vitrinehub_stores_v2');
      if (savedV2) {
        const parsedV2: StoreProfile[] = JSON.parse(savedV2);
        const existingIds = new Set(parsedV2.map((s) => s.id));
        const missingDefaults = INITIAL_STORES.filter((s) => !existingIds.has(s.id));
        const merged = [...parsedV2, ...missingDefaults].map((store) => {
          const defaultRef = INITIAL_STORES.find((d) => d.id === store.id);
          return {
            ...store,
            ownerName: defaultRef?.ownerName || 'Cliente Lojista',
            ownerEmail: defaultRef?.ownerEmail || store.email,
            ownerPhone: defaultRef?.ownerPhone || store.whatsapp,
            plan: defaultRef?.plan || 'pro',
            planName: defaultRef?.planName || 'Plano Profissional',
            monthlyFee: defaultRef?.monthlyFee || 99.90,
            subscriptionStatus: defaultRef?.subscriptionStatus || 'ativo',
            nextDueDate: defaultRef?.nextDueDate || '2026-09-15',
            isPublished: true,
          };
        });
        return merged;
      }
    } catch (e) {
      console.error('Erro ao ler lojas do localStorage', e);
    }
    return INITIAL_STORES;
  });

  // 2. Configurações da Plataforma Mãe (SaaS)
  const [platformSettings, setPlatformSettings] = useState<SaaSPlatformSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return DEFAULT_PLATFORM_SETTINGS;
  });

  // 3. Planos do SaaS
  const [plans] = useState<SaaSPlanConfig[]>(DEFAULT_SAAS_PLANS);

  // 4. ID da Loja Ativa
  const [activeStoreId, setActiveStoreId] = useState<string>(() => {
    try {
      const savedId = localStorage.getItem(STORAGE_KEY_ACTIVE_STORE) || localStorage.getItem('vitrinehub_active_store_id_v2');
      if (savedId) return savedId;
    } catch (e) {}
    return INITIAL_STORES[0].id;
  });

  // 5. Itens de todas as lojas
  const [items, setItems] = useState<StoreItem[]>(() => {
    try {
      const savedV3 = localStorage.getItem(STORAGE_KEY_ITEMS);
      if (savedV3) return JSON.parse(savedV3);

      const savedV2 = localStorage.getItem('vitrinehub_items_v2');
      if (savedV2) {
        const parsed: StoreItem[] = JSON.parse(savedV2);
        const existingIds = new Set(parsed.map((i) => i.id));
        const missingDefaultItems = INITIAL_ITEMS.filter((i) => !existingIds.has(i.id));
        return [...parsed, ...missingDefaultItems];
      }
    } catch (e) {
      console.error('Erro ao ler itens do localStorage', e);
    }
    return INITIAL_ITEMS;
  });

  // 6. Propostas e Leads
  const [leads, setLeads] = useState<ProposalLead[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEADS) || localStorage.getItem('vitrinehub_leads_v2');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Erro ao ler leads do localStorage', e);
    }
    return INITIAL_LEADS;
  });

  // Sincronizar com localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_STORES, JSON.stringify(stores));
  }, [stores]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ACTIVE_STORE, activeStoreId);
  }, [activeStoreId]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_LEADS, JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(platformSettings));
  }, [platformSettings]);

  // Loja ativa atual garantida
  const activeStore = stores.find((s) => s.id === activeStoreId) || stores[0] || INITIAL_STORES[0];

  // Itens da loja ativa
  const currentStoreItems = items.filter((item) => item.storeId === activeStore.id);

  // Leads da loja ativa
  const currentStoreLeads = leads.filter((lead) => lead.storeId === activeStore.id);

  // Selecionar Loja
  const selectStore = (storeId: string) => {
    const found = stores.find((s) => s.id === storeId);
    if (found) {
      setActiveStoreId(storeId);
    }
  };

  // Criar Nova Loja (com dados de Cliente SaaS)
  const createStore = (storeData: Omit<StoreProfile, 'id' | 'createdAt'>) => {
    const newId = `store-${Date.now()}`;
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);
    const formattedDue = nextMonth.toISOString().split('T')[0];

    const newStore: StoreProfile = {
      ...storeData,
      id: newId,
      createdAt: new Date().toISOString(),
      ownerName: storeData.ownerName || 'Novo Cliente',
      ownerEmail: storeData.ownerEmail || storeData.email,
      ownerPhone: storeData.ownerPhone || storeData.whatsapp,
      plan: storeData.plan || 'pro',
      planName: storeData.planName || 'Plano Profissional',
      monthlyFee: storeData.monthlyFee !== undefined ? storeData.monthlyFee : 99.90,
      subscriptionStatus: storeData.subscriptionStatus || 'ativo',
      nextDueDate: storeData.nextDueDate || formattedDue,
      isPublished: storeData.isPublished !== undefined ? storeData.isPublished : true,
    };
    setStores((prev) => [newStore, ...prev]);
    setActiveStoreId(newId);
    return newId;
  };

  // Atualizar Loja
  const updateStore = (storeData: StoreProfile) => {
    setStores((prev) => prev.map((s) => (s.id === storeData.id ? storeData : s)));
  };

  // Ações de Gestão SaaS do Super Admin
  const updateStoreSubscription = (storeId: string, data: Partial<StoreProfile>) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, ...data } : s))
    );
  };

  const markPaymentReceived = (storeId: string, daysToAdd = 30) => {
    setStores((prev) =>
      prev.map((s) => {
        if (s.id !== storeId) return s;
        const currentDue = s.nextDueDate ? new Date(s.nextDueDate) : new Date();
        const baseDate = isNaN(currentDue.getTime()) || currentDue < new Date() ? new Date() : currentDue;
        baseDate.setDate(baseDate.getDate() + daysToAdd);
        const newDue = baseDate.toISOString().split('T')[0];
        return {
          ...s,
          subscriptionStatus: 'ativo',
          lastPaymentDate: new Date().toISOString().split('T')[0],
          nextDueDate: newDue,
        };
      })
    );
  };

  const toggleStorePublished = (storeId: string) => {
    setStores((prev) =>
      prev.map((s) => (s.id === storeId ? { ...s, isPublished: !s.isPublished } : s))
    );
  };

  const updatePlatformSettings = (settings: Partial<SaaSPlatformSettings>) => {
    setPlatformSettings((prev) => ({ ...prev, ...settings }));
  };

  // Deletar Loja
  const deleteStore = (storeId: string) => {
    if (stores.length <= 1) {
      alert('Não é possível excluir a única loja existente.');
      return;
    }
    setStores((prev) => prev.filter((s) => s.id !== storeId));
    setItems((prev) => prev.filter((i) => i.storeId !== storeId));
    setLeads((prev) => prev.filter((l) => l.storeId !== storeId));
    
    if (activeStoreId === storeId) {
      const remaining = stores.filter((s) => s.id !== storeId);
      if (remaining.length > 0) {
        setActiveStoreId(remaining[0].id);
      }
    }
  };

  // Resetar aos Padrões
  const resetToDefaults = () => {
    setStores(INITIAL_STORES);
    setItems(INITIAL_ITEMS);
    setLeads(INITIAL_LEADS);
    setPlatformSettings(DEFAULT_PLATFORM_SETTINGS);
    setActiveStoreId(INITIAL_STORES[0].id);
    localStorage.removeItem(STORAGE_KEY_STORES);
    localStorage.removeItem(STORAGE_KEY_ITEMS);
    localStorage.removeItem(STORAGE_KEY_LEADS);
    localStorage.removeItem(STORAGE_KEY_ACTIVE_STORE);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
  };

  // Adicionar Item
  const addItem = (itemData: Omit<StoreItem, 'id' | 'storeId' | 'createdAt'>) => {
    const newItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      storeId: activeStore.id,
      createdAt: new Date().toISOString(),
    } as StoreItem;

    setItems((prev) => [newItem, ...prev]);
  };

  // Atualizar Item
  const updateItem = (updatedItem: StoreItem) => {
    setItems((prev) => prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)));
  };

  // Deletar Item
  const deleteItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  // Destacar Item
  const toggleItemFeatured = (itemId: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, featured: !item.featured } : item))
    );
  };

  // Atualizar Status do Item
  const updateItemStatus = (itemId: string, status: any) => {
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, status } : item))
    );
  };

  // Enviar Proposta / Lead
  const submitProposal = (
    proposalData: Omit<ProposalLead, 'id' | 'storeId' | 'createdAt' | 'status'>
  ): ProposalLead => {
    const newLead: ProposalLead = {
      ...proposalData,
      id: `lead-${Date.now()}`,
      storeId: activeStore.id,
      createdAt: new Date().toISOString(),
      status: 'novo',
    };

    setLeads((prev) => [newLead, ...prev]);
    return newLead;
  };

  // Atualizar Status do Lead
  const updateLeadStatus = (leadId: string, status: ProposalLead['status']) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === leadId ? { ...lead, status } : lead))
    );
  };

  // Deletar Lead
  const deleteLead = (leadId: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== leadId));
  };

  // Exportar Backup JSON
  const exportDataJSON = () => {
    const data = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      platformSettings,
      stores,
      items,
      leads,
    };
    return JSON.stringify(data, null, 2);
  };

  // Importar Backup JSON
  const importDataJSON = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.platformSettings) {
        setPlatformSettings(parsed.platformSettings);
      }
      if (parsed.stores && Array.isArray(parsed.stores)) {
        setStores(parsed.stores);
      }
      if (parsed.items && Array.isArray(parsed.items)) {
        setItems(parsed.items);
      }
      if (parsed.leads && Array.isArray(parsed.leads)) {
        setLeads(parsed.leads);
      }
      if (parsed.stores?.[0]?.id) {
        setActiveStoreId(parsed.stores[0].id);
      }
      return true;
    } catch (e) {
      console.error('Falha ao importar JSON', e);
      return false;
    }
  };

  return (
    <StoreContext.Provider
      value={{
        stores,
        activeStore,
        items,
        currentStoreItems,
        leads,
        currentStoreLeads,
        plans,
        platformSettings,
        selectStore,
        createStore,
        updateStore,
        deleteStore,
        resetToDefaults,
        updateStoreSubscription,
        markPaymentReceived,
        toggleStorePublished,
        updatePlatformSettings,
        addItem,
        updateItem,
        deleteItem,
        toggleItemFeatured,
        updateItemStatus,
        submitProposal,
        updateLeadStatus,
        deleteLead,
        exportDataJSON,
        importDataJSON,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStoreContext = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStoreContext deve ser usado dentro de um StoreProvider');
  }
  return context;
};

