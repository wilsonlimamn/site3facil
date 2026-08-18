import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Mail, 
  Share2, 
  MapPin, 
  Sparkles, 
  CheckCircle2, 
  Calendar, 
  Gauge, 
  Fuel, 
  ShieldCheck, 
  Maximize2, 
  Bed, 
  Bath, 
  Car as CarIcon, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Tag,
  Check,
  Building,
  FileText,
  Users,
  Shield,
  KeyRound,
  Calculator
} from 'lucide-react';
import { StoreItem, StoreProfile } from '../../types/store';
import { formatCurrency, formatNumber, generateWhatsAppLink } from '../../utils/formatters';

interface ItemDetailModalProps {
  item: StoreItem | null;
  store: StoreProfile;
  isOpen: boolean;
  onClose: () => void;
  onOpenProposal: (item: StoreItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  store,
  isOpen,
  onClose,
  onOpenProposal,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [simulationDays, setSimulationDays] = useState(3);

  if (!isOpen || !item) return null;

  const images = item.images && item.images.length > 0
    ? item.images
    : ['https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1000&auto=format&fit=crop&q=80'];

  const waUrl = store.whatsapp ? generateWhatsAppLink(store.whatsapp, item, store) : '#';

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Header do Modal */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {item.itemType === 'veiculo' && 'Detalhes do Veículo'}
              {item.itemType === 'imovel' && 'Ficha Técnica do Imóvel'}
              {item.itemType === 'produto' && 'Detalhes do Produto'}
              {item.itemType === 'servico' && 'Detalhes do Serviço'}
              {item.itemType === 'locadora' && 'Ficha de Locação & Reserva'}
            </span>
            {item.featured && (
              <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Destaque
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Copiar Link"
            >
              {copiedLink ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Corpo com Scroll */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1">
          
          {/* Galeria de Fotos */}
          <div className="space-y-3">
            <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden bg-slate-950">
              <img
                src={images[activeImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />

              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 transition border border-slate-700/60"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 text-white hover:bg-slate-900 transition border border-slate-700/60"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
            </div>

            {/* Miniaturas */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      activeImageIndex === idx ? 'border-blue-500 scale-105' : 'border-slate-800 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Cabeçalho do Anúncio & Preço */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                {item.title}
              </h1>

              {item.itemType === 'locadora' && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <span className="text-amber-400 font-semibold">{item.rentalCategory}</span>
                  <span>•</span>
                  <span className="capitalize">{item.transmission || 'Manual'}</span>
                  <span>•</span>
                  <span>{item.mileagePolicy === 'km_livre' ? 'Quilometragem Livre' : `${item.mileageLimitPerDay} km/dia`}</span>
                </div>
              )}

              {item.itemType === 'imovel' && (
                <p className="flex items-center gap-1.5 text-sm text-slate-400">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>{item.address ? `${item.address} - ` : ''}{item.neighborhood}, {item.city} - {item.state}</span>
                </p>
              )}

              {item.itemType === 'veiculo' && (
                <p className="text-sm text-slate-400">
                  {item.brand} {item.model} {item.version || ''} • Ano {item.yearFab}/{item.yearModel}
                </p>
              )}
            </div>

            {/* Bloco de Preços */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left md:text-right shrink-0">
              {item.itemType === 'locadora' ? (
                <div>
                  <span className="text-xs text-slate-400 block">Diária Padrão</span>
                  <div className="flex items-baseline md:justify-end gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400">
                      {formatCurrency(item.price)}
                    </span>
                    <span className="text-xs text-slate-400">/dia</span>
                  </div>
                  {item.monthlyPrice && (
                    <span className="text-xs text-slate-400 block mt-1">
                      Assinatura Mensal: <strong className="text-slate-200">{formatCurrency(item.monthlyPrice)}</strong>
                    </span>
                  )}
                </div>
              ) : item.itemType === 'servico' && item.priceType === 'sob_consulta' ? (
                <span className="text-xl font-bold text-purple-400">Sob Consulta</span>
              ) : item.itemType === 'servico' && item.priceType === 'a_partir_de' ? (
                <div>
                  <span className="text-xs text-slate-400 block">A partir de</span>
                  <span className="text-2xl font-bold text-white">{formatCurrency(item.price)}</span>
                </div>
              ) : item.itemType === 'produto' && item.promotionalPrice ? (
                <div>
                  <span className="text-xs text-slate-500 line-through block">{formatCurrency(item.price)}</span>
                  <span className="text-2xl font-bold text-emerald-400">{formatCurrency(item.promotionalPrice)}</span>
                </div>
              ) : (
                <div>
                  <span className="text-xs text-slate-400 block">
                    {item.itemType === 'imovel' ? (item.transactionType === 'venda' ? 'Valor de Venda' : 'Aluguel Mensal') : 'Valor'}
                  </span>
                  <span className="text-2xl sm:text-3xl font-black text-white">{formatCurrency(item.price)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Simulador de Diárias para LOCADORA */}
          {item.itemType === 'locadora' && (
            <div className="bg-slate-950/80 border border-amber-500/20 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-3">
                <Calculator className="h-4 w-4" />
                <span>Simulador Rápido de Locação</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Período de Diárias:</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min={item.minRentalDays || 1}
                      max={30}
                      value={simulationDays}
                      onChange={(e) => setSimulationDays(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                    <span className="text-sm font-bold text-white font-mono shrink-0 w-12 text-right">
                      {simulationDays} {simulationDays === 1 ? 'dia' : 'dias'}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block">Total Estimado ({simulationDays} diárias)</span>
                  <span className="text-lg font-bold text-white">
                    {formatCurrency(item.price * simulationDays)}
                  </span>
                </div>

                <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block">Caução Obrigatória</span>
                  <span className="text-sm font-semibold text-slate-300">
                    {formatCurrency(item.depositRequired || 0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* FICHA TÉCNICA ESPECÍFICA DE CADA MODELO */}

          {/* 1. LOCADORA */}
          {item.itemType === 'locadora' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Itens & Serviços Inclusos na Locação
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.includedServices.map((serv, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                    <span>{serv}</span>
                  </div>
                ))}
              </div>

              {item.requirements && item.requirements.length > 0 && (
                <div className="pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Requisitos para Retirada
                  </h4>
                  <div className="space-y-1 text-xs text-slate-400">
                    {item.requirements.map((req, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. VEÍCULOS */}
          {item.itemType === 'veiculo' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Especificações Técnicas
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Quilometragem</span>
                  <span className="text-sm font-semibold text-slate-200">{formatNumber(item.mileage)} km</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Câmbio</span>
                  <span className="text-sm font-semibold text-slate-200 capitalize">{item.transmission}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Combustível</span>
                  <span className="text-sm font-semibold text-slate-200 capitalize">{item.fuel}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Cor</span>
                  <span className="text-sm font-semibold text-slate-200">{item.color}</span>
                </div>
              </div>

              {item.accessories && item.accessories.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Opcionais & Acessórios
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.accessories.map((acc, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{acc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. IMÓVEIS */}
          {item.itemType === 'imovel' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                Características do Imóvel
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Área Útil</span>
                  <span className="text-sm font-semibold text-slate-200">{item.areaUtil} m²</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Quartos / Suítes</span>
                  <span className="text-sm font-semibold text-slate-200">{item.bedrooms} qtos ({item.suites} suítes)</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Banheiros</span>
                  <span className="text-sm font-semibold text-slate-200">{item.bathrooms} banheiros</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block uppercase">Vagas</span>
                  <span className="text-sm font-semibold text-slate-200">{item.garageSpots} vagas</span>
                </div>
              </div>

              {item.amenities && item.amenities.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Lazer & Comodidades
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {item.amenities.map((am, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        <span>{am}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 4. SERVIÇOS */}
          {item.itemType === 'servico' && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
                O que está incluso neste pacote:
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {item.includedItems?.map((inc, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                    <CheckCircle2 className="h-4 w-4 text-purple-400 shrink-0 mt-0.5" />
                    <span>{inc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Descrição Geral */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Descrição Completa
            </h3>
            <div className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-2xl border border-slate-800 whitespace-pre-line">
              {item.description}
            </div>
          </div>

        </div>

        {/* Footer com CTA Direta */}
        <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>Atendimento direto com a equipe de </span>
            <strong className="text-slate-200">{store.name}</strong>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {store.enableEmailProposal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenProposal(item);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition"
              >
                <Mail className="h-4 w-4 text-blue-400" />
                <span>{item.itemType === 'locadora' ? 'Solicitar Cotação por E-mail' : 'Enviar Proposta por E-mail'}</span>
              </button>
            )}

            {store.enableWhatsApp && store.whatsapp && (
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none flex items-center justify-center space-x-2 py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 transition active:scale-95"
              >
                <MessageCircle className="h-4 w-4" />
                <span>{item.itemType === 'locadora' ? 'Reservar no WhatsApp' : 'Chamar no WhatsApp'}</span>
              </a>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
