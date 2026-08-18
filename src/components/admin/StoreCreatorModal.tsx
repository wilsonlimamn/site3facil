import React, { useState } from 'react';
import { 
  X, 
  Car, 
  Home, 
  ShoppingBag, 
  Briefcase, 
  KeyRound,
  Sparkles, 
  Check, 
  ArrowRight, 
  Store 
} from 'lucide-react';
import { StoreType, StoreProfile } from '../../types/store';
import { useStoreContext } from '../../context/StoreContext';

interface StoreCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StoreCreatorModal: React.FC<StoreCreatorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createStore } = useStoreContext();

  const [selectedType, setSelectedType] = useState<StoreType>('veiculo');
  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [slogan, setSlogan] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('São Paulo');
  const [state, setState] = useState('SP');
  const [bannerUrl, setBannerUrl] = useState('');

  if (!isOpen) return null;

  const modelOptions = [
    {
      type: 'veiculo' as StoreType,
      title: 'Loja de Veículos & Autos',
      description: 'Carros, motos e seminovos com ano, km, câmbio e tabela FIPE',
      icon: Car,
      color: 'from-red-600 to-rose-700',
      badge: 'Automotivo',
      defaultBanner: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1600&auto=format&fit=crop&q=80',
    },
    {
      type: 'imovel' as StoreType,
      title: 'Imobiliária & Corretores',
      description: 'Casas, apartamentos e terrenos com m², quartos, suítes e condomínio',
      icon: Home,
      color: 'from-emerald-600 to-teal-700',
      badge: 'Imóveis',
      defaultBanner: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&auto=format&fit=crop&q=80',
    },
    {
      type: 'produto' as StoreType,
      title: 'Loja de Produtos Físicos',
      description: 'E-commerce e catálogo com estoque, variações, promoções e SKU',
      icon: ShoppingBag,
      color: 'from-blue-600 to-indigo-700',
      badge: 'Varejo',
      defaultBanner: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1600&auto=format&fit=crop&q=80',
    },
    {
      type: 'servico' as StoreType,
      title: 'Prestador de Serviços',
      description: 'Consultorias, design, reformas e projetos com portfólio e escopo',
      icon: Briefcase,
      color: 'from-purple-600 to-violet-700',
      badge: 'Serviços',
      defaultBanner: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=80',
    },
    {
      type: 'locadora' as StoreType,
      title: 'Locadora & Frotas',
      description: 'Aluguel de veículos e máquinas por diária, semanal ou mensal com KM Livre',
      icon: KeyRound,
      color: 'from-amber-600 to-orange-700',
      badge: 'Locação',
      defaultBanner: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&auto=format&fit=crop&q=80',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim() || !email.trim()) return;

    const matchedOption = modelOptions.find((m) => m.type === selectedType);
    const finalBanner = bannerUrl.trim() || matchedOption?.defaultBanner || '';

    const themeColors: Record<StoreType, string> = {
      veiculo: '#dc2626',
      imovel: '#0f766e',
      produto: '#2563eb',
      servico: '#7c3aed',
      locadora: '#f59e0b',
    };

    createStore({
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      type: selectedType,
      name: name.trim(),
      slogan: slogan.trim() || 'Qualidade, procedência e excelência no atendimento',
      description: `Bem-vindo à ${name}. Entre em contato conosco pelo WhatsApp ou solicite uma proposta formal.`,
      bannerUrl: finalBanner,
      themeColor: themeColors[selectedType],
      phone: whatsapp.trim(),
      whatsapp: whatsapp.replace(/\D/g, ''),
      email: email.trim(),
      city: city.trim(),
      state: state.trim(),
      enableWhatsApp: true,
      enableEmailProposal: true,
      currency: 'BRL',
      // Dados do Cliente & Assinatura SaaS
      ownerName: ownerName.trim() || name.trim(),
      ownerEmail: email.trim(),
      ownerPhone: whatsapp.trim(),
      plan: selectedPlan,
      planName: selectedPlan === 'starter' ? 'Starter' : selectedPlan === 'pro' ? 'Profissional' : 'Enterprise',
      monthlyFee: selectedPlan === 'starter' ? 49.90 : selectedPlan === 'pro' ? 99.90 : 199.90,
      subscriptionStatus: 'ativo',
      isPublished: true,
      nextDueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Store className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                Criar Nova Loja / Catálogo
              </h3>
              <p className="text-xs text-slate-400">
                Selecione um dos 5 modelos e preencha os dados da sua empresa
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Passo 1: Seleção do Modelo */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              1. Selecione o Modelo de Negócio (5 opções especializadas)
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {modelOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.type;
                return (
                  <div
                    key={opt.type}
                    onClick={() => setSelectedType(opt.type)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-600/10 shadow-lg shadow-blue-500/10'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className={`p-2.5 rounded-xl bg-gradient-to-br ${opt.color} text-white shadow-md`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                        {opt.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-0.5">{opt.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{opt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Passo 2: Dados da Empresa & Cliente */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              2. Dados da Empresa & Cliente Lojista
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1">Nome da Loja / Empresa *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: RentPro Locadora, Elite Motors"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Nome do Cliente / Responsável</label>
                <input
                  type="text"
                  placeholder="Ex: Carlos Eduardo Silva"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Plano de Assinatura SaaS</label>
                <select
                  value={selectedPlan}
                  onChange={(e) => setSelectedPlan(e.target.value as any)}
                  className="w-full bg-slate-950 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="starter">Plano Starter (R$ 49,90/mês)</option>
                  <option value="pro">Plano Profissional (R$ 99,90/mês)</option>
                  <option value="enterprise">Plano Enterprise (R$ 199,90/mês)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Slogan ou Subtítulo</label>
                <input
                  type="text"
                  placeholder="Ex: Qualidade e procedência garantida"
                  value={slogan}
                  onChange={(e) => setSlogan(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">WhatsApp para Vendas (com DDD) *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 11987654321"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">E-mail para Receber Propostas *</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: contato@minhaloja.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Cidade</label>
                <input
                  type="text"
                  placeholder="Ex: São Paulo"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1">Estado (UF)</label>
                <input
                  type="text"
                  placeholder="Ex: SP"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full bg-slate-950 text-slate-200 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-md transition"
            >
              <span>Criar Loja</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
