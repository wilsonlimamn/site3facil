import React, { useState } from 'react';
import { 
  Package, 
  DollarSign, 
  Users, 
  Sparkles, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  ExternalLink, 
  MessageCircle, 
  Mail, 
  Eye, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Download, 
  Upload, 
  RefreshCw, 
  Settings, 
  Car, 
  Home, 
  ShoppingBag, 
  Briefcase,
  Layers,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { StoreItem, StoreProfile, ProposalLead } from '../../types/store';
import { useStoreContext } from '../../context/StoreContext';
import { formatCurrency, formatNumber, generateProposalWhatsAppLink } from '../../utils/formatters';

interface AdminDashboardProps {
  onOpenNewItemModal: () => void;
  onEditItem: (item: StoreItem) => void;
  onOpenSettingsModal: () => void;
  onOpenNewStoreModal: () => void;
  onViewPublicStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenNewItemModal,
  onEditItem,
  onOpenSettingsModal,
  onOpenNewStoreModal,
  onViewPublicStore,
}) => {
  const { 
    activeStore, 
    currentStoreItems, 
    currentStoreLeads, 
    deleteItem, 
    toggleItemFeatured, 
    updateItemStatus,
    updateLeadStatus,
    deleteLead,
    exportDataJSON,
    importDataJSON,
    resetToDefaults
  } = useStoreContext();

  const [activeTab, setActiveTab] = useState<'items' | 'leads' | 'backup'>('items');
  const [searchTerm, setSearchTerm] = useState('');
  const [leadStatusFilter, setLeadStatusFilter] = useState<string>('todos');
  const [importText, setImportText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Cálculos de Métricas
  const totalItems = currentStoreItems.length;
  const activeItems = currentStoreItems.filter((i) => (i.status === 'disponivel' || i.status === 'ativo')).length;
  const totalValue = currentStoreItems.reduce((acc, item) => acc + (item.price || 0), 0);
  const totalLeads = currentStoreLeads.length;
  const newLeads = currentStoreLeads.filter((l) => l.status === 'novo').length;

  // Filtragem de Itens
  const filteredItems = currentStoreItems.filter((item) => {
    const matchText = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.itemType === 'veiculo' && `${item.brand} ${item.model}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.itemType === 'imovel' && `${item.neighborhood} ${item.city}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.itemType === 'produto' && (item.sku || '').toLowerCase().includes(searchTerm.toLowerCase()));
    return matchText;
  });

  // Filtragem de Leads
  const filteredLeads = currentStoreLeads.filter((lead) => {
    if (leadStatusFilter !== 'todos' && lead.status !== leadStatusFilter) return false;
    return true;
  });

  const handleExport = () => {
    const data = exportDataJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vitrinehub-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = () => {
    if (!importText.trim()) return;
    const ok = importDataJSON(importText.trim());
    if (ok) {
      setImportStatus('Backup restaurado com sucesso!');
      setImportText('');
      setTimeout(() => setImportStatus(null), 3000);
    } else {
      setImportStatus('Erro: Arquivo JSON inválido.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Banner de Boas-Vindas do Painel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-3xl shadow-sm">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            {activeStore.type === 'veiculo' && <Car className="h-6 w-6 text-red-400" />}
            {activeStore.type === 'imovel' && <Home className="h-6 w-6 text-emerald-400" />}
            {activeStore.type === 'produto' && <ShoppingBag className="h-6 w-6 text-blue-400" />}
            {activeStore.type === 'servico' && <Briefcase className="h-6 w-6 text-purple-400" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Painel da Loja: {activeStore.name}</h2>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                {activeStore.type}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Gerencie seus anúncios, propostas de clientes recebidas e configurações da vitrine.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onViewPublicStore}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition"
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Ver Vitrine Pública</span>
          </button>

          <button
            onClick={onOpenSettingsModal}
            className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-slate-700 transition"
          >
            <Settings className="h-3.5 w-3.5" />
            <span>Configurações</span>
          </button>

          <button
            onClick={onOpenNewItemModal}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
          >
            <Plus className="h-4 w-4" />
            <span>Novo Anúncio</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Itens Anunciados</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{totalItems}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <strong className="text-emerald-400">{activeItems}</strong> disponíveis para venda
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Valor do Inventário</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white truncate">
            {formatCurrency(totalValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Soma dos preços anunciados
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Propostas Recebidas</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Mail className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white">{totalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1">
            <strong className="text-rose-400">{newLeads} novas</strong> propostas pendentes
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">Canais de Conversão</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <MessageCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-sm font-semibold text-white">WhatsApp & E-mail</div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            100% Gratuito e Direto
          </div>
        </div>

      </div>

      {/* Navegação por Abas do Painel */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('items')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'items'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Package className="h-4 w-4" />
          <span>Gerenciar Anúncios ({totalItems})</span>
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`relative flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'leads'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Propostas & Clientes ({totalLeads})</span>
          {newLeads > 0 && (
            <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {newLeads}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('backup')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'backup'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          <Download className="h-4 w-4" />
          <span>Backup & JSON</span>
        </button>
      </div>

      {/* ABA 1: GERENCIAR ITENS */}
      {activeTab === 'items' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          
          {/* Barra de Filtro e Busca */}
          <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar anúncio cadastrado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 text-xs text-slate-200 pl-10 pr-4 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="text-xs text-slate-400">
              Mostrando <strong className="text-white">{filteredItems.length}</strong> itens de {totalItems}
            </div>
          </div>

          {/* Tabela de Itens */}
          {filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Package className="h-10 w-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-300">Nenhum anúncio encontrado</p>
              <p className="text-xs text-slate-500 mt-1">
                Clique no botão "Novo Anúncio" acima para cadastrar o primeiro item.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5 pl-5">Item / Título</th>
                    <th className="p-3.5">Categoria / Tipo</th>
                    <th className="p-3.5">Preço</th>
                    <th className="p-3.5">Destaque</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 pr-5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredItems.map((item) => {
                    const img = item.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=200&auto=format&fit=crop&q=80';
                    return (
                      <tr key={item.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 pl-5">
                          <div className="flex items-center space-x-3">
                            <img
                              src={img}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-800"
                              referrerPolicy="no-referrer"
                            />
                            <div className="min-w-0 max-w-xs">
                              <div className="font-semibold text-white truncate text-xs sm:text-sm">
                                {item.title}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate">
                                {item.itemType === 'veiculo' && `${item.yearFab}/${item.yearModel} • ${formatNumber(item.mileage)} km`}
                                {item.itemType === 'imovel' && `${item.areaUtil}m² • ${item.bedrooms} qtos • ${item.neighborhood}`}
                                {item.itemType === 'produto' && `SKU: ${item.sku || 'N/A'}`}
                                {item.itemType === 'servico' && `Duração: ${item.estimatedDuration || 'A combinar'}`}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 capitalize text-slate-400">
                          {item.itemType === 'veiculo' && `${item.brand} • ${item.fuel}`}
                          {item.itemType === 'imovel' && `${item.propertyType} (${item.transactionType})`}
                          {item.itemType === 'produto' && item.category}
                          {item.itemType === 'servico' && item.category}
                        </td>

                        <td className="p-3.5 font-bold text-white">
                          {item.itemType === 'servico' && item.priceType === 'sob_consulta'
                            ? 'Sob Consulta'
                            : formatCurrency(item.price)}
                        </td>

                        <td className="p-3.5">
                          <button
                            onClick={() => toggleItemFeatured(item.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              item.featured
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                                : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
                            }`}
                            title="Alternar Destaque na Home"
                          >
                            <Sparkles className="h-4 w-4" />
                          </button>
                        </td>

                        <td className="p-3.5">
                          <select
                            value={item.status as any}
                            onChange={(e) => updateItemStatus(item.id, e.target.value)}
                            className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-800 capitalize focus:outline-none"
                          >
                            <option value="disponivel">Disponível</option>
                            <option value="ativo">Ativo</option>
                            <option value="reservado">Reservado</option>
                            <option value="vendido">Vendido</option>
                            <option value="alugado">Alugado</option>
                            <option value="esgotado">Esgotado</option>
                            <option value="pausado">Pausado</option>
                          </select>
                        </td>

                        <td className="p-3.5 pr-5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => onEditItem(item)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
                              title="Editar Anúncio"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Deseja excluir "${item.title}"?`)) {
                                  deleteItem(item.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                              title="Excluir Anúncio"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ABA 2: PROPOSTAS & LEADS */}
      {activeTab === 'leads' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Filtrar Status:</span>
              <select
                value={leadStatusFilter}
                onChange={(e) => setLeadStatusFilter(e.target.value)}
                className="bg-slate-950 text-slate-200 text-xs px-3 py-1.5 rounded-xl border border-slate-800"
              >
                <option value="todos">Todos ({totalLeads})</option>
                <option value="novo">Novos ({newLeads})</option>
                <option value="em_contato">Em Contato</option>
                <option value="fechado">Fechados / Ganhos</option>
                <option value="arquivado">Arquivados</option>
              </select>
            </div>

            <div className="text-xs text-slate-400">
              Propostas enviadas por clientes através da vitrine
            </div>
          </div>

          {filteredLeads.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Mail className="h-10 w-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-medium text-slate-300">Nenhuma proposta nesta categoria</p>
              <p className="text-xs text-slate-500 mt-1">
                Quando um cliente preencher a proposta formal de compra, ela aparecerá listada aqui.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {filteredLeads.map((lead) => {
                const waReplyUrl = generateProposalWhatsAppLink(lead, activeStore);
                return (
                  <div key={lead.id} className="p-5 hover:bg-slate-800/30 transition space-y-3">
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-sm">
                          {lead.clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-white">{lead.clientName}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                              lead.status === 'novo' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                              lead.status === 'fechado' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                              'bg-slate-800 text-slate-400'
                            }`}>
                              {lead.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400">
                            {lead.clientPhone} • {lead.clientEmail}
                          </div>
                        </div>
                      </div>

                      <div className="text-right text-xs text-slate-400">
                        <span>{new Date(lead.createdAt).toLocaleDateString('pt-BR')}</span> às{' '}
                        <span>{new Date(lead.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>

                    {/* Dados da Proposta */}
                    <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 text-xs space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2 font-medium">
                        <span className="text-slate-300">
                          Item: <strong className="text-white">{lead.itemTitle}</strong>
                        </span>
                        <span className="text-emerald-400 font-bold text-sm">
                          Proposta: {lead.proposalValue ? formatCurrency(lead.proposalValue) : formatCurrency(lead.itemPrice)}
                        </span>
                      </div>

                      <div className="text-slate-400">
                        Forma de Pagamento: <strong className="text-slate-200 capitalize">{lead.paymentMethod.replace('_', ' ')}</strong>
                      </div>

                      {lead.tradeDetails && (
                        <div className="text-slate-400">
                          Bem na Troca: <span className="text-amber-300">{lead.tradeDetails}</span>
                        </div>
                      )}

                      {lead.clientMessage && (
                        <div className="pt-1.5 border-t border-slate-800 text-slate-300 italic">
                          "{lead.clientMessage}"
                        </div>
                      )}
                    </div>

                    {/* Ações do Lead */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-slate-400">Alterar Status:</span>
                        <select
                          value={lead.status}
                          onChange={(e) => updateLeadStatus(lead.id, e.target.value as any)}
                          className="bg-slate-950 text-slate-200 text-xs px-2.5 py-1 rounded-lg border border-slate-800"
                        >
                          <option value="novo">Novo</option>
                          <option value="em_contato">Em Contato</option>
                          <option value="fechado">Fechado / Ganho</option>
                          <option value="arquivado">Arquivado</option>
                        </select>
                      </div>

                      <div className="flex items-center space-x-2">
                        {lead.clientPhone && (
                          <a
                            href={waReplyUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                            <span>Responder no WhatsApp</span>
                          </a>
                        )}

                        <button
                          onClick={() => {
                            if (confirm('Excluir este registro de proposta?')) {
                              deleteLead(lead.id);
                            }
                          }}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 transition"
                          title="Excluir Lead"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ABA 3: BACKUP & RESTAURAÇÃO JSON */}
      {activeTab === 'backup' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h3 className="text-base font-bold text-white mb-1">Backup & Restauração dos Dados</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Todos os seus dados (as 4 lojas, itens cadastrados e propostas de clientes) ficam salvos no seu próprio navegador e podem ser exportados para um arquivo JSON seguro a qualquer momento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Exportar */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2.5 text-blue-400 font-semibold text-sm">
                <Download className="h-5 w-5" />
                <span>Exportar Dados (Download JSON)</span>
              </div>
              <p className="text-xs text-slate-400">
                Baixe uma cópia completa de segurança contendo todas as lojas, anúncios e leads recebidos.
              </p>
              <button
                onClick={handleExport}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Download className="h-4 w-4" />
                <span>Baixar Arquivo JSON de Backup</span>
              </button>
            </div>

            {/* Importar */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center space-x-2.5 text-emerald-400 font-semibold text-sm">
                <Upload className="h-5 w-5" />
                <span>Restaurar / Importar JSON</span>
              </div>
              <textarea
                rows={3}
                placeholder="Cole o código JSON do seu backup aqui..."
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full bg-slate-900 text-slate-200 text-xs font-mono p-2.5 rounded-xl border border-slate-800 focus:outline-none"
              />
              {importStatus && (
                <div className={`text-xs ${importStatus.includes('sucesso') ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {importStatus}
                </div>
              )}
              <button
                onClick={handleImport}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition"
              >
                <Upload className="h-4 w-4" />
                <span>Restaurar Backup</span>
              </button>
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Precisa resetar para os 4 modelos de demonstração originais?
            </span>
            <button
              onClick={() => {
                if (confirm('Tem certeza que deseja restaurar as lojas de demonstração padrão?')) {
                  resetToDefaults();
                }
              }}
              className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Restaurar Modelos Padrão</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
