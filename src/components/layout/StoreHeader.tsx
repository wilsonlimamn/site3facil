import React, { useState } from 'react';
import { 
  Store, 
  Layers, 
  Settings, 
  Eye, 
  Plus, 
  MessageSquare, 
  Car, 
  Home, 
  ShoppingBag, 
  Briefcase, 
  KeyRound,
  Check, 
  ChevronDown,
  Sparkles,
  PhoneCall,
  Building2,
  DollarSign,
  Users
} from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';
import { StoreType } from '../../types/store';
import { formatCurrency } from '../../utils/formatters';

export type AppViewMode = 'master' | 'admin' | 'public';

interface StoreHeaderProps {
  viewMode: AppViewMode;
  onChangeViewMode: (mode: AppViewMode) => void;
  onOpenNewStore: () => void;
}

export const StoreHeader: React.FC<StoreHeaderProps> = ({
  viewMode,
  onChangeViewMode,
  onOpenNewStore,
}) => {
  const { stores, activeStore, selectStore, currentStoreLeads, resetToDefaults } = useStoreContext();
  const [isStoreMenuOpen, setIsStoreMenuOpen] = useState(false);

  const getStoreIcon = (type: StoreType) => {
    switch (type) {
      case 'veiculo':
        return <Car className="h-4 w-4 text-red-400" />;
      case 'imovel':
        return <Home className="h-4 w-4 text-emerald-400" />;
      case 'produto':
        return <ShoppingBag className="h-4 w-4 text-blue-400" />;
      case 'servico':
        return <Briefcase className="h-4 w-4 text-purple-400" />;
      case 'locadora':
        return <KeyRound className="h-4 w-4 text-amber-400" />;
    }
  };

  const getStoreTypeName = (type: StoreType) => {
    switch (type) {
      case 'veiculo':
        return 'Veículos';
      case 'imovel':
        return 'Imóveis';
      case 'produto':
        return 'Produtos';
      case 'servico':
        return 'Serviços';
      case 'locadora':
        return 'Locadora & Frotas';
    }
  };

  const newLeadsCount = currentStoreLeads.filter((l) => l.status === 'novo').length;

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Logo / Seletor de Loja Ativa */}
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            
            {/* Seletor Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsStoreMenuOpen(!isStoreMenuOpen)}
                className="flex items-center space-x-2 bg-slate-800/90 hover:bg-slate-700/90 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-700/80 transition shadow-sm text-left group"
              >
                <div className="p-1 sm:p-1.5 rounded-lg bg-slate-900 border border-slate-700 shrink-0">
                  {getStoreIcon(activeStore.type)}
                </div>
                <div className="hidden sm:block min-w-0">
                  <div className="text-[11px] text-slate-400 font-medium leading-none flex items-center gap-1.5">
                    <span>{getStoreTypeName(activeStore.type)}</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] text-blue-400 font-mono">
                      {formatCurrency(activeStore.monthlyFee || 99.90)}/mês
                    </span>
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-white group-hover:text-blue-400 transition truncate max-w-[170px]">
                    {activeStore.name}
                  </div>
                </div>
                <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isStoreMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown de Seleção de Lojas / Modelos */}
              {isStoreMenuOpen && (
                <div className="absolute left-0 mt-2 w-84 sm:w-96 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800 flex items-center justify-between">
                    <span>Lojas & Clientes Cadastrados</span>
                    <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">
                      {stores.length} lojas
                    </span>
                  </div>

                  <div className="space-y-1 py-2 max-h-72 overflow-y-auto">
                    {stores.map((s) => {
                      const isCurrent = s.id === activeStore.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => {
                            selectStore(s.id);
                            setIsStoreMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-left ${
                            isCurrent
                              ? 'bg-blue-600/20 border border-blue-500/30 text-white'
                              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center space-x-3 min-w-0">
                            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 shrink-0">
                              {getStoreIcon(s.type)}
                            </div>
                            <div className="truncate">
                              <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
                                <span>{getStoreTypeName(s.type)}</span>
                                <span>•</span>
                                <span className="text-emerald-400 font-semibold">{formatCurrency(s.monthlyFee || 99.90)}/mês</span>
                              </div>
                              <div className="text-xs sm:text-sm font-semibold truncate text-slate-100">
                                {s.name}
                              </div>
                              <div className="text-[10px] text-slate-500 truncate">
                                Resp: {s.ownerName || 'Cliente Lojista'}
                              </div>
                            </div>
                          </div>
                          {isCurrent && <Check className="h-4 w-4 text-blue-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <button
                      onClick={() => {
                        setIsStoreMenuOpen(false);
                        onOpenNewStore();
                      }}
                      className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold transition shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Cadastrar Novo Cliente / Loja</span>
                    </button>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('Deseja recarregar as lojas e configurações padrão com todos os 5 modelos?')) {
                          resetToDefaults();
                          setIsStoreMenuOpen(false);
                        }
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-[11px] font-medium transition"
                    >
                      <span>🔄 Restaurar Modelos Padrão</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Navegação entre os 3 Modos: Administrativo, Painel Lojista e Vitrine */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            
            <div className="flex items-center p-1 bg-slate-800/90 rounded-xl border border-slate-700/80">
              
              {/* Modo 1:  (Super Admin SaaS) */}
              <button

                onClick={() => onChangeViewMode('master')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  viewMode === 'master'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Administrativo</span>
                <span className="md:hidden">SaaS Mãe</span>
              </button>

              {/* Modo 2: Painel do Lojista */}
              <button
                onClick={() => onChangeViewMode('admin')}
                className={`relative flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === 'admin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Settings className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Painel Lojista</span>
                <span className="md:hidden">Lojista</span>
                {newLeadsCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-slate-900">
                    {newLeadsCount}
                  </span>
                )}
              </button>

              {/* Modo 3: Vitrine Pública */}
              <button
                onClick={() => onChangeViewMode('public')}
                className={`flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  viewMode === 'public'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Vitrine Pública</span>
                <span className="md:hidden">Vitrine</span>
              </button>

            </div>

            {/* Contato WhatsApp rápido na vitrine */}
            {viewMode === 'public' && activeStore.whatsapp && (
              <a
                href={`https://wa.me/55${activeStore.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Olá! Estou visitando a ${activeStore.name} e gostaria de informações.`)}`}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-md transition"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </a>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};

