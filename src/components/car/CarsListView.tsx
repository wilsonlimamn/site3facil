import React, { useState } from 'react';
import { 
  Car as CarIcon, 
  Plus, 
  Gauge, 
  Calendar, 
  Trash2, 
  Edit3, 
  Check, 
  Sparkles,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';
import { useCarContext } from '../../context/CarContext';
import { Car } from '../../types/car';

interface CarsListViewProps {
  onOpenAddCar: () => void;
  onOpenEditCar: (car: Car) => void;
  onOpenUpdateKmForCar: (carId: string) => void;
}

export const CarsListView: React.FC<CarsListViewProps> = ({
  onOpenAddCar,
  onOpenEditCar,
  onOpenUpdateKmForCar,
}) => {
  const { 
    cars, 
    selectedCarId, 
    setSelectedCarId, 
    deleteCar, 
    alerts 
  } = useCarContext();

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center space-x-2">
            <CarIcon className="h-6 w-6 text-blue-400" />
            <span>Meus Veículos Cadastrados</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Cada usuário gerencia de forma privada seus próprios carros, motos ou utilitários
          </p>
        </div>

        <button
          onClick={onOpenAddCar}
          className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="h-4 w-4" />
          <span>Cadastrar Novo Carro</span>
        </button>
      </div>

      {/* Grid of Cars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cars.map((car) => {
          const isSelected = car.id === selectedCarId;
          const carAlerts = alerts.filter(a => a.carId === car.id);
          const criticalCount = carAlerts.filter(a => a.status === 'vencido').length;
          const warningCount = carAlerts.filter(a => a.status === 'atencao').length;

          return (
            <div
              key={car.id}
              className={`p-6 rounded-2xl border transition shadow-md flex flex-col justify-between space-y-5 ${
                isSelected
                  ? 'bg-slate-900 border-blue-500/80 ring-1 ring-blue-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                
                {/* Header row with Placa and Select badge */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-blue-400">
                    {car.placa}
                  </span>

                  {isSelected ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      <Check className="h-3.5 w-3.5" />
                      <span>Veículo Ativo</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => setSelectedCarId(car.id)}
                      className="text-xs text-slate-400 hover:text-white transition px-2.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700"
                    >
                      Selecionar este
                    </button>
                  )}
                </div>

                {/* Nickname & Model */}
                <div>
                  <h3 className="text-xl font-bold text-white">{car.apelido}</h3>
                  <p className="text-xs text-slate-400">
                    {car.marca} {car.modelo} • Ano {car.ano} • {car.combustivel}
                  </p>
                </div>

                {/* Odometer & Projections */}
                <div className="grid grid-cols-2 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Hodômetro Atual</span>
                    <span className="text-lg font-bold font-mono text-white">
                      {car.kmAtual.toLocaleString('pt-BR')} <span className="text-xs text-slate-400">km</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] block">Média de Rodagem</span>
                    <span className="font-medium text-slate-300">
                      ~{car.kmMediaMensal.toLocaleString('pt-BR')} km/mês
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2">
                  {criticalCount > 0 ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                      {criticalCount} manutenção(ões) vencida(s)
                    </span>
                  ) : warningCount > 0 ? (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {warningCount} revisão(ões) próxima(s)
                    </span>
                  ) : (
                    <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Manutenções em dia
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => {
                    if (confirm(`Deseja excluir o veículo ${car.apelido}? Todos os dados associados serão apagados.`)) {
                      deleteCar(car.id);
                    }
                  }}
                  className="text-slate-500 hover:text-rose-400 p-1.5 transition"
                  title="Excluir carro"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenUpdateKmForCar(car.id)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1.5"
                  >
                    <Gauge className="h-3.5 w-3.5 text-blue-400" />
                    <span>Ajustar KM</span>
                  </button>

                  <button
                    onClick={() => onOpenEditCar(car)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition flex items-center space-x-1.5"
                  >
                    <Edit3 className="h-3.5 w-3.5" />
                    <span>Editar</span>
                  </button>
                </div>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
