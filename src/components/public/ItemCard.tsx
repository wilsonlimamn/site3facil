import React from 'react';
import { 
  MessageCircle, 
  Sparkles, 
  MapPin, 
  Gauge, 
  Calendar, 
  Fuel, 
  Tag, 
  CheckCircle2, 
  Bed, 
  Bath, 
  Car as CarIcon, 
  Maximize2, 
  Layers,
  Clock,
  Send,
  Users,
  Shield,
  KeyRound
} from 'lucide-react';
import { StoreItem, StoreProfile } from '../../types/store';
import { formatCurrency, formatNumber, generateWhatsAppLink } from '../../utils/formatters';

interface ItemCardProps {
  item: StoreItem;
  store: StoreProfile;
  onClickDetails: (item: StoreItem) => void;
  onOpenProposal: (item: StoreItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  store,
  onClickDetails,
  onOpenProposal,
}) => {
  const mainImage = item.images && item.images.length > 0
    ? item.images[0]
    : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=80';

  const waUrl = store.whatsapp ? generateWhatsAppLink(store.whatsapp, item, store) : '#';

  return (
    <div className="group bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col flex-1">
      
      {/* Imagem de Capa com Badges */}
      <div 
        onClick={() => onClickDetails(item)}
        className="relative h-48 sm:h-52 w-full overflow-hidden bg-slate-950 cursor-pointer"
      >
        <img
          src={mainImage}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Badges no Topo da Foto */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1">
          <div className="flex flex-wrap gap-1.5">
            {item.featured && (
              <span className="bg-amber-500/90 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Destaque
              </span>
            )}
            {item.itemType === 'locadora' && (
              <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider">
                {item.mileagePolicy === 'km_livre' ? 'KM Livre' : 'Locação'}
              </span>
            )}
            {item.itemType === 'imovel' && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md uppercase tracking-wider ${
                item.transactionType === 'venda' ? 'bg-emerald-600 text-white' : 'bg-blue-600 text-white'
              }`}>
                {item.transactionType === 'venda' ? 'Venda' : 'Aluguel'}
              </span>
            )}
            {item.itemType === 'produto' && item.promotionalPrice && (
              <span className="bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md">
                Oferta
              </span>
            )}
          </div>

          {item.images && item.images.length > 1 && (
            <span className="bg-slate-950/80 text-slate-300 text-[10px] font-medium px-2 py-0.5 rounded-md border border-slate-700/60 backdrop-blur-sm">
              +{item.images.length} fotos
            </span>
          )}
        </div>

        {/* Categoria / Localização Sobreposta */}
        <div className="absolute bottom-2.5 left-2.5 right-2.5 text-xs text-slate-300 truncate">
          {item.itemType === 'locadora' && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-amber-300">
              <KeyRound className="h-3 w-3 text-amber-400 shrink-0" />
              {item.rentalCategory}
            </span>
          )}
          {item.itemType === 'imovel' && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
              <MapPin className="h-3 w-3 text-emerald-400 shrink-0" />
              {item.neighborhood}, {item.city}
            </span>
          )}
          {item.itemType === 'veiculo' && (
            <span className="flex items-center gap-1 text-[11px] font-medium text-slate-200">
              <Calendar className="h-3 w-3 text-red-400 shrink-0" />
              {item.yearFab}/{item.yearModel} • {item.brand}
            </span>
          )}
          {item.itemType === 'produto' && (
            <span className="text-[11px] font-medium text-slate-300">
              {item.category} {item.brand ? `• ${item.brand}` : ''}
            </span>
          )}
          {item.itemType === 'servico' && (
            <span className="text-[11px] font-medium text-slate-300">
              {item.category}
            </span>
          )}
        </div>
      </div>

      {/* Conteúdo do Card */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        
        <div>
          {/* Título */}
          <h3 
            onClick={() => onClickDetails(item)}
            className="text-sm sm:text-base font-semibold text-white group-hover:text-blue-400 transition cursor-pointer line-clamp-2 mb-2 leading-snug"
          >
            {item.title}
          </h3>

          {/* Especificações Rápidas por Nicho */}
          
          {/* 1. LOCADORA */}
          {item.itemType === 'locadora' && (
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 mb-3">
              <div className="flex items-center gap-1 truncate capitalize">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0"></span>
                <span>{item.transmission || 'Manual'}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <Users className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>{item.passengers || 5} lugares</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <Shield className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>Seguro Incluso</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <span className="text-[10px] text-slate-500">Caução:</span>
                <span className="text-[11px] text-slate-300">{formatCurrency(item.depositRequired || 0)}</span>
              </div>
            </div>
          )}

          {/* 2. VEÍCULO (VENDA) */}
          {item.itemType === 'veiculo' && (
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-400 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 mb-3">
              <div className="flex items-center gap-1 truncate">
                <Gauge className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>{formatNumber(item.mileage)} km</span>
              </div>
              <div className="flex items-center gap-1 truncate capitalize">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                <span>{item.transmission}</span>
              </div>
              <div className="flex items-center gap-1 truncate capitalize">
                <Fuel className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                <span>{item.fuel}</span>
              </div>
              <div className="flex items-center gap-1 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                <span>{item.color}</span>
              </div>
            </div>
          )}

          {/* 3. IMÓVEL */}
          {item.itemType === 'imovel' && (
            <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 px-2.5 py-2 rounded-xl border border-slate-800/80 mb-3">
              <div className="flex items-center gap-1" title="Área útil">
                <Maximize2 className="h-3.5 w-3.5 text-slate-500" />
                <span>{item.areaUtil}m²</span>
              </div>
              <div className="flex items-center gap-1" title="Quartos">
                <Bed className="h-3.5 w-3.5 text-slate-500" />
                <span>{item.bedrooms} qtos</span>
              </div>
              <div className="flex items-center gap-1" title="Banheiros">
                <Bath className="h-3.5 w-3.5 text-slate-500" />
                <span>{item.bathrooms} banh</span>
              </div>
              <div className="flex items-center gap-1" title="Vagas de Garagem">
                <CarIcon className="h-3.5 w-3.5 text-slate-500" />
                <span>{item.garageSpots} vg</span>
              </div>
            </div>
          )}

          {/* 4. PRODUTO */}
          {item.itemType === 'produto' && (
            <div className="space-y-1.5 mb-3 text-xs text-slate-400">
              <p className="line-clamp-2 text-slate-400 text-xs">
                {item.description}
              </p>
              {item.colors && item.colors.length > 0 && (
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <span>Cores:</span>
                  <span className="text-slate-300 truncate">{item.colors.join(', ')}</span>
                </div>
              )}
            </div>
          )}

          {/* 5. SERVIÇO */}
          {item.itemType === 'servico' && (
            <div className="space-y-1.5 mb-3 text-xs text-slate-400">
              {item.estimatedDuration && (
                <div className="flex items-center gap-1 text-slate-300 text-xs">
                  <Clock className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <span>Duração: {item.estimatedDuration}</span>
                </div>
              )}
              {item.includedItems && item.includedItems.length > 0 && (
                <div className="text-[11px] text-slate-400 line-clamp-1">
                  ✓ {item.includedItems[0]} e mais
                </div>
              )}
            </div>
          )}
        </div>

        {/* Preço e Botões de Ação */}
        <div className="pt-3 border-t border-slate-800/80">
          
          <div className="flex items-baseline justify-between mb-3">
            <div>
              {item.itemType === 'locadora' ? (
                <div>
                  <span className="text-[10px] text-slate-400 block leading-none">Diária a partir de</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-lg sm:text-xl font-bold text-amber-400">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-xs text-slate-400">/dia</span>
                  </div>
                </div>
              ) : item.itemType === 'servico' && item.priceType === 'sob_consulta' ? (
                <span className="text-sm font-bold text-purple-400">Sob Consulta</span>
              ) : item.itemType === 'servico' && item.priceType === 'a_partir_de' ? (
                <div>
                  <span className="text-[10px] text-slate-400 block leading-none">A partir de</span>
                  <span className="text-base sm:text-lg font-bold text-white">
                    {formatCurrency(item.price)}
                  </span>
                </div>
              ) : item.itemType === 'produto' && item.promotionalPrice ? (
                <div>
                  <span className="text-[11px] text-slate-500 line-through mr-1.5">
                    {formatCurrency(item.price)}
                  </span>
                  <span className="text-base sm:text-lg font-bold text-emerald-400">
                    {formatCurrency(item.promotionalPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-base sm:text-lg font-bold text-white">
                  {formatCurrency(item.price)}
                </span>
              )}
            </div>

            {item.itemType === 'locadora' && item.monthlyPrice && (
              <span className="text-[10px] text-slate-400 font-mono">
                Mês: {formatCurrency(item.monthlyPrice)}
              </span>
            )}
            {item.itemType === 'veiculo' && item.fipePrice && (
              <span className="text-[10px] text-slate-400 font-mono">
                FIPE: {formatCurrency(item.fipePrice)}
              </span>
            )}
          </div>

          {/* Botões de Ação Direta */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onClickDetails(item)}
              className="py-2 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition text-center"
            >
              Ver Detalhes
            </button>

            {store.whatsapp ? (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center space-x-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95 text-center"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>{item.itemType === 'locadora' ? 'Reservar' : 'WhatsApp'}</span>
              </a>
            ) : (
              <button
                onClick={() => onOpenProposal(item)}
                className="flex items-center justify-center space-x-1 py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
              >
                <Send className="h-3.5 w-3.5" />
                <span>{item.itemType === 'locadora' ? 'Cotar' : 'Proposta'}</span>
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
