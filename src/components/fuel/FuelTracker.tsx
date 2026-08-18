import React, { useState } from 'react';
import { 
  Fuel, 
  Plus, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Gauge, 
  Trash2, 
  MapPin, 
  Droplet,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import { useCarContext } from '../../context/CarContext';

interface FuelTrackerProps {
  onOpenAddFuel: () => void;
}

export const FuelTracker: React.FC<FuelTrackerProps> = ({ onOpenAddFuel }) => {
  const { selectedCar, currentCarFuel, deleteFuelRecord } = useCarContext();

  const [fuelTypeFilter, setFuelTypeFilter] = useState('todos');

  if (!selectedCar) return null;

  const totalSpent = currentCarFuel.reduce((sum, f) => sum + f.valorTotal, 0);
  const totalLiters = currentCarFuel.reduce((sum, f) => sum + f.litros, 0);

  const fuelWithKml = currentCarFuel.filter(f => f.kmPorLitroCalculado && f.kmPorLitroCalculado > 0);
  const avgKml = fuelWithKml.length > 0
    ? (fuelWithKml.reduce((sum, f) => sum + (f.kmPorLitroCalculado || 0), 0) / fuelWithKml.length).toFixed(1)
    : '--';

  const fuelWithCostKm = currentCarFuel.filter(f => f.custoPorKm && f.custoPorKm > 0);
  const avgCostKm = fuelWithCostKm.length > 0
    ? (fuelWithCostKm.reduce((sum, f) => sum + (f.custoPorKm || 0), 0) / fuelWithCostKm.length).toFixed(2)
    : '--';

  const filteredFuelings = currentCarFuel.filter(f => {
    if (fuelTypeFilter !== 'todos' && !f.tipoCombustivel.toLowerCase().includes(fuelTypeFilter.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <Fuel className="h-6 w-6 text-emerald-400" />
            <span>Abastecimentos & Consumo (Km/L)</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Controle de consumo de combustível, custo por quilômetro e postos para {selectedCar.apelido}
          </p>
        </div>

        <button
          onClick={onOpenAddFuel}
          className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Registrar Abastecimento</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Rendimento Médio</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {avgKml} <span className="text-xs font-normal text-slate-400">km/L</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Média entre tanques cheios
          </div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Custo Médio / KM</span>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            R$ {avgCostKm} <span className="text-xs font-normal text-slate-400">/km</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Gasto por km percorrido
          </div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Total Litros</span>
            <Droplet className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {totalLiters.toFixed(1)} <span className="text-xs font-normal text-slate-400">L</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            {currentCarFuel.length} abastecimentos
          </div>
        </div>

        <div className="bg-slate-900/70 p-4 rounded-xl border border-slate-800 shadow-sm">
          <div className="text-xs font-medium text-slate-400 flex items-center justify-between">
            <span>Investimento Total</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Gasto total registrado
          </div>
        </div>

      </div>

      {/* Fueling Records List */}
      <div className="space-y-4">
        
        {/* Table or Cards */}
        {filteredFuelings.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 space-y-3">
            <Fuel className="h-8 w-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400">Nenhum abastecimento registrado ainda.</p>
            <button
              onClick={onOpenAddFuel}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition"
            >
              Lançar Primeiro Abastecimento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFuelings.map((fuel) => (
              <div
                key={fuel.id}
                className="bg-slate-900/70 p-4 sm:p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {fuel.tipoCombustivel}
                    </span>
                    {fuel.tanqueCheio && (
                      <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Tanque Cheio
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-500" />
                      <span>{new Date(fuel.data).toLocaleDateString('pt-BR')}</span>
                    </span>

                    <span className="flex items-center space-x-1 font-mono">
                      <Gauge className="h-3.5 w-3.5 text-slate-500" />
                      <span>{fuel.kmMomento.toLocaleString('pt-BR')} km</span>
                    </span>

                    {fuel.posto && (
                      <span className="flex items-center space-x-1 text-slate-300">
                        <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        <span>{fuel.posto}</span>
                      </span>
                    )}
                  </div>

                  {fuel.observacoes && (
                    <p className="text-xs text-slate-400 italic">
                      "{fuel.observacoes}"
                    </p>
                  )}
                </div>

                {/* Metrics on the Right */}
                <div className="flex items-center justify-between sm:justify-end gap-5">
                  
                  {fuel.kmPorLitroCalculado && (
                    <div className="text-right">
                      <div className="text-[10px] uppercase text-slate-500">Rendimento</div>
                      <div className="text-sm font-bold font-mono text-blue-400">
                        {fuel.kmPorLitroCalculado} km/L
                      </div>
                      {fuel.custoPorKm && (
                        <div className="text-[10px] text-slate-500">
                          R$ {fuel.custoPorKm}/km
                        </div>
                      )}
                    </div>
                  )}

                  <div className="text-right min-w-[100px]">
                    <div className="text-[10px] uppercase text-slate-500">
                      {fuel.litros}L • R$ {fuel.precoPorLitro.toFixed(2)}/L
                    </div>
                    <div className="text-base font-bold font-mono text-emerald-400">
                      R$ {fuel.valorTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm('Deseja excluir este abastecimento?')) {
                        deleteFuelRecord(fuel.id);
                      }
                    }}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition"
                    title="Excluir abastecimento"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>

    </div>
  );
};
