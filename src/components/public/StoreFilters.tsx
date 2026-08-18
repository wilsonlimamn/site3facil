import React from 'react';
import { Filter, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { StoreType } from '../../types/store';

export interface FilterState {
  category: string;
  priceSort: 'none' | 'asc' | 'desc';
  propertyTransaction: 'todos' | 'venda' | 'aluguel';
  propertyType: string;
  minBedrooms: number;
  vehicleTransmission: string;
  vehicleFuel: string;
  rentalMileage: string;
  onlyInStock: boolean;
  onlyFeatured: boolean;
}

interface StoreFiltersProps {
  storeType: StoreType;
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onResetFilters: () => void;
  categories: string[];
}

export const StoreFilters: React.FC<StoreFiltersProps> = ({
  storeType,
  filters,
  onFilterChange,
  onResetFilters,
  categories,
}) => {
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-4 mb-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <div className="flex items-center gap-1.5 text-slate-300">
          <SlidersHorizontal className="h-4 w-4 text-blue-400" />
          <span>Filtros do Catálogo</span>
        </div>
        <button
          onClick={onResetFilters}
          className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition font-normal"
        >
          <RotateCcw className="h-3 w-3" />
          <span>Limpar</span>
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-3">
        
        {/* 1. Ordenação por Preço / Diária */}
        <div>
          <label className="block text-[11px] font-medium text-slate-400 mb-1">
            {storeType === 'locadora' ? 'Valor da Diária' : 'Ordenar por'}
          </label>
          <select
            value={filters.priceSort}
            onChange={(e) => updateFilter('priceSort', e.target.value as any)}
            className="w-full bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-2.5 py-2 focus:outline-none focus:border-blue-500"
          >
            <option value="none">Padrão (Mais recentes)</option>
            <option value="asc">Menor Preço</option>
            <option value="desc">Maior Preço</option>
          </select>
        </div>

        {/* 2. Categorias (Produtos, Serviços, Locadoras) */}
        {(storeType === 'produto' || storeType === 'servico' || storeType === 'locadora') && categories.length > 0 && (
          <div>
            <label className="block text-[11px] font-medium text-slate-400 mb-1">
              {storeType === 'locadora' ? 'Categoria da Frota' : 'Categoria'}
            </label>
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-2.5 py-2 focus:outline-none focus:border-blue-500"
            >
              <option value="">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 3. Filtros Exclusivos para LOCADORA */}
        {storeType === 'locadora' && (
          <>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Câmbio</label>
              <select
                value={filters.vehicleTransmission}
                onChange={(e) => updateFilter('vehicleTransmission', e.target.value)}
                className="w-full bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-2.5 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos</option>
                <option value="automatico">Automático</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Política de KM</label>
              <select
                value={filters.rentalMileage}
                onChange={(e) => updateFilter('rentalMileage', e.target.value)}
                className="w-full bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-2.5 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Todas as Políticas</option>
                <option value="km_livre">Quilometragem Livre</option>
                <option value="km_controlado">KM Controlado</option>
              </select>
            </div>
          </>
        )}

        {/* 4. Filtros Exclusivos para IMÓVEIS */}
        {storeType === 'imovel' && (
          <>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Finalidade</label>
              <select
                value={filters.propertyTransaction}
                onChange={(e) => updateFilter('propertyTransaction', e.target.value as any)}
                className="w-full bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-2.5 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="todos">Venda ou Aluguel</option>
                <option value="venda">Apenas Venda</option>
                <option value="aluguel">Apenas Aluguel</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Tipo de Imóvel</label>
              <select
                value={filters.propertyType}
                onChange={(e) => updateFilter('propertyType', e.target.value)}
                className="w-full bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-2.5 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos os Tipos</option>
                <option value="apartamento">Apartamento</option>
                <option value="casa">Casa</option>
                <option value="cobertura">Cobertura</option>
                <option value="terreno">Terreno</option>
                <option value="comercial">Comercial</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Mínimo Quartos</label>
              <select
                value={filters.minBedrooms}
                onChange={(e) => updateFilter('minBedrooms', Number(e.target.value))}
                className="w-full bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-2.5 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value={0}>Qualquer quantidade</option>
                <option value={1}>1+ Quarto</option>
                <option value={2}>2+ Quartos</option>
                <option value={3}>3+ Quartos</option>
                <option value={4}>4+ Quartos</option>
              </select>
            </div>
          </>
        )}

        {/* 5. Filtros Exclusivos para VEÍCULOS (Venda) */}
        {storeType === 'veiculo' && (
          <>
            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Câmbio</label>
              <select
                value={filters.vehicleTransmission}
                onChange={(e) => updateFilter('vehicleTransmission', e.target.value)}
                className="w-full bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-2.5 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos os Câmbios</option>
                <option value="automatico">Automático / CVT</option>
                <option value="manual">Manual</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-slate-400 mb-1">Combustível</label>
              <select
                value={filters.vehicleFuel}
                onChange={(e) => updateFilter('vehicleFuel', e.target.value)}
                className="w-full bg-slate-950 text-slate-300 text-xs rounded-xl border border-slate-800 px-2.5 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="">Todos os Combustíveis</option>
                <option value="flex">Flex (Gasolina/Etanol)</option>
                <option value="gasolina">Gasolina</option>
                <option value="diesel">Diesel</option>
                <option value="hibrido">Híbrido / Elétrico</option>
              </select>
            </div>
          </>
        )}

        {/* 6. Apenas Destaques */}
        <div className="flex items-center pt-5">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filters.onlyFeatured}
              onChange={(e) => updateFilter('onlyFeatured', e.target.checked)}
              className="w-4 h-4 rounded bg-slate-950 border-slate-800 text-blue-600 focus:ring-0"
            />
            <span className="text-xs text-slate-300">Apenas Destaques ⭐</span>
          </label>
        </div>

      </div>
    </div>
  );
};
