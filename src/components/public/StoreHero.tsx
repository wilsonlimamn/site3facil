import React from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Instagram, 
  ShieldCheck, 
  Sparkles, 
  Search,
  MessageCircle
} from 'lucide-react';
import { useStoreContext } from '../../context/StoreContext';

interface StoreHeroProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  totalItemsCount: number;
}

export const StoreHero: React.FC<StoreHeroProps> = ({
  searchTerm,
  onSearchChange,
  totalItemsCount,
}) => {
  const { activeStore } = useStoreContext();

  const cleanPhone = activeStore.whatsapp ? activeStore.whatsapp.replace(/\D/g, '') : '';
  const waUrl = cleanPhone ? `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(`Olá, estou no catálogo da ${activeStore.name} e gostaria de atendimento.`)}` : '#';

  return (
    <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 mb-8 shadow-2xl">
      
      {/* Background Banner com Gradiente Suave */}
      <div className="relative h-48 sm:h-64 w-full overflow-hidden">
        {activeStore.bannerUrl ? (
          <img
            src={activeStore.bannerUrl}
            alt={activeStore.name}
            className="w-full h-full object-cover brightness-[0.45] scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
      </div>

      {/* Conteúdo Principal do Topo da Loja */}
      <div className="relative px-6 sm:px-8 pb-6 -mt-16 sm:-mt-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 pb-6 border-b border-slate-800/80">
          
          {/* Logo e Informações da Marca */}
          <div className="flex items-end space-x-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-800 border-2 border-slate-700 p-1 shadow-2xl overflow-hidden shrink-0">
              {activeStore.logoUrl ? (
                <img
                  src={activeStore.logoUrl}
                  alt={activeStore.name}
                  className="w-full h-full object-cover rounded-xl"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-700 text-white font-bold text-xl">
                  {activeStore.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  {activeStore.name}
                </h1>
                <span className="inline-flex items-center gap-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium px-2 py-0.5 rounded-full">
                  <ShieldCheck className="h-3 w-3" />
                  Verificado
                </span>
              </div>
              <p className="text-sm text-slate-300 font-medium line-clamp-1">
                {activeStore.slogan}
              </p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400 pt-1">
                {activeStore.city && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {activeStore.neighborhood ? `${activeStore.neighborhood}, ` : ''}{activeStore.city} - {activeStore.state}
                  </span>
                )}
                {activeStore.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    {activeStore.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botões de Ação do Topo */}
          <div className="flex items-center space-x-2.5 w-full sm:w-auto pt-2 sm:pt-0">
            {activeStore.whatsapp && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl font-medium text-xs shadow-lg shadow-emerald-600/20 transition active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Atendimento WhatsApp</span>
              </a>
            )}

            {activeStore.instagram && (
              <a
                href={`https://instagram.com/${activeStore.instagram.replace('@', '')}`}
                target="_blank"
                rel="noreferrer"
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-pink-400 border border-slate-700 transition"
                title="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>

        {/* Barra de Busca Rápida no Catálogo */}
        <div className="pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={`Buscar em ${totalItemsCount} anúncios de ${activeStore.name}...`}
              className="w-full bg-slate-950/80 text-sm text-slate-200 pl-10 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500 transition placeholder:text-slate-500"
            />
          </div>

          <div className="text-xs text-slate-400 flex items-center gap-2">
            <span className="font-semibold text-white">{totalItemsCount}</span> itens disponíveis no momento
          </div>
        </div>

      </div>

    </div>
  );
};
