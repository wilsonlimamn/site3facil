import React, { useState } from 'react';
import { 
  Building2, 
  DollarSign, 
  Users, 
  Package, 
  TrendingUp, 
  Search, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Ban, 
  ExternalLink, 
  Settings, 
  MessageSquare, 
  CreditCard, 
  Edit, 
  Trash2, 
  Send, 
  Sparkles, 
  Check, 
  Layers, 
  Phone, 
  Mail, 
  Filter, 
  Eye, 
  ShieldCheck, 
  QrCode, 
  Copy,
  Calendar,
  Car,
  Home,
  ShoppingBag,
  Briefcase,
  KeyRound,
  FileText
} from 'lucide-react';
import { StoreProfile, StoreType, SaaSPlanTier, SubscriptionStatus } from '../../types/store';
import { useStoreContext } from '../../context/StoreContext';
import { formatCurrency } from '../../utils/formatters';

interface MasterPlatformManagerProps {
  onSelectStoreAndGoToAdmin: (storeId: string) => void;
  onSelectStoreAndGoToPublic: (storeId: string) => void;
  onOpenNewStoreModal: () => void;
}

export const MasterPlatformManager: React.FC<MasterPlatformManagerProps> = ({
  onSelectStoreAndGoToAdmin,
  onSelectStoreAndGoToPublic,
  onOpenNewStoreModal,
}) => {
  const { 
    stores, 
    items, 
    leads, 
    plans, 
    platformSettings, 
    updateStoreSubscription, 
    markPaymentReceived, 
    toggleStorePublished, 
    deleteStore,
    updatePlatformSettings
  } = useStoreContext();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [typeFilter, setTypeFilter] = useState<string>('todos');
  const [activeTab, setActiveTab] = useState<'clients' | 'plans' | 'settings'>('clients');

  // Estado para Modal de Edição de Cliente SaaS
  const [editingStore, setEditingStore] = useState<StoreProfile | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Estado para Modal de Configurações do SaaS
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [tempSettings, setTempSettings] = useState(platformSettings);
  const [copiedPix, setCopiedPix] = useState(false);

  // Métricas Globais da Plataforma Mãe
  const totalStores = stores.length;
  const activeStoresCount = stores.filter((s) => s.subscriptionStatus === 'ativo' && s.isPublished).length;
  const pendingStoresCount = stores.filter((s) => s.subscriptionStatus === 'pendente').length;
  const trialStoresCount = stores.filter((s) => s.subscriptionStatus === 'trial').length;
  const suspendedStoresCount = stores.filter((s) => s.subscriptionStatus === 'suspenso' || !s.isPublished).length;

  // Faturamento Recorrente Mensal (MRR) - Soma das lojas ativas e pendentes
  const currentMRR = stores
    .filter((s) => s.subscriptionStatus === 'ativo' || s.subscriptionStatus === 'pendente')
    .reduce((acc, s) => acc + (s.monthlyFee || 0), 0);

  const projectedARR = currentMRR * 12;
  const totalItemsCount = items.length;
  const totalLeadsCount = leads.length;

  // Filtragem de Lojas de Clientes
  const filteredStores = stores.filter((s) => {
    if (statusFilter !== 'todos' && s.subscriptionStatus !== statusFilter) return false;
    if (typeFilter !== 'todos' && s.type !== typeFilter) return false;

    const query = searchTerm.toLowerCase();
    const matchName = s.name.toLowerCase().includes(query);
    const matchOwner = (s.ownerName || '').toLowerCase().includes(query);
    const matchEmail = (s.ownerEmail || s.email || '').toLowerCase().includes(query);
    const matchPhone = (s.ownerPhone || s.whatsapp || '').includes(query);
    const matchSlug = s.slug.toLowerCase().includes(query);

    return matchName || matchOwner || matchEmail || matchPhone || matchSlug;
  });

  const getStoreIcon = (type: StoreType) => {
    switch (type) {
      case 'veiculo': return <Car className="h-4 w-4 text-red-400" />;
      case 'imovel': return <Home className="h-4 w-4 text-emerald-400" />;
      case 'produto': return <ShoppingBag className="h-4 w-4 text-blue-400" />;
      case 'servico': return <Briefcase className="h-4 w-4 text-purple-400" />;
      case 'locadora': return <KeyRound className="h-4 w-4 text-amber-400" />;
    }
  };

  const getStoreTypeName = (type: StoreType) => {
    switch (type) {
      case 'veiculo': return 'Veículos';
      case 'imovel': return 'Imóveis';
      case 'produto': return 'Produtos';
      case 'servico': return 'Serviços';
      case 'locadora': return 'Locadora & Frotas';
    }
  };

  const getStatusBadge = (status: SubscriptionStatus, isPublished: boolean) => {
    if (!isPublished || status === 'suspenso') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80">
          <Ban className="h-3 w-3 mr-1" /> Suspenso
        </span>
      );
    }
    switch (status) {
      case 'ativo':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Ativo
          </span>
        );
      case 'pendente':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/80 text-amber-300 border border-amber-800/80 animate-pulse">
            <AlertTriangle className="h-3 w-3 mr-1" /> Vencido / Cobrar
          </span>
        );
      case 'trial':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/80">
            <Clock className="h-3 w-3 mr-1" /> Período de Teste
          </span>
        );
    }
  };

  // Gerador de mensagem de cobrança pronta no WhatsApp
  const handleSendWhatsAppBilling = (store: StoreProfile) => {
    const phone = (store.ownerPhone || store.whatsapp || '').replace(/\D/g, '');
    if (!phone) {
      alert('Esta loja não possui número de WhatsApp cadastrado.');
      return;
    }

    const message = `Olá, ${store.ownerName || 'Lojista'}! 👋\n\nAqui é da equipe de suporte do *${platformSettings.platformName}*.\n\nPassando para informar sobre a mensalidade de manutenção da sua loja *${store.name}*:\n\n📌 *Plano:* ${store.planName || 'Profissional'}\n💰 *Valor:* R$ ${store.monthlyFee?.toFixed(2) || '99.90'}\n📅 *Vencimento:* ${store.nextDueDate || 'Imediato'}\n\n🔑 *Chave Pix para Pagamento:* \n${platformSettings.pixKey} (${platformSettings.pixBeneficiary})\n\nAssim que realizar o pagamento, nos envie o comprovante por aqui para mantermos sua vitrine e suporte 100% ativos!\n\nQualquer dúvida, estamos à disposição! 🚀`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/55${phone}?text=${encoded}`, '_blank');
  };

  const handleOpenEdit = (store: StoreProfile) => {
    setEditingStore({ ...store });
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    updateStoreSubscription(editingStore.id, editingStore);
    setIsEditModalOpen(false);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(platformSettings.pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header do Painel Master SaaS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/50 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-start sm:items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20 shrink-0">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Painel Master SaaS ()
              </h1>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2.5 py-0.5 rounded-full">
                Super Admin
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Gerenciador central de clientes, faturamento de mensalidades de manutenção e monitoramento de todas as lojas da plataforma.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2.5 pt-2 lg:pt-0">
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Settings className="h-4 w-4 text-slate-400" />
            <span>Configurar Pix / SaaS</span>
          </button>

          <button
            onClick={onOpenNewStoreModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Cliente / Nova Loja</span>
          </button>
        </div>
      </div>

      {/* Grid de Métricas Financeiras e Operacionais (MRR) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: MRR (Faturamento Recorrente Mensal) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MRR Recorrente</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {formatCurrency(currentMRR)}
              <span className="text-xs font-medium text-slate-400 ml-1">/mês</span>
            </div>
            <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>ARR Projetado: {formatCurrency(projectedARR)}/ano</span>
            </div>
          </div>
        </div>

        {/* Card 2: Total de Clientes / Lojas */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-blue-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Clientes & Lojas</span>
            <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {totalStores} <span className="text-xs font-medium text-slate-400">lojas cadastradas</span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{activeStoresCount} ativas</span>
              <span>•</span>
              <span className="text-amber-400 font-bold">{pendingStoresCount} pendentes</span>
              <span>•</span>
              <span className="text-blue-400 font-bold">{trialStoresCount} teste</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total de Anúncios / Catálogo Hospedado */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-purple-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Catálogo Hospedado</span>
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {totalItemsCount} <span className="text-xs font-medium text-slate-400">itens e anúncios</span>
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Distribuídos nos 5 modelos de negócios
            </div>
          </div>
        </div>

        {/* Card 4: Oportunidades & Leads Gerados */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Propostas Geradas</span>
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <MessageSquare className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-white">
              {totalLeadsCount} <span className="text-xs font-medium text-slate-400">propostas formais</span>
            </div>
            <div className="text-xs text-emerald-400 mt-1 font-medium">
              Convertidas para os lojistas
            </div>
          </div>
        </div>

      </div>

      {/* Navegação por Abas do Painel Master */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('clients')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'clients'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Gestão de Clientes & Mensalidades ({stores.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
            activeTab === 'plans'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <CreditCard className="h-4 w-4" />
          <span>Tabela de Planos SaaS & Preços</span>
        </button>
      </div>

      {/* ABA 1: LISTAGEM E GESTÃO DE CLIENTES & LOJAS */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          
          {/* Filtros e Barra de Pesquisa */}
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-2xl">
            
            {/* Campo de Busca */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <input
                type="text"
                placeholder="Buscar por loja, cliente, WhatsApp..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Filtros de Status e Tipo */}
            <div className="flex items-center flex-wrap gap-2 w-full md:w-auto">
              
              {/* Filtro Status da Mensalidade */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-400 hidden sm:inline">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="todos">Todos os Status ({stores.length})</option>
                  <option value="ativo">Ativos ({activeStoresCount})</option>
                  <option value="pendente">Vencidos / Pendentes ({pendingStoresCount})</option>
                  <option value="trial">Em Período de Teste ({trialStoresCount})</option>
                  <option value="suspenso">Suspensos ({suspendedStoresCount})</option>
                </select>
              </div>

              {/* Filtro Modelo de Loja */}
              <div className="flex items-center space-x-1 text-xs">
                <span className="text-slate-400 hidden sm:inline">Nicho:</span>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                >
                  <option value="todos">Todos os Nichos</option>
                  <option value="veiculo">Veículos</option>
                  <option value="imovel">Imóveis</option>
                  <option value="produto">Produtos Físicos</option>
                  <option value="servico">Prestadores de Serviços</option>
                  <option value="locadora">Locadora & Frotas</option>
                </select>
              </div>

            </div>
          </div>

          {/* Lista / Tabela de Clientes */}
          {filteredStores.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <Users className="h-10 w-10 text-slate-600 mx-auto mb-2" />
              <h3 className="text-base font-bold text-white">Nenhum cliente encontrado</h3>
              <p className="text-xs text-slate-400 mt-1">Tente ajustar os termos da pesquisa ou os filtros selecionados.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredStores.map((store) => {
                const storeItemsCount = items.filter((i) => i.storeId === store.id).length;
                const storeLeadsCount = leads.filter((l) => l.storeId === store.id).length;

                return (
                  <div
                    key={store.id}
                    className={`bg-slate-900 border rounded-2xl p-4 sm:p-5 transition flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                      store.subscriptionStatus === 'pendente'
                        ? 'border-amber-500/40 bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20'
                        : !store.isPublished || store.subscriptionStatus === 'suspenso'
                        ? 'border-rose-900/50 bg-slate-950/60 opacity-85'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Informações da Loja e Cliente */}
                    <div className="flex items-start space-x-3.5 min-w-0">
                      <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 shrink-0">
                        {getStoreIcon(store.type)}
                      </div>

                      <div className="min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white truncate max-w-xs sm:max-w-md">
                            {store.name}
                          </h3>
                          <span className="text-[10px] font-semibold uppercase bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                            {getStoreTypeName(store.type)}
                          </span>
                          {getStatusBadge(store.subscriptionStatus, store.isPublished)}
                        </div>

                        {/* Detalhes do Cliente */}
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1 font-medium text-slate-300">
                            <Users className="h-3 w-3 text-slate-500" />
                            {store.ownerName || 'Cliente Lojista'}
                          </span>
                          {store.ownerPhone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3 text-emerald-400" />
                              {store.ownerPhone}
                            </span>
                          )}
                          {store.ownerEmail && (
                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                              <Mail className="h-3 w-3 text-blue-400" />
                              {store.ownerEmail}
                            </span>
                          )}
                        </div>

                        {/* Estatísticas da Loja */}
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span>📦 {storeItemsCount} itens cadastrados</span>
                          <span>•</span>
                          <span>📬 {storeLeadsCount} propostas recebidas</span>
                          {store.internalNotes && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400 italic truncate max-w-xs">
                                "{store.internalNotes}"
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Dados Financeiros / Assinatura & Ações */}
                    <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row sm:items-center justify-between lg:justify-end gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                      
                      {/* Box da Mensalidade */}
                      <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-2.5 px-3 min-w-[170px] text-left sm:text-right lg:text-left xl:text-right">
                        <div className="text-[11px] text-slate-400 font-medium">
                          {store.planName || 'Plano Profissional'}
                        </div>
                        <div className="text-base font-black text-white">
                          {formatCurrency(store.monthlyFee || 99.90)}
                          <span className="text-[10px] font-normal text-slate-400 ml-1">/mês</span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center sm:justify-end lg:justify-start xl:justify-end gap-1 mt-0.5">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span>Vence: <strong className={store.subscriptionStatus === 'pendente' ? 'text-amber-400' : 'text-slate-200'}>{store.nextDueDate || '15/09/2026'}</strong></span>
                        </div>
                      </div>

                      {/* Botões de Ação do Super Admin */}
                      <div className="flex items-center flex-wrap gap-1.5">
                        
                        {/* 1. Cobrar via WhatsApp */}
                        <button
                          onClick={() => handleSendWhatsAppBilling(store)}
                          title="Enviar Cobrança / Notificação via WhatsApp"
                          className="flex items-center space-x-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 px-2.5 py-2 rounded-xl text-xs font-semibold transition shadow-sm"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Cobrar</span>
                        </button>

                        {/* 2. Confirmar Pagamento (+30 dias) */}
                        <button
                          onClick={() => {
                            if (window.confirm(`Confirmar recebimento do pagamento de ${formatCurrency(store.monthlyFee || 99.90)} de ${store.name}? A assinatura será renovada por mais 30 dias.`)) {
                              markPaymentReceived(store.id);
                            }
                          }}
                          title="Confirmar Pagamento e Renovar 30 Dias"
                          className="flex items-center space-x-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white border border-blue-500/30 px-2.5 py-2 rounded-xl text-xs font-semibold transition"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span className="hidden sm:inline">Renovar</span>
                        </button>

                        {/* 3. Acessar Painel do Lojista */}
                        <button
                          onClick={() => onSelectStoreAndGoToAdmin(store.id)}
                          title="Acessar o Painel de Gestão desta Loja"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Settings className="h-4 w-4" />
                        </button>

                        {/* 4. Abrir Vitrine Pública */}
                        <button
                          onClick={() => onSelectStoreAndGoToPublic(store.id)}
                          title="Abrir Vitrine Pública da Loja"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {/* 5. Editar Assinatura & Dados do Cliente */}
                        <button
                          onClick={() => handleOpenEdit(store)}
                          title="Editar Assinatura e Dados do Cliente"
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                        >
                          <Edit className="h-4 w-4" />
                        </button>

                        {/* 6. Suspender / Reativar Loja */}
                        <button
                          onClick={() => toggleStorePublished(store.id)}
                          title={store.isPublished ? 'Suspender Loja do Ar' : 'Reativar Loja Online'}
                          className={`p-2 rounded-xl transition ${
                            store.isPublished 
                              ? 'bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-300' 
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          <Ban className="h-4 w-4" />
                        </button>

                        {/* 7. Excluir Loja */}
                        {stores.length > 1 && (
                          <button
                            onClick={() => {
                              if (window.confirm(`Tem certeza que deseja excluir a loja "${store.name}" e todos os seus itens?`)) {
                                deleteStore(store.id);
                              }
                            }}
                            title="Excluir Loja"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-500 hover:text-rose-400 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}

                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ABA 2: TABELA DE PLANOS SAAS & SIMULADOR */}
      {activeTab === 'plans' && (
        <div className="space-y-6">
          
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-white">Planos de Assinatura Recomendados para seus Clientes</h2>
              <p className="text-xs text-slate-400 mt-1">
                Estruture suas mensalidades de manutenção e suporte recorrente para cada tipo de cliente na sua plataforma.
              </p>
            </div>

            {/* Grid dos Planos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`bg-slate-950 rounded-2xl p-5 border flex flex-col justify-between relative ${
                    plan.highlighted
                      ? 'border-blue-500 shadow-xl shadow-blue-500/10'
                      : 'border-slate-800'
                  }`}
                >
                  {plan.badge && (
                    <span className="absolute -top-3 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-md">
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>
                    
                    <div className="mt-4 pt-4 border-t border-slate-800/80">
                      <div className="text-2xl font-black text-white">
                        {formatCurrency(plan.price)}
                        <span className="text-xs font-normal text-slate-400">/mês</span>
                      </div>
                      <div className="text-[11px] text-blue-400 font-medium mt-0.5">
                        {plan.maxItems >= 9999 ? 'Itens Ilimitados' : `Até ${plan.maxItems} itens ativos`}
                      </div>
                    </div>

                    <ul className="mt-4 space-y-2 text-xs text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/80">
                    <button
                      onClick={onOpenNewStoreModal}
                      className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition"
                    >
                      Cadastrar Cliente neste Plano
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Simulador de Faturamento SaaS */}
            <div className="mt-8 bg-slate-950 border border-slate-800/90 rounded-2xl p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-400" />
                Simulador de Escala de Receita SaaS
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Projeção de faturamento recorrente mensal com base no número de clientes ativos no Plano Profissional (R$ 99,90/mês):
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <div className="text-xs text-slate-400">10 Lojas</div>
                  <div className="text-base font-black text-emerald-400 mt-1">R$ 999,00/mês</div>
                  <div className="text-[10px] text-slate-500">R$ 11.988/ano</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <div className="text-xs text-slate-400">25 Lojas</div>
                  <div className="text-base font-black text-emerald-400 mt-1">R$ 2.497,50/mês</div>
                  <div className="text-[10px] text-slate-500">R$ 29.970/ano</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <div className="text-xs text-slate-400">50 Lojas</div>
                  <div className="text-base font-black text-emerald-400 mt-1">R$ 4.995,00/mês</div>
                  <div className="text-[10px] text-slate-500">R$ 59.940/ano</div>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-3 rounded-xl text-center">
                  <div className="text-xs text-slate-400">100 Lojas</div>
                  <div className="text-base font-black text-blue-400 mt-1">R$ 9.990,00/mês</div>
                  <div className="text-[10px] text-slate-500">R$ 119.880/ano</div>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* MODAL 1: EDITAR ASSINATURA & CLIENTE SAAS */}
      {isEditModalOpen && editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl shadow-2xl p-6 overflow-hidden max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white">Editar Cliente & Assinatura SaaS</h3>
                <p className="text-xs text-slate-400">Loja: {editingStore.name}</p>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              
              {/* Dados do Cliente */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">Dados do Cliente Lojista</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nome do Responsável *</label>
                    <input
                      type="text"
                      required
                      value={editingStore.ownerName || ''}
                      onChange={(e) => setEditingStore({ ...editingStore, ownerName: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">WhatsApp / Telefone *</label>
                    <input
                      type="text"
                      required
                      value={editingStore.ownerPhone || ''}
                      onChange={(e) => setEditingStore({ ...editingStore, ownerPhone: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">E-mail do Cliente</label>
                    <input
                      type="email"
                      value={editingStore.ownerEmail || ''}
                      onChange={(e) => setEditingStore({ ...editingStore, ownerEmail: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">CPF ou CNPJ</label>
                    <input
                      type="text"
                      value={editingStore.ownerDocument || ''}
                      onChange={(e) => setEditingStore({ ...editingStore, ownerDocument: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Dados da Assinatura SaaS */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">Plano & Mensalidade de Manutenção</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Plano Contratado</label>
                    <select
                      value={editingStore.plan}
                      onChange={(e) => {
                        const newPlan = e.target.value as SaaSPlanTier;
                        const planCfg = plans.find((p) => p.id === newPlan);
                        setEditingStore({
                          ...editingStore,
                          plan: newPlan,
                          planName: planCfg ? planCfg.name : 'Plano Personalizado',
                          monthlyFee: planCfg ? planCfg.price : editingStore.monthlyFee,
                        });
                      }}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="starter">Starter (R$ 49,90/mês)</option>
                      <option value="pro">Profissional (R$ 99,90/mês)</option>
                      <option value="enterprise">Enterprise (R$ 199,90/mês)</option>
                      <option value="personalizado">Personalizado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Valor da Mensalidade (R$) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={editingStore.monthlyFee}
                      onChange={(e) => setEditingStore({ ...editingStore, monthlyFee: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Status da Assinatura</label>
                    <select
                      value={editingStore.subscriptionStatus}
                      onChange={(e) => setEditingStore({ ...editingStore, subscriptionStatus: e.target.value as SubscriptionStatus })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="ativo">Ativo (Pago)</option>
                      <option value="pendente">Pendente / Vencido</option>
                      <option value="trial">Período de Teste (Trial)</option>
                      <option value="suspenso">Suspenso / Bloqueado</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Data do Próximo Vencimento</label>
                    <input
                      type="date"
                      value={editingStore.nextDueDate || ''}
                      onChange={(e) => setEditingStore({ ...editingStore, nextDueDate: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Anotações Internas do Super Admin</label>
                  <textarea
                    rows={2}
                    value={editingStore.internalNotes || ''}
                    onChange={(e) => setEditingStore({ ...editingStore, internalNotes: e.target.value })}
                    placeholder="Ex: Cliente solicitou alteração no layout dia 10, negociou desconto anual..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <input
                    type="checkbox"
                    id="editPublished"
                    checked={editingStore.isPublished}
                    onChange={(e) => setEditingStore({ ...editingStore, isPublished: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-0"
                  />
                  <label htmlFor="editPublished" className="text-xs text-slate-300 font-medium">
                    Vitrine Online e Publicada para os clientes
                  </label>
                </div>

              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
                >
                  Salvar Alterações
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURAÇÕES GLOBAIS DO SAAS (PIX & CONTATO) */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl p-6 overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
                  <QrCode className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Configurações de Cobrança do SaaS</h3>
                  <p className="text-xs text-slate-400">Dados Pix usados nas mensagens de cobrança aos lojistas</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white bg-slate-800"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updatePlatformSettings(tempSettings);
                setIsSettingsModalOpen(false);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome da Plataforma SaaS</label>
                <input
                  type="text"
                  required
                  value={tempSettings.platformName}
                  onChange={(e) => setTempSettings({ ...tempSettings, platformName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Sua Chave Pix para Receber Mensalidades *</label>
                <input
                  type="text"
                  required
                  value={tempSettings.pixKey}
                  onChange={(e) => setTempSettings({ ...tempSettings, pixKey: e.target.value })}
                  placeholder="sua-chave@pix.com.br ou CNPJ/CPF"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Nome do Beneficiário / Titular da Conta Pix</label>
                <input
                  type="text"
                  required
                  value={tempSettings.pixBeneficiary}
                  onChange={(e) => setTempSettings({ ...tempSettings, pixBeneficiary: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">WhatsApp de Suporte Master</label>
                  <input
                    type="text"
                    value={tempSettings.superAdminPhone}
                    onChange={(e) => setTempSettings({ ...tempSettings, superAdminPhone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Dias de Teste Padrão (Trial)</label>
                  <input
                    type="number"
                    value={tempSettings.defaultTrialDays}
                    onChange={(e) => setTempSettings({ ...tempSettings, defaultTrialDays: parseInt(e.target.value) || 7 })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSettingsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition"
                >
                  Salvar Configurações
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
