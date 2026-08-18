import React, { useState } from 'react';
import { StoreProvider, useStoreContext } from './context/StoreContext';
import { StoreHeader, AppViewMode } from './components/layout/StoreHeader';
import { PublicStoreView } from './components/public/PublicStoreView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { MasterPlatformManager } from './components/admin/MasterPlatformManager';
import { ItemFormModal } from './components/admin/ItemFormModal';
import { StoreCreatorModal } from './components/admin/StoreCreatorModal';
import { StoreSettingsModal } from './components/admin/StoreSettingsModal';
import { StoreItem } from './types/store';

const MainApp: React.FC = () => {
  const { activeStore, selectStore } = useStoreContext();

  const [viewMode, setViewMode] = useState<AppViewMode>('master');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [itemToEdit, setItemToEdit] = useState<StoreItem | null>(null);
  const [isNewStoreModalOpen, setIsNewStoreModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleOpenNewItem = () => {
    setItemToEdit(null);
    setIsItemModalOpen(true);
  };

  const handleEditItem = (item: StoreItem) => {
    setItemToEdit(item);
    setIsItemModalOpen(true);
  };

  const handleSelectStoreAndGoToAdmin = (storeId: string) => {
    selectStore(storeId);
    setViewMode('admin');
  };

  const handleSelectStoreAndGoToPublic = (storeId: string) => {
    selectStore(storeId);
    setViewMode('public');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Barra de Cabeçalho com Seletor de Lojas e Modos ( SaaS / Painel Lojista / Vitrine) */}
      <StoreHeader
        viewMode={viewMode}
        onChangeViewMode={(mode) => setViewMode(mode)}
        onOpenNewStore={() => setIsNewStoreModalOpen(true)}
      />

      {/* Conteúdo Principal de acordo com a visão selecionada */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-6">
        {viewMode === 'master' && (
          <MasterPlatformManager
            onSelectStoreAndGoToAdmin={handleSelectStoreAndGoToAdmin}
            onSelectStoreAndGoToPublic={handleSelectStoreAndGoToPublic}
            onOpenNewStoreModal={() => setIsNewStoreModalOpen(true)}
          />
        )}

        {viewMode === 'admin' && (
          <AdminDashboard
            onOpenNewItemModal={handleOpenNewItem}
            onEditItem={handleEditItem}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onOpenNewStoreModal={() => setIsNewStoreModalOpen(true)}
            onViewPublicStore={() => setViewMode('public')}
          />
        )}

        {viewMode === 'public' && (
          <PublicStoreView
            onOpenAdmin={() => setViewMode('admin')}
          />
        )}
      </main>

      {/* Rodapé Oficial da Plataforma SaaS VitrineHub */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">VitrineHub SaaS</span>
            <span>—</span>
            <span>Plataforma de Gestão de Lojas, Catálogos Digitais e Assinaturas</span>
          </div>
          <div className="text-slate-400">
            Finalize orçamentos, contratos e propostas direto no <strong className="text-emerald-400">WhatsApp</strong> e <strong className="text-blue-400">E-mail</strong>
          </div>
        </div>
      </footer>

      {/* Modais Administrativos */}
      <ItemFormModal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        itemToEdit={itemToEdit}
        store={activeStore}
      />

      <StoreCreatorModal
        isOpen={isNewStoreModalOpen}
        onClose={() => setIsNewStoreModalOpen(false)}
      />

      <StoreSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        store={activeStore}
      />

    </div>
  );
};

export function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}

export default App;
