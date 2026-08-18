import React, { useState, useEffect } from 'react';
import { Gauge, X, Check } from 'lucide-react';
import { useCarContext } from '../../context/CarContext';

interface UpdateKmModalProps {
  isOpen: boolean;
  onClose: () => void;
  carId?: string;
}

export const UpdateKmModal: React.FC<UpdateKmModalProps> = ({ isOpen, onClose, carId }) => {
  const { cars, selectedCar, updateCarKm } = useCarContext();

  const targetCar = carId ? cars.find(c => c.id === carId) : selectedCar;

  const [kmValue, setKmValue] = useState<number>(0);
  const [observacao, setObservacao] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (targetCar) {
      setKmValue(targetCar.kmAtual);
      setObservacao('');
      setError(null);
    }
  }, [targetCar, isOpen]);

  if (!isOpen || !targetCar) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNaN(kmValue) || kmValue < 0) {
      setError('Por favor, informe uma quilometragem válida.');
      return;
    }

    if (kmValue < targetCar.kmAtual) {
      const confirmLower = confirm(
        `O valor informado (${kmValue.toLocaleString('pt-BR')} km) é menor que o odômetro anterior (${targetCar.kmAtual.toLocaleString('pt-BR')} km). Deseja continuar mesmo assim?`
      );
      if (!confirmLower) return;
    }

    updateCarKm(targetCar.id, kmValue, observacao.trim() || 'Atualização manual do odômetro');
    onClose();
  };

  const handleQuickAdd = (delta: number) => {
    setKmValue(prev => Math.max(0, prev + delta));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
              <Gauge className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Atualizar Hodômetro (KM)</h3>
              <p className="text-xs text-slate-400">{targetCar.apelido} • {targetCar.placa}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Quilometragem Atual do Painel
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                step="1"
                required
                value={kmValue || ''}
                onChange={(e) => setKmValue(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-700 rounded-xl text-xl font-bold font-mono text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Ex: 48500"
              />
              <span className="absolute right-4 top-3.5 text-sm font-semibold text-slate-500">
                KM
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Última leitura registrada: {targetCar.kmAtual.toLocaleString('pt-BR')} km
            </p>
          </div>

          {/* Quick Add Buttons */}
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
              Adicionar Rápido
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleQuickAdd(50)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition border border-slate-700"
              >
                +50 km
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(100)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition border border-slate-700"
              >
                +100 km
              </button>
              <button
                type="button"
                onClick={() => handleQuickAdd(500)}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono transition border border-slate-700"
              >
                +500 km
              </button>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Observação (Opcional)
            </label>
            <input
              type="text"
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Ex: Retorno de viagem a Campinas"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-400 font-medium">{error}</p>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition flex items-center space-x-1.5"
            >
              <Check className="h-4 w-4" />
              <span>Salvar Hodômetro</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
